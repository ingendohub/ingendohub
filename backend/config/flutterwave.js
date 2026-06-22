// config/flutterwave.js
require('dotenv').config();

module.exports = {
  publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
  baseUrl: 'https://api.flutterwave.com/v3',
  redirectUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};