// Connect to MongoDB once and reuse the connection
const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopadmin_db';
  await mongoose.connect(uri);
  console.log('MongoDB connected:', uri);
  return mongoose.connection;
}

module.exports = connectDB;
