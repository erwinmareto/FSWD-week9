const { verifyToken } = require("../lib/auth.js");
const pool = require("../config/config.js");

const authenticate = (req, res, next) => {
  if (!req.headers.authorization) {
    throw { name: "Unauthenticated" };
  }
  const accessToken = req.headers.authorization.split(" ")[1];
  const { email, password } = verifyToken(accessToken);

  const authQuery = "SELECT * FROM users WHERE email = $1 AND password = $2";
  pool.query(authQuery, [email, password], (err, result) => {
    if (err) {
      next(err);
    } else {
      if (result.rows.length === 0) {
        throw { name: "Unauthenticated" };
      } else {
        next();
      }
    }
  });
};

const authorize = (req, res, next) => {
  const header = req.headers.authorization;

  const token = header.split(" ")[1];
  const data = verifyToken(token);
  if (data.role === "admin") {
    next();
  } else {
    throw { name: 'Unauthorized' }
  }
};

module.exports = { authenticate, authorize };
