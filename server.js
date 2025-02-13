const express = require("express");
const path = require("path");
const authRoutes = require("./routes/auth.js");
const verifyToken = require("./middlewares/authMiddleware"); // Import the middleware

const app = express();

app.use(express.json());

// app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRoutes); // Use auth routes

// Define the /auth/verify-token route
app.post("/auth/verify-token", verifyToken, (req, res) => {
  res.json({ message: "Token is valid", user: req.user });
});

app.use(express.static(path.join(__dirname, "dist")));

// Catch-all route to serve index.html (for Single Page Apps)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// set post and listen for our requests

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
