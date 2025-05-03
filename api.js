const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

// Import controllers for artist functionality
const { searchArtists, getArtistDetails, getSimilarArtists } = require('../controllers/artsyController'); // Added getSimilarArtists
// Import controllers for authentication
const { register, login, logout, deleteUser, getMe } = require('../controllers/authController');
// Import controller for artwork categories
const { getArtworkCategories } = require('../controllers/artworkController');
// Import controllers for favorites functionality
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoritesController');

// --------------------------- 
// Artist Functionality Routes
// ---------------------------
// Search route
router.get('/search', searchArtists);

// Artist routes
router.get('/artist/similar/:artistId', getSimilarArtists);
router.get('/artist/:artistId', getArtistDetails);

// Artwork routes
router.get('/artwork/categories/:categoryId', getArtworkCategories);

// --------------------------- 
// Authentication Routes (Public)
// ---------------------------
router.post('/register', register);
router.post('/login', login);

// --------------------------- 
// Protected Authentication Routes (require a valid JWT)
// ---------------------------
router.post('/logout', verifyToken, logout);
router.delete('/account', verifyToken, deleteUser);
router.get('/me', verifyToken, getMe);

// --------------------------- 
// Favorites Routes (Protected)
// ---------------------------
// GET /api/favorites => retrieve the current user's favorites list
router.get('/favorites', verifyToken, getFavorites);
// POST /api/favorites/add => add a favorite artist
router.post('/favorites/add', verifyToken, addFavorite);
// POST /api/favorites/remove => remove a favorite artist by artistId
router.post('/favorites/remove', verifyToken, removeFavorite);

module.exports = router;