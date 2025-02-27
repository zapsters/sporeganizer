import { getAuth, updateProfile } from "firebase/auth";

import { db } from "./firebaseConfig";
import { doc, collection, setDoc, addDoc, serverTimestamp, query, where } from "firebase/firestore";

const usersLocationRef = collection(db, "users");
export async function addUserToCollection(currentUser) {
  // Create a query checking for any other user in the database with the same email.
  const q = query(usersLocationRef, where("email", "==", currentUser.email));
  const querySnapshot = await getDocs(q);

  try {
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
    });

    const classRef = await setDoc(doc(db, `users`, currentUser.uid), {
      userId: currentUser.uid,
      displayName: currentUser.displayName,
      email: currentUser.email,
      emailVerified: currentUser.emailVerified,
      providerId: currentUser.providerData[0].providerId,
      icon: "none",
      created: serverTimestamp(),
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
