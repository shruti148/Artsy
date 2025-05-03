// utils/tokenManager.js
const axios = require('axios');

let cachedToken = null;
let tokenExpiry = 0;

const getXappToken = async () => {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post('https://api.artsy.net/api/tokens/xapp_token', {
      client_id: process.env.ARTSY_CLIENT_ID,
      client_secret: process.env.ARTSY_CLIENT_SECRET,
    });
    cachedToken = response.data.token;
    // Set expiry a few minutes before actual expiry for safety (expiry in ms)
    tokenExpiry = now + (response.data.expires_in - 300) * 1000;
    return cachedToken;
  } catch (error) {
    console.error("Error fetching XAPP token:", error.message);
    throw error;
  }
};

module.exports = { getXappToken };
