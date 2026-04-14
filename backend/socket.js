const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const User = require('./models/User');

let ioInstance = null;

const onlineUsers = new Map();
const socketToUser = new Map();

const toPublicUser = (user) => ({
  _id: user._id.toString(),
  username: user.username,
  fullName: user.fullName,
  profilePicture: user.profilePicture || null,
  location: user.location || null
});

const getOnlineUsers = () => Array.from(onlineUsers.values()).map((entry) => entry.user);

const emitPresence = () => {
  if (ioInstance) {
    ioInstance.emit('presence:update', getOnlineUsers());
  }
};

const initSocket = (httpServer, allowedOrigins) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true
    }
  });

  ioInstance.use(async (socket, next) => {
    try {
      const rawToken = socket.handshake.auth?.token || socket.handshake.headers['x-auth-token'];

      if (!rawToken) {
        return next(new Error('Authentication required'));
      }

      const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.user.id)
        .select('username fullName profilePicture location');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = toPublicUser(user);
      return next();
    } catch (error) {
      return next(new Error('Authentication failed'));
    }
  });

  ioInstance.on('connection', (socket) => {
    const user = socket.user;
    const userId = user._id;
    const existing = onlineUsers.get(userId);

    socket.join(`user:${userId}`);
    socket.join('chat:group');

    onlineUsers.set(userId, {
      user,
      sockets: (existing?.sockets || 0) + 1
    });
    socketToUser.set(socket.id, userId);
    emitPresence();

    socket.on('disconnect', () => {
      const disconnectedUserId = socketToUser.get(socket.id);
      socketToUser.delete(socket.id);

      if (!disconnectedUserId) {
        return;
      }

      const entry = onlineUsers.get(disconnectedUserId);
      if (!entry) {
        return;
      }

      if (entry.sockets <= 1) {
        onlineUsers.delete(disconnectedUserId);
      } else {
        onlineUsers.set(disconnectedUserId, {
          ...entry,
          sockets: entry.sockets - 1
        });
      }

      emitPresence();
    });
  });

  return ioInstance;
};

const emitStoryCreated = (story) => {
  if (ioInstance) {
    ioInstance.emit('stories:created', story);
  }
};

const emitMessageCreated = (message) => {
  if (!ioInstance || !message) {
    return;
  }

  if (message.chatType === 'group') {
    ioInstance.to('chat:group').emit('messages:created', message);
    return;
  }

  const senderId = message.sender?._id?.toString?.() || message.sender?.toString?.();
  const recipientId = message.recipient?._id?.toString?.() || message.recipient?.toString?.();

  if (senderId) {
    ioInstance.to(`user:${senderId}`).emit('messages:created', message);
  }

  if (recipientId) {
    ioInstance.to(`user:${recipientId}`).emit('messages:created', message);
  }
};

module.exports = {
  emitMessageCreated,
  emitStoryCreated,
  getOnlineUsers,
  initSocket
};
