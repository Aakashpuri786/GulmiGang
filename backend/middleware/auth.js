const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const bearerToken = req.header('authorization')?.replace(/^Bearer\s+/i, '').trim();
  const token = req.header('x-auth-token') || bearerToken;

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
