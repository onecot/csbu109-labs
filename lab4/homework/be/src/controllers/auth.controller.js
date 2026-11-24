// Register / login / current profile (JWT)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const signToken = (user) => jwt.sign(
  { id: user._id, type: user.type },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

// POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const { fullName, age, gender, email, password, type } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'fullName, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, age, gender, email, passwordHash, type });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error); // duplicate email -> 409, invalid type/age -> 400
  }
};

// POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    // passwordHash has select:false, so it must be requested explicitly
    const user = await User.findOne({ email }).select('+passwordHash');
    const isMatch = user && await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      data: { token: signToken(user), user }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/auth/me (protected)
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
