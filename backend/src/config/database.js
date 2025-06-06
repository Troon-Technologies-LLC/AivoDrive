/**
 * Database configuration for MongoDB connection
 * Uses Mongoose ODM to connect to MongoDB
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aivodrive';

/**
 * Connect to MongoDB database
 * @returns {Promise} MongoDB connection
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
