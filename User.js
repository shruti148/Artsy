const mongoose = require('mongoose');

// Define a sub-schema for a favorite artist
const favoriteSchema = new mongoose.Schema({
  artistId: { 
    type: String, 
    required: true 
  },
  artistName: { 
    type: String, 
    required: true 
  },
  thumbnail: { 
    type: String 
  },
  addedAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Define the main user schema with favorites embedded
const userSchema = new mongoose.Schema({
  fullName: { // Must match what you use in your AuthController
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImageUrl: {
    type: String,
    required: true,
  },
  // This array will store the user's favorite artists
  favorites: [favoriteSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
