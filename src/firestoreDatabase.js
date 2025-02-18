import { getAuth } from "firebase/auth";

import { db } from "./firebaseConfig";
import { doc, collection, setDoc, addDoc, serverTimestamp } from "firebase/firestore";

export async function testWrite(userId) {
  console.log("hi!");

  await setDoc(collection(db, "accounts", userId), {
    userId: userId,
    displayName: currentUser.displayName,
    email: currentUser.email,
  });

  console.log("hi");
}

export async function addUserToCollection(userId, displayName, email) {
  try {
    const classRef = await setDoc(doc(db, `users`, userId), {
      userId: userId,
      displayName: displayName,
      email: email,
      icon: "none",
      settings: {},
    });

    console.log("Account document updated.");
  } catch (error) {
    console.error("Error creating account document:", error);
  }
}

export async function addClass(userId, className) {
  try {
    const classRef = await addDoc(collection(db, "classes"), {
      userId: userId,
      name: "Tokyo",
      country: "Japan",
    });

    console.log("Class added with ID:", classRef.id);
    return classRef.id;
  } catch (error) {
    console.error("Error adding class:", error);
  }
}
