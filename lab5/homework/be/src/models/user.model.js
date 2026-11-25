// User: login account + profile. passwordHash is never returned by queries.
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  age: {
    type: Number,
    min: [1, 'Age must be at least 1'],
    max: [150, 'Age cannot exceed 150']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    // Not required: users created through Google Sign-In have no password
    select: false
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['normal', 'admin'],
    default: 'normal'
  }
}, { timestamps: true });

// Extra safety: even if a document is loaded with passwordHash, strip it on output
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
