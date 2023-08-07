const express = require("express");
const router = express();
const pool = require("../config/config.js");
const { authorize } = require("../middleware/authMiddleware.js");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Get all movies
router.get("/", async (req, res, next) => {
  let { page, limit } = req.query;
  try {
    const query = "SELECT * FROM movies LIMIT $1 OFFSET $2";

    const maxCount = "SELECT COUNT(*) FROM movies";
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

// Search movie using title
router.get("/:title", async (req, res, next) => {
  const { title } = req.params;
  try {
    const query = "SELECT * FROM movies WHERE title = $1";
    const result = await pool.query(query, [title]);

    if (result.rows.length === 0) {
      throw { name: "ErrorNotFound" };
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err) {
    next(err);
  }
});

// Add a new movie
router.post("/add", authorize, async (req, res, next) => {
  const { title, genres, year } = req.body;
  try {
    const query =
      "INSERT INTO movies (title, genres, year) VALUES ($1, $2, $3)";
    const result = await pool.query(query, [title, genres, year]);
    res.status(201).json({ message: "Movie Added" });
  } catch (err) {
    next(err);
  }
});

// Edit a movie
router.put("/:id", authorize, async (req, res, next) => {
  const { id } = req.params;
  const { title, genres, year } = req.body;
  try {
    const query =
      "UPDATE movies SET title = $1, genres = $2, year = $3 WHERE id = $4 RETURNING *";

    const result = await pool.query(query, [title, genres, year, id]);
    if (result.rows.length === 0) {
      throw { name: "ErrorNotFound" };
    } else {
      res.status(201).json({ message: "Movie Updated" });
    }
  } catch (err) {
    next(err);
  }
});

// Delete a film
router.delete("/:id", authorize, async (req, res, next) => {
  const { id } = req.params;
  try {
    const query = "DELETE FROM movies WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      throw { name: "ErrorNotFound" };
    } else {
      res.status(201).json({ message: "Movie Deleted" });
    }
  } catch (err) {
    next(err);
  }

});

module.exports = router;
