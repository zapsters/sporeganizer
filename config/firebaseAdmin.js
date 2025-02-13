const admin = require("firebase-admin");

// Load Firebase credentials from a service account JSON file
const credentials = require("../firebase-service-account.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(credentials),
  // databaseURL: "https://your-project-id.firebaseio.com", // Replace with your database URL if using Firestore
});

module.exports = admin;
