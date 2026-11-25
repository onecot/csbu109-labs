// Must run after requireAuth: blocks every user whose token is not an admin
module.exports = (req, res, next) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: only admin users can perform this action.'
    });
  }
  next();
};
