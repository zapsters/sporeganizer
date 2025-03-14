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
  orderBy,
} from "firebase/firestore";
import sanitizeHtml from "sanitize-html";
const sanitizeHtmlSettings = { allowedTags: [], allowedAttributes: {} };
import { updateClassQueryCache, getClassQueryCache, updateClassInCache } from "./userData";

export async function getUserSettings() {
  const user = getAuth().currentUser;
  if (!user) {
    return null;
  }

  const userRef = doc(db, "users", user.uid);

  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const settings = userSnap.data().settings || {};

      return settings;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

export async function updateUserSettings(key, value) {
  const userRef = doc(db, "users", getAuth().currentUser.uid);

  await updateDoc(userRef, {
    [`settings.${key}`]: value, // Firestore dot notation
  });
}

// sanitizeHtml(, sanitizeHtmlSettings);
export async function addUserToCollection(currentUser) {
  if (currentUser == undefined) return;
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
}

export async function deleteUserFromCollection(uid) {
  await deleteDoc(doc(db, "users", uid));
}

// Add class / assignment Documents
export async function addClassToDatabase(classJson) {
  if (classJson.name == "" || classJson.name == undefined) {
    throw new Error("Missing class name");
  }

  try {
    const classRef = await addDoc(collection(db, "classes"), {
      icon: classJson.icon,
      name: sanitizeHtml(classJson.name, sanitizeHtmlSettings),
      professor: sanitizeHtml(classJson.professor, sanitizeHtmlSettings),
      time: classJson.time,
      userId: getAuth().currentUser.uid,
      createdAt: serverTimestamp(),
      notes: "",
    });
    syncClassQueryCacheWithDatabase();
    return classRef.id;
  } catch (error) {
    throw error;
  }
}
export async function addAssignmentToDatabase(assignmentJson) {
  try {
    const assignmentRef = await addDoc(collection(db, "assignments"), {
      icon: assignmentJson.icon,
      assignmentId: assignmentJson.assignmentId,
      name: sanitizeHtml(assignmentJson.name, sanitizeHtmlSettings),
      time: assignmentJson.time,
      userId: getAuth().currentUser.uid,
      completed: assignmentJson.completed,
      createdAt: serverTimestamp(),
    });
    // syncAssignmentQueryCacheWithDatabase();
    return assignmentRef.id;
  } catch (error) {
    throw error;
  }
}

// Update class / assignment data
export async function updateClassInDatabase(classId, classJson) {
  await updateDoc(doc(db, "classes", classId), classJson);
  updateClassInCache(classId, classJson);
}

// Remove class / assignment data
export async function deleteClassFromDatabase(classId) {
  await deleteDoc(doc(db, "classes", classId));
  updateClassInCache(classId, "");
}

// Create a reference to the classes collection
const classesRef = collection(db, "classes");
export async function getAllUserMadeClasses() {
  let queryCheck = await getClassQueryCache();
  if (queryCheck != null) {
    return queryCheck;
  }

  // Create a query against the classes collection.
  const q = query(
    classesRef,
    where("userId", "==", getAuth().currentUser.uid),
    orderBy("createdAt", "asc")
  );
  const querySnapshot = await getDocs(q);

  const querySnapshotResults = querySnapshot.docs.map((doc) => ({
    classId: doc.id, // Firestore document ID
    ...doc.data(), // Other document fields
  }));
  console.warn("Loaded Class Data from Database");
  updateClassQueryCache(querySnapshotResults);
  return querySnapshotResults;
}

export async function syncClassQueryCacheWithDatabase() {
  // Create a query against the classes collection.
  const q = query(
    classesRef,
    where("userId", "==", getAuth().currentUser.uid),
    orderBy("createdAt", "asc")
  );
  const querySnapshot = await getDocs(q);

  const querySnapshotResults = querySnapshot.docs.map((doc) => ({
    classId: doc.id, // Firestore document ID
    ...doc.data(), // Other document fields
  }));
  console.warn("Synced Class Data from Database", querySnapshotResults);
  updateClassQueryCache(querySnapshotResults);
}

export async function getClassById(classId) {
  const allClasses = await getAllUserMadeClasses();
  return allClasses.find((classEntry) => classEntry.classId == classId);
}

// Create a reference to the assignments collection
const assignmentsRef = collection(db, "assignments");
export async function getAllUserMadeAssignments() {
  // Create a query against the assignments collection.
  const q = query(assignmentsRef, where("userId", "==", getAuth().currentUser.uid));
  const querySnapshot = await getDocs(q);

  const querySnapshotResults = querySnapshot.docs.map((doc) => ({
    assignmentId: doc.id, // Firestore document ID
    ...doc.data(), // Other document fields
  }));

  return querySnapshotResults;
}
