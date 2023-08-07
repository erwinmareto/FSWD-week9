const express = require("express");
const pool = require("../config/config.js");
const jwt = require("jsonwebtoken");
const { authorize } = require("../middleware/authMiddleware.js");

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Get every user data (requires authorization)
router.get("/all", authorize, async (req, res, next) => {
  let { page, limit } = req.query;
  try {
    const query = "SELECT * FROM users LIMIT $1 OFFSET $2";

    const maxCount = "SELECT COUNT(*) FROM users";
    //Simple pagination
    page = +page || 1;
    limit = +limit || 10;

    let offset = (page - 1) * limit;
    const result = await pool.query(query, [limit, offset]);
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Update user info
router.put("/:id", authorize, async (req, res, next) => {
  const { id } = req.params;
  const { email, gender, password, role, target } = req.body;
  try {
    const query =
      "UPDATE users SET email = $1, gender = $2, password = $3, role = $4 WHERE id = $5 RETURNING *";
    const result = await pool.query(query, [email, gender, password, role, id]);
    if (result.rows.length === 0){
      throw {name: "ErrorNotFound"};
    }
    res.status(201).json({message: "User Data Updated"});
  } catch (err) {
    next(err);
  }
});

// Delete a user data
router.delete("/:id", authorize, async (req, res, next) => {
  const { id } = req.params;
  try {
    const query = "DELETE FROM users WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      throw { name: "ErrorNotFound" };
    }
    res.status(201).json({ message: "User Removed" });
  } catch (err) {
    next(err);
  }
 
});

module.exports = router;
