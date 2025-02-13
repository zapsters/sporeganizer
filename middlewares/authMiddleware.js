const firebaseAdmin = require("../config/firebaseAdmin");

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from header

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token); // Verify token
    console.log(decodedToken);

    req.user = decodedToken; // Attach user data (UID, email, etc.) to request
    next(); // Proceed to the next middleware/route
  } catch (error) {
    return res.status(403).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = verifyToken;
