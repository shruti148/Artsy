const axios = require('axios');

async function testArtsyToken() {
  try {
    console.log("Starting Artsy API test...");
    
    const clientId = '7601bbcd2b24aee055ea';
    const clientSecret = '8e9267cd6557f62b3ec425ca82d10eed';
    
    console.log("Making request to Artsy API...");
    const response = await axios.post('https://api.artsy.net/api/tokens/xapp_token', {
      client_id: clientId,
      client_secret: clientSecret,
    });
    
    console.log("Response received:", response.data);
    console.log("Token:", response.data.token);
    console.log("Expires at:", response.data.expires_at);
    
    // Test a search request
    const searchResponse = await axios.get('https://api.artsy.net/api/search', {
      headers: {
        'X-XAPP-Token': response.data.token,
      },
      params: {
        q: 'picasso',
        size: 5,
      },
    });
    
    console.log("Search successful:", searchResponse.data._embedded.results.length, "results");
  } catch (error) {
    console.error("ERROR:", error.message);
    if (error.response) {
      console.error("ERROR RESPONSE:", error.response.data);
      console.error("STATUS:", error.response.status);
    }
  }
}

testArtsyToken();