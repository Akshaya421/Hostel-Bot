const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authorized, token missing' });
  }
  try {
    const token = auth.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalid or expired' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only' });
  }
  next();
};

const wardenOrAdmin = (req, res, next) => {
  if (!['admin', 'warden'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Warden or Admin access required' });
  }
  next();
};

module.exports = { protect, adminOnly, wardenOrAdmin };
