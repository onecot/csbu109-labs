// Handlers for the logged-in user's own profile (/api/v1/users/me)
const User = require('../models/user.model');

// PUT /api/v1/users/me  body: { fullName?, age?, gender? }
exports.updateMe = async (req, res, next) => {
  try {
    const changes = {};
    for (const field of ['fullName', 'age', 'gender']) {
      if (req.body[field] !== undefined) changes[field] = req.body[field];
    }

    // Always update the user from the token, never from the body
    const user = await User.findByIdAndUpdate(req.user.id, changes, {
      new: true,
      runValidators: true
    });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/users/me/avatar  multipart/form-data, field name "avatar"
exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Avatar file is required' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`; // served by express.static
    const user = await User.findByIdAndUpdate(req.user.id, { avatarUrl }, { new: true });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
