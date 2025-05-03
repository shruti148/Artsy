const express = require('express');
const path = require('path');
const app = express();

// API routes
require('./routes')(app);

// Serve static files from Angular
app.use(express.static(path.join(__dirname, 'frontend/dist/frontend/browser')));

// All other routes return Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/frontend/browser/index.html'));
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
