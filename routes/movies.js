/**
 * @swagger
 * components:
    schemas:
       Movie:
         type: object
         required:
            - title
            - genre
            - year
         properties:
           id:
              type: string
              description: the auto-generated id of the film
           title:
              type: string
              description: The title of the film
           genre:
              type: string
              description: the genre of the movie
           release_year:
              type: string
              description: The year the film was released
         example:
          id: 133
          title: The Hunger Games
          genre: Action|Adventure|Drama|Romance
          year: 2014
 */

/**
 * @swagger
 * tags:
 *    name: Movies
 *    description: API for managing movies
 * /movies/:
 *    get:
 *      summary: Gets all movies
 *      tags: [Movies]
 *      responses:
 *        200:
 *          description: Request Success.
 *          content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Movie'
 *        401:
 *          description: Unauthorized.
 *        500:
 *          description: Server error
 *
 * /movies/{title}:
 *    get:
 *      summary: Gets all movies
 *      parameters:
 *          - title : title
 *            in: path
 *            required: true
 *            description: the title of the movie
 *            schema:
 *                type: string
 *      tags: [Movies]
 *      responses:
 *        200:
 *          description: Request Success.
 *          content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Movie'
 *        404:
 *          description: Not found.
 *        500:
 *          description: Server error
 *
 * /movies/add:
 *    post:
 *      summary: Adds movie
 *      tags: [Movies]
 *      requestBody:
 *        required: true
 *        content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  title:
 *                    type: string
 *                  genre:
 *                    type: string
 *                  year:
 *                    type: integer
 *              example:
 *                title: Barbie
 *                genre: Comedy|Drama|Romance
 *                year: 2023
 *      responses:
 *        201:
 *          description: Movie added.
 *        500:
 *          description: Server error
 * /movies/edit:
 *    put:
 *      summary: Updates movie data
 *      tags: [Movies]
 *      requestBody:
 *        required: true
 *        content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  title:
 *                    type: string
 *                  genre:
 *                    type: string
 *                  year:
 *                    type: integer
 *              example:
 *                title: Oppenheimier
 *                genre: Drama|Documentary
 *                year: 2023
 *      responses:
 *        201:
 *          description: Movie updated.
 *        404:
 *          description: Not found.
 *        500:
 *          description: Server error
 *
 * /movies/remove:
 *    delete:
 *      summary: Deletes movie data
 *      tags: [Movies]
 *      requestBody:
 *        required: true
 *        content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  title:
 *                    type: string
 *                  genre:
 *                    type: string
 *                  year:
 *                    type: integer
 *              example:
 *                title: Oppenheimier
 *                genre: Drama|Documentary
 *                year: 2023
 *      responses:
 *        201:
 *          description: Movie deleted.
 *        404:
 *          description: Not found.
 *        500:
 *          description: Server error
 *
 *
 *
 */

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
