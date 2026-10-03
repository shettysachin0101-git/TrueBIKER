module.exports = function (req, res, next) {
  // Check if user is authenticated and is an admin
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied: Administrator privileges required' });
  }
};
