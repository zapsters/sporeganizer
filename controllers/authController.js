const firebaseAdmin = require("../config/firebaseAdmin");
const { getAuth } = require("firebase-admin/auth");

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

exports.update = async (req, res) => {
  try {
    const { uid, displayName, email } = req.body;
    getAuth()
      .updateUser(uid, {
        email: email,
        // emailVerified: true,
        // password: "newPassword",
        displayName: displayName,
        // photoURL: "http://www.example.com/12345678/photo.png",
        // disabled: true,
      })
      .then((userRecord) => {
        console.log("Successfully updated user", userRecord.toJSON());
        res.status(201).json({ message: "User updated successfully", userRecord });
      })
      .catch((error) => {
        res.status(400).json({ error: error.message });
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
