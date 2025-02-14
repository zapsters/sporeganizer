const express = require("express");
const router = express.Router();
const { signup, update } = require("../controllers/authController");

// Define auth routes
router.post("/signup", signup);
router.post("/update", update);

module.exports = router;
