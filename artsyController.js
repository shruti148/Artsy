
const axios = require('axios');
const { getXappToken } = require('../utils/tokenManager');


const searchArtists = async (req, res) => {
  const query = req.query.name;
  console.log("🎯 searchArtists() called. Query =", query);
  
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter ?q=' });
  }
  
  try {
    const token = await getXappToken();
    console.log("✅ Token for search:", token.slice(0, 10));
    
    
    const response = await axios.get('https://api.artsy.net/api/search', {
      headers: { 'X-XAPP-Token': token },
      params: { q: query, type: 'artist', size: 10 },
    });
    
    const results = response.data._embedded?.results || [];
    console.log("🔍 Raw response keys:", Object.keys(response.data));
    console.log("🧪 First 2 embedded results:", JSON.stringify(results.slice(0, 2), null, 2));
    
    const artists = results
      .filter(item => item.type === 'artist')
      .slice(0, 10)
      .map(artist => ({
        id: artist._links.self.href.split('/').pop(),
        name: artist.title,
        thumbnail: artist._links.thumbnail?.href || null,
      }));
    
    console.log("Filtered artists returned:", artists.length);
    res.json(artists);
  } catch (error) {
    console.error(' Search error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Search failed.',
      details: error.response?.data || error.message,
    });
  }
};


const getArtistDetails = async (req, res) => {
  const artistId = req.params.artistId;
  console.log("getArtistDetails() called. Artist ID =", artistId);
  
  if (!artistId) {
    return res.status(400).json({ error: 'Artist ID is required' });
  }
  
  try {
    const token = await getXappToken();
    console.log("Token for artist details:", token.slice(0, 12));
    
    
    const artistResponse = await axios.get(`https://api.artsy.net/api/artists/${artistId}`, {
      headers: { 'X-XAPP-Token': token },
    });
    const artist = artistResponse.data;
    console.log("Artist data:", artist);
    
    const artworksResponse = await axios.get('https://api.artsy.net/api/artworks', {
      headers: { 'X-XAPP-Token': token },
      params: { artist_id: artistId, size: 10 },
    });
    console.log("Artworks response data:", artworksResponse.data);
    const artworks = artworksResponse.data._embedded?.artworks || [];
    const mappedArtworks = artworks.map(art => ({
      id: art.id,
      title: art.title,
      date: art.date,
      thumbnail: art._links?.thumbnail?.href || null,
    }));
    console.log("Mapped artworks:", mappedArtworks);
    

    res.json({
      id: artist.id,
      name: artist.name,
      birthday: artist.birthday,
      deathday: artist.deathday,
      nationality: artist.nationality,
      biography: artist.biography,
      thumbnail: artist._links?.thumbnail?.href || null,
      artworks: mappedArtworks,
    });
  } catch (error) {
    console.error('Artist details error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch artist details',
      details: error.response?.data || error.message,
    });
  }
};


const getSimilarArtists = async (req, res) => {
  const artistId = req.params.artistId;
  console.log("getSimilarArtists() called. Artist ID =", artistId);
  
  if (!artistId) {
    return res.status(400).json({ error: 'Artist ID is required' });
  }
  
  try {
    const token = await getXappToken();
    console.log("Token for similar artists:", token.slice(0, 12));
    
  
    const url = `https://api.artsy.net/api/artists?similar_to_artist_id=${artistId}&size=5`;
    console.log("Requesting similar artists from Artsy with URL:", url);
    
    const response = await axios.get(url, {
      headers: { 'X-XAPP-Token': token }
    });
    
    
    console.log("Raw similar artists from Artsy:", response.data._embedded?.artists);
    
    const embedded = response.data._embedded?.artists || [];
    const similarArtists = embedded.map(a => ({
      id: a.id,
      name: a.name,
      thumbnail: a._links?.thumbnail?.href || null,
    }));
    
    console.log("Similar artists fetched:", similarArtists.length);
    res.json(similarArtists);
  } catch (error) {
    console.error(" Error fetching similar artists:", error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch similar artists',
      details: error.response?.data || error.message,
    });
  }
};

module.exports = {
  searchArtists,
  getArtistDetails,
  getSimilarArtists,
};
