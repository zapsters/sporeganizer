const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");

// Only logged-in users with valid tokens can access this
router.get("/secure-data", verifyToken, (req, res) => {
  res.json({ message: "You are authenticated!", user: req.user });
});

module.exports = router;
