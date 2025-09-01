// server.js
// Minimal Express server for Stock Price Checker
// Exports `app` so the functional tests can require('../server')

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./routes/api');

const app = express();

app.use(helmet()); // security headers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// simple rate limiter (tunable)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
});
app.use(limiter);

// mount API routes
app.use('/api', routes);

// root route (helpful)
app.get('/', (req, res) => {
  res.send('Stock Price Checker API - /api/stock-prices');
});

// export app for tests
module.exports = app;

// If run directly (node server.js), start HTTP server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
