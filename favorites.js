const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); // Ensure this path is correct
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favoritesController');

// Route to add an artist to favorites (Protected)
router.post('/add', verifyToken, addFavorite);

// Route to remove an artist from favorites (Protected)
router.post('/remove', verifyToken, removeFavorite);

// Route to get the favorites list (Protected)
// Route to get the favorites list (Protected)
router.get('/', verifyToken, getFavorites);

module.exports = router;
