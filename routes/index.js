const express = require("express");
const router = express.Router();
const authRouter = require("./auth.js");
const usersRouter = require("./users.js");
const moviesRouter = require("./movies.js");
const { authenticate } = require("../middleware/authMiddleware.js");


router.use("/auth", authRouter);
router.use(authenticate)
router.use("/users", usersRouter);
router.use("/movies", moviesRouter);

module.exports = router;
