import { getAuth, updateProfile } from "firebase/auth";

import { db } from "./firebaseConfig";
import {
  doc,
  collection,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import sanitizeHtml from "sanitize-html";
const sanitizeHtmlSettings = { allowedTags: [], allowedAttributes: {} };

export async function getUserSettings() {
  const user = getAuth().currentUser;
  if (!user) {
    console.log("No user is logged in.");
    return null;
  }

  const userRef = doc(db, "users", user.uid);

  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const settings = userSnap.data().settings || {};

      return settings;
    } else {
      console.log("User not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching setting:", error);
    return null;
  }
}

export async function updateUserSettings(key, value) {
  const userRef = doc(db, "users", getAuth().currentUser.uid);

  try {
    await updateDoc(userRef, {
      [`settings.${key}`]: value, // Firestore dot notation
    });
    console.log(`Updated ${key} to ${value}`);
  } catch (error) {
    console.error("Error updating setting:", error);
  }
}

// sanitizeHtml(, sanitizeHtmlSettings);
export async function addUserToCollection(currentUser) {
  if (currentUser == undefined) return;
  try {
    await setDoc(doc(db, `users`, currentUser.uid), {
      userId: currentUser.uid,
      displayName: sanitizeHtml(currentUser.displayName, sanitizeHtmlSettings),
      email: sanitizeHtml(currentUser.email, sanitizeHtmlSettings),
      emailVerified: currentUser.emailVerified,
      providerId: currentUser.providerData[0].providerId,
      icon: "none",
      created: serverTimestamp(),
      settings: {},
    });
  } catch (error) {
    console.error("Error creating account document:", error);
  }
}

export async function deleteUserFromCollection(uid) {
  await deleteDoc(doc(db, "users", uid));
}

export async function addClassToDatabase(classJson) {
  console.log(classJson);

  try {
    const classRef = await addDoc(collection(db, "classes"), {
      icon: classJson.icon,
      name: sanitizeHtml(classJson.name, sanitizeHtmlSettings),
      professor: sanitizeHtml(classJson.professor, sanitizeHtmlSettings),
      time: classJson.time,
      userId: getAuth().currentUser.uid,
      createdAt: serverTimestamp(),
    });
    console.log("Class added with ID:", classRef.id);
    return classRef.id;
  } catch (error) {
    console.error("Error adding class:", error);
    throw error;
  }
}

// Create a reference to the classes collection
const classesRef = collection(db, "classes");
export async function getAllUserMadeClasses() {
  // Create a query against the classes collection.
  const q = query(classesRef, where("userId", "==", getAuth().currentUser.uid));

  var querySnapshotResults = [];
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    querySnapshotResults.push(doc.data());
  });

  return querySnapshotResults;
} // Create a reference to the classes collection

const assignmentsRef = collection(db, "assignments");
export async function getAllUserMadeAssignments() {
  // Create a query against the classes collection.
  const q = query(classesRef, where("userId", "==", getAuth().currentUser.uid));

  var querySnapshotResults = [];
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    querySnapshotResults.push(doc.data());
  });
  console.log(querySnapshotResults);

  return querySnapshotResults;
}
