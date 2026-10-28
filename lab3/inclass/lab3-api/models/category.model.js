// Mongoose schema definition for Category
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name cannot be empty'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
