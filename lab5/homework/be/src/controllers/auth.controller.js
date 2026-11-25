// Register / login / current profile (JWT)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user.model');
const { ADMINS_ROOM } = require('../socket');

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

    // Live notification for admins only (they alone are in the "admins" room)
    const io = req.app.get('io');
    if (io) {
      io.to(ADMINS_ROOM).emit('newUserRegistered', {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        type: user.type
      });
    }

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
    // Google-only accounts have no password hash
    const isMatch = user && user.passwordHash && await bcrypt.compare(password, user.passwordHash);
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

// POST /api/v1/auth/google  body: { idToken }
// Verifies the Google ID token, then finds-or-creates the user by verified email.
exports.googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required' });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ success: false, message: 'GOOGLE_CLIENT_ID is not configured on the server' });
    }

    let payload;
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid Google token' });
    }

    const { email, name, email_verified } = payload;
    if (!email || !email_verified) {
      return res.status(401).json({ success: false, message: 'Google account email is not verified' });
    }

    // Same account as the email/password login when the email already exists
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName: name || email.split('@')[0],
        email,
        type: 'normal'
      });
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
