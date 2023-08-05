const express = require("express");
const pool = require("../config/config.js");
const jwt = require("jsonwebtoken");
const { signToken } = require("../lib/auth.js");

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Adds a new user
router.post("/register", async (req, res, next) => {
  const email = req.body.email;
  const gender = req.body.gender;
  const password = req.body.password;
  const role = req.body.role;
  try {
    const query =
      "INSERT INTO users (email, gender, password, role) VALUES ($1, $2, $3, $4)";
    const result = await pool.query(query, [email, gender, password, role]);
    res.status(201).json({
      message: "New User Registered",
      info: {
        email: email,
        gender: gender,
        password: password,
        role: role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Logs user in
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const query = "SELECT * FROM users WHERE email = $1 AND password = $2";
    const result = await pool.query(query, [email, password]);
    if (result.rows.length === 0) {
      throw { name: "InvalidCred" };
    }
    const token = signToken(result.rows[0]);
    res.json({ token: token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
