/**
 @swagger
 components:
    schemas:
       User:
         type: object
         required:
           - email
           - gender
           - password
           - role
         properties:
            id:
               type: integer
               description: (supposed to be auto-generated) id of the user
            email:
               type: string
               description: email of the user
            gender:
               type: string
               description: the gender of the user
            password:
               type: string
               description: the private password of the user
            role:
               type: string
               description: the designated role of the user
         example:
            id: 101
            email: "example@email.com"
            gender: Male
            password: secretpassword123
            role: Construction Worker
 
/
 @swagger
 tags:
    name: Users
    description: API for managing users
 * /users/all:
 *    get:
 *      summary: Get all user data
 *      tags: [Users]
 *      responses:
 *        200:
 *          description: Request Success.
 *          content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/User'
 *        401:
 *          description: Unauthorized.
 *        500:
 *          description: Server error
 *
 * /users/register:
 *    post:
 *      summary: Register a new user
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *      responses:
 *        201:
 *          description: User registered.
 *        500:
 *          description: Server error
 *
  /users/login:
     post:
       summary: Logs in the user
       tags: [Users]
       requestBody:
         required: true
         content:
             application/json:
               schema:
                 type: object
                 properties:
                   email:
                     type: string
                   password:
                     type: string
               example:
                 email: example@email.com
                 password: password
       responses:
         201:
           description: User logged in.
         404:
           description: User not found.
         500:
           description: Server error
 *
 * /users/update:
 *    put:
 *      summary: Updates user data
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  email:
 *                    type: string
 *                  gender:
 *                    type: string
 *                  password:
 *                    type: string
 *                  role:
 *                    type: string
 *              example:
 *                email: example@email.com
 *                gender: Male
 *                password: password
 *                role: Engineer
 *      responses:
 *        201:
 *          description: User data updated.
 *        404:
 *          description: User not found.
 *        500:
 *          description: Server error
 * /users/remove:
 *    delete:
 *      summary: Deletes user data
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  email:
 *                    type: string
 *                  password:
 *                    type: string
 *              example:
 *                email: example@email.com
 *                password: password
 *      responses:
 *        201:
 *          description: User data deleted.
 *        404:
 *          description: User not found.
 *        500:
 *          description: Server error
 */

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
