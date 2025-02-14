const admin = require("firebase-admin");

// Load Firebase credentials from a service account JSON file
// const credentials = require("../firebase-service-account.json");

console.log(process.env.FIREBASE_PRIVATE_KEY);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    // private_key: process.env.FIREBASE_PRIVATE_KEY,
    private_key: process.env.FIREBASE_PRIVATE_KEY.split(String.raw`\n`).join("\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  // databaseURL: "https://your-project-id.firebaseio.com", // Replace with your database URL if using Firestore
});

module.exports = admin;
