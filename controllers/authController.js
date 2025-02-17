const firebaseAdmin = require("../config/firebaseAdmin");
const { getAuth } = require("firebase-admin/auth");
const sanitizeHtml = require("sanitize-html");

exports.signup = async (req, res) => {
  try {
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {};
