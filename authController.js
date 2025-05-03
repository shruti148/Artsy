// controllers/authController.js

const jwt = require('jsonwebtoken');         // For signing tokens
const bcrypt = require('bcrypt');            // For hashing and comparing passwords
const crypto = require('crypto');            // For creating a hash for Gravatar
const User = require('../models/User');      // Your User model

// Utility: Create a JWT token that expires in 1 hour
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Utility: Generate Gravatar URL using SHA256 hash
const getGravatarUrl = (email) => {
  const hash = crypto
    .createHash('sha256')
    .update(email.trim().toLowerCase())
    .digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
};

// Registration endpoint
const register = async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { fullName, email, password } = req.body;
    
    if (!fullName || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if a user with the provided email already exists.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a Gravatar URL
    const profileImageUrl = getGravatarUrl(email);

    // Create a new user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      profileImageUrl,
    });

    // Create a JWT token and set it in an HTTP-only cookie valid for 1 hour.
    const token = createToken(user._id);
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
    
    return res.status(201).json({
      fullName: user.fullName,
      email: user.email,
      profileImageUrl,
      favorites: user.favorites || [],
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed.' });
  }
};

// Login endpoint
const login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find the user by email.
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = createToken(user._id);
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
    console.log('User logged in:', user._id);
    return res.status(200).json({
      fullName: user.fullName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      favorites: user.favorites || [],
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
};

// Logout endpoint
const logout = (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out' });
};

// Delete account endpoint
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.clearCookie('token').json({ message: 'Account deleted' });
  } catch (err) {
    console.error('Deletion error:', err);
    res.status(500).json({ error: 'Deletion failed' });
  }
};

// Get current user endpoint (/me)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({
      fullName: user.fullName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      favorites: user.favorites || [],
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Could not fetch user' });
  }
};

module.exports = {
  register,
  login,
  logout,
  deleteUser,
  getMe,
};
