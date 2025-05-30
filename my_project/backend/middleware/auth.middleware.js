const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');

const verifyToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(403).send({ message: 'No token provided.' });
  }

  jwt.verify(token, jwtConfig.secret, (err, decoded) => {
    if (err) {
      // Differentiate between token expiration and other verification errors
      if (err.name === 'TokenExpiredError') {
        return res.status(401).send({ message: 'Unauthorized! Token has expired.' });
      }
      return res.status(401).send({ message: 'Unauthorized! Invalid token.' });
    }
    // If token is valid, attach decoded payload to request object
    req.user = decoded; // Contains user_id, username, iat, exp
    next();
  });
};

module.exports = {
  verifyToken,
};
