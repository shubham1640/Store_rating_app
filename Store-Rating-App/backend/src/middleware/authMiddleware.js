const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
console.log("🔑 Auth Header:", req.headers["authorization"]);
console.log("🔑 Token Extracted:", token);

  if (!token) return res.status(401).json({ error: 'Access denied, token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}


module.exports = authenticateToken;
