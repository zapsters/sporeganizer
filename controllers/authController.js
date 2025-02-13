const firebaseAdmin = require("../config/firebaseAdmin");

exports.signup = async (req, res) => {
  try {
    const { displayName, email, password } = req.body;
    const user = await firebaseAdmin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      disabled: false,
      emailVerified: false,
    });
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
