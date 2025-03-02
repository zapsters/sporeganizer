import { getAuth, updateProfile } from "firebase/auth";

import { db } from "./firebaseConfig";
import {
  doc,
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

export async function addUserToCollection(currentUser) {
  if (currentUser == undefined) return;
  try {
    await setDoc(doc(db, `users`, currentUser.uid), {
      userId: currentUser.uid,
      displayName: currentUser.displayName,
      email: currentUser.email,
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
      name: classJson.name,
      professor: classJson.professor,
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
