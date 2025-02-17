import { firestore } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export async function testWrite() {
  // Add a new document in collection "cities"
  await setDoc(doc(firestore, "cities", "LA"), {
    name: "Los Angeles",
    state: "CA",
    country: "USA",
  });

  console.log("hi");
}
