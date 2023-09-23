const crypto = require('crypto');

module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET') || crypto.randomBytes(32).toString('hex'), // Generate a random secret if not provided
  },
  apiToken: {
    salt: env('API_TOKEN_SALT') || crypto.randomBytes(16).toString('base64'), // Generate a random salt if not provided
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT') || crypto.randomBytes(16).toString('base64'), // Generate a random salt if not provided
    },
  },
});