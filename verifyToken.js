const jwt = require('jsonwebtoken');

/**
 * Middleware: verifyToken
 * Extracts a JWT from cookies, verifies it, and attaches the decoded payload to req.user.
 */
const verifyToken = (req, res, next) => {
  // Retrieve the JWT from cookies (make sure cookie-parser is used in app.js)
  const token = req.cookies.token;
  console.log('Token from cookies:', token);

  if (!token) {
    // No token found, return a 401 Unauthorized error
    return res.status(401).json({ error: 'Unauthorized. No token found in cookies.' });
  }

  try {
    // Verify the token using the JWT_SECRET from your .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);

    // Attach the decoded payload to the request object for further use
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    // If the token is invalid or expired, return a 403 Forbidden error
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;
