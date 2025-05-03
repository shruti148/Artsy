const User = require('../models/User');

// Function to add an artist to the user's favorites list
exports.addFavorite = async (req, res) => {
  const { artistId, artistName, thumbnail } = req.body;

  // Validate required fields
  if (!artistId || !artistName) {
    return res.status(400).json({ error: 'Artist ID and artist name are required.' });
  }

  try {
    // Get the user using the id from the JWT payload (set by verifyToken middleware)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Prevent adding duplicate favorites
    if (user.favorites.some(fav => fav.artistId === artistId)) {
      return res.status(400).json({ error: 'Artist already in favorites.' });
    }

    // Add the favorite (the addedAt field is set automatically by default)
    user.favorites.push({ artistId, artistName, thumbnail });
    await user.save();

    // Return the updated favorites list along with a success message
    return res.json({
      message: 'Artist added to favorites.',
      favorites: user.favorites
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return res.status(500).json({ error: 'Error adding favorite.' });
  }
};

// Function to remove an artist from the favorites list
exports.removeFavorite = async (req, res) => {
  const { artistId } = req.body;

  // Validate that artistId is provided
  if (!artistId) {
    return res.status(400).json({ error: 'Artist ID is required.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Filter out the favorite with the matching artistId
    user.favorites = user.favorites.filter(fav => fav.artistId !== artistId);
    await user.save();

    // Return the updated favorites list after removal
    return res.json({
      message: 'Artist removed from favorites.',
      favorites: user.favorites
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return res.status(500).json({ error: 'Error removing favorite.' });
  }
};

// Function to retrieve the user's favorites, sorted newest-first
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Sort the favorites array by addedAt in descending order (newest first)
    const sortedFavorites = user.favorites.sort((a, b) => b.addedAt - a.addedAt);
    return res.json({ favorites: sortedFavorites });
  } catch (error) {
    console.error('Error retrieving favorites:', error);
    return res.status(500).json({ error: 'Error retrieving favorites.' });
  }
};
