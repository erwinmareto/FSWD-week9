const jwt = require("jsonwebtoken");
require('dotenv').config();

function signToken(payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1hr" });
  return token;
}

function verifyToken(token) {
  const data = jwt.verify(token, process.env.JWT_SECRET);
  return data;
}

module.exports = { signToken, verifyToken };
