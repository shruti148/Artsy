// controllers/artworkController.js
const axios = require('axios');
const { getXappToken } = require('../utils/tokenManager');

exports.getArtworkCategories = async (req, res) => {
  const artwork_id = req.params.categoryId;
  
  if (!artwork_id) {
    return res.status(400).json({ error: 'Artwork ID required' });
  }

  try {
    const token = await getXappToken();
    const response = await axios.get(`https://api.artsy.net/api/genes?artwork_id=${artwork_id}`, {
      headers: { 'X-XAPP-Token': token }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching artwork categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      details: error.response?.data || error.message
    });
  }
};