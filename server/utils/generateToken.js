const jwt = require('jsonwebtoken');

/**
 * Generates a signed JSON Web Token (JWT) containing the user ID.
 * @param {string} id - The MongoDB Object ID of the user.
 * @returns {string} The signed JWT string.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = generateToken;
