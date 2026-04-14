# 🌄 GulmiGang - Social Network for Gulmi District

**Connect. Learn. Grow.**

A beautiful, Instagram-like social networking platform built specifically for the Gulmi district community in Nepal. Share moments, learn skills, connect with neighbors, and grow together.

## 🚀 Features

- **📱 Instagram-like Feed** - Beautiful, infinite scroll feed with posts, reels, and stories
- **👥 User Profiles** - Customizable profiles with cover photos, bios, and skills
- **💬 Real-time Messaging** - Chat with friends, send media, voice notes
- **🎓 Community Features** - Location-based content for Gulmi community
- **🔔 Notifications** - Real-time updates for all activities
- **🎨 Minimalist Design** - Clean black & white interface
- **🌍 Gulmi-Focused** - Location-specific features and content

## 🏗️ Tech Stack

**Frontend:**
- Vue 3 (Composition API)
- Vite
- Pinia (State Management)
- Vue Router
- Axios
- SCSS

**Backend:**
- Node.js + Express
- MongoDB
- JWT Authentication
- Multer (File Uploads)

**DevOps:**
- Docker & Docker Compose
- Nginx
- MongoDB (Latest)

## 🐳 Quick Start with Docker

### Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)
- 4GB RAM minimum
- 10GB free disk space

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Aakashpuri786/GulmiGang.git
cd GulmiGang
```

2. **Run setup script** (Linux/macOS)
```bash
bash setup-docker.sh
```

**For Windows**, run manually:
```bash
# Copy environment files
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env

# Build and start
docker-compose build
docker-compose up -d
```

3. **Access the application**
- Frontend: http://localhost:5178
- Backend API: http://localhost:5007/api
- MongoDB: mongodb://localhost:27017

### Using Docker Commands

```bash
# Start all services
docker-compose up -d

# Start in development mode with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean everything (including volumes)
docker-compose down -v
```

### Using Makefile (Recommended for Linux/macOS)

```bash
# Start services
make up

# Start in development mode
make dev

# View logs
make logs

# Stop services
make down

# Clean everything
make clean

# Open MongoDB shell
make shell-db

# View all available commands
make help
```

## 📁 Project Structure

```
GulmiGang/
├── backend/
│   ├── models/          # MongoDB models (User, Post, etc.)
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation middleware
│   ├── uploads/         # User uploaded files
│   ├── Dockerfile       # Production Dockerfile
│   ├── Dockerfile.dev   # Development Dockerfile
│   ├── .env.example     # Environment template
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # Vue components
│   │   ├── views/       # Page components
│   │   ├── stores/      # Pinia stores
│   │   ├── router/      # Vue Router config
│   │   ├── config/      # API configuration
│   │   └── assets/      # Static assets
│   ├── Dockerfile       # Production Dockerfile
│   ├── Dockerfile.dev   # Development Dockerfile
│   ├── nginx.conf       # Nginx configuration
│   └── .env.example     # Environment template
├── docker-compose.yml   # Main Docker Compose
├── docker-compose.dev.yml   # Development overrides
├── Makefile             # Utility commands
├── setup-docker.sh      # Setup script
└── README.md           # This file
```

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5007
MONGO_URI=mongodb://admin:gulmigang2024@mongodb:27017/gulmigang?authSource=admin
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5178
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5007/api
VITE_WS_URL=http://localhost:5007
VITE_APP_NAME=GulmiGang
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout user

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts/feed` - Get feed
- `GET /api/posts/user/:userId` - Get user posts
- `POST /api/posts/:postId/like` - Like/unlike post

## 🧪 Development

### Running Locally (without Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Hot Reload

Both frontend and backend support hot reload in development mode via Docker:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
# or
make dev
```

## 📊 Health Checks

### Verify Setup

```bash
# Backend health
curl http://localhost:5007/health

# Frontend accessible
open http://localhost:5178  # or use your browser

# MongoDB accessible
make shell-db
```

### View Logs

```bash
# All services
make logs

# Specific service
make logs-backend
make logs-frontend
make logs-db
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in docker-compose.yml
# Or kill the process using the port
lsof -i :5178  # Find process
kill -9 PID    # Kill process
```

### MongoDB Connection Issues
```bash
# Check MongoDB logs
make logs-db

# Restart MongoDB
docker-compose restart mongodb

# Clean and restart
docker-compose down -v
docker-compose up -d
```

### Clear Everything and Start Fresh
```bash
make clean
docker-compose build --no-cache
docker-compose up -d
```

## 📖 Documentation

For detailed Docker setup and troubleshooting, see [DOCKER_SETUP.md](./DOCKER_SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 Roadmap

- [x] Basic authentication & user profiles
- [x] Feed & posts system
- [ ] Stories & reels
- [ ] Real-time messaging
- [ ] Video calls
- [ ] Skill marketplace
- [ ] Community groups
- [ ] Push notifications
- [ ] PWA support

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Aakash Puri** - Initial work - [@Aakashpuri786](https://github.com/Aakashpuri786)

## 🙏 Acknowledgments

- Inspired by Instagram's beautiful UI/UX
- Built for the amazing Gulmi community
- Thanks to all contributors

## 📞 Support

For support, GitHub Issues or join our community discussions.

---

**Made with ❤️ for Gulmi District**


3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5178
   - Backend API: http://localhost:5000

### Environment Variables

Create a `.env` file in the backend directory:

```
MONGO_URI=mongodb://localhost:27017/gulmigang
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

## Project Structure

```
GulmiGang/
├── frontend/          # Vue.js application
│   ├── src/
│   │   ├── views/     # Page components
│   │   ├── stores/    # Pinia stores
│   │   ├── router/    # Vue Router configuration
│   │   └── api.js     # Axios configuration
├── backend/           # Node.js API
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes
│   ├── middleware/    # Authentication middleware
│   └── server.js      # Main server file
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get user data (protected)

## Development Roadmap

This is Phase 1 (Foundation) of the GulmiGang platform. Future phases include:

- Phase 2: Core Features (Posts, Connections, Search)
- Phase 3: Advanced Features (Real-time messaging, Video calls)
- Phase 4: Community Features (Groups, Skills marketplace)
- Phase 5: Polish & Launch

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is licensed under the MIT License.