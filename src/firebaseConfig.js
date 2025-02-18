// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider, getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBEzlCVVXLZk2gfOiSorG2ZyISFvZklTpU",
  authDomain: "sporeganizer.firebaseapp.com",
  projectId: "sporeganizer",
  storageBucket: "sporeganizer.firebasestorage.app",
  messagingSenderId: "137178577763",
  appId: "1:137178577763:web:4bad7573d35588ef2d7156",
  measurementId: "G-G5ND6E0VDC",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const auth = getAuth();
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  console.log("FIRESTORE EMULATOR ACTIVE -- CALL ");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
}
