// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// console.log(process.env.SPOREGANZIER_FIREBASE_APIKEY);

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
export const firestore = getFirestore(app);
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  console.log("FIRESTORE EMULATOR ACTIVE -- CALL ");
  connectFirestoreEmulator(firestore, "localhost", 8080);
}
