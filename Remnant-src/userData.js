import { getUserSettings } from "./firestoreDatabase";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import * as $ from "jquery";

export const settings = {
  do24HrTime: false, // This can now be updated
};

export async function syncSettings() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      unsubscribe(); // Unsubscribe immediately to avoid multiple triggers

      if (user) {
        try {
          const userSettings = await getUserSettings(); // Ensure this is awaited
          settings.do24HrTime = Boolean(userSettings["24hrTime"]);
          resolve(); // Resolve when settings are fully synced
        } catch (error) {
          console.error("Error syncing settings:", error);
          reject(error);
        }
      } else {
        resolve(); // No user logged in, resolve anyway
      }
    });
  });
}

// DATA CACHING HANDLER =====================================================
const queryCache = {};

// Function to update cache (mutates existing array)
export async function updateClassQueryCache(newCache) {
  queryCache["classes"] = newCache; // Add new data
}
export async function updateClassInCache(classId, classJson) {
  const index = queryCache["classes"].findIndex((item) => item.classId === classId);

  if (index == -1) throw new Error("Class not found.");

  // Delete if our new json is empty...
  if ($.isEmptyObject(classJson)) {
    queryCache["classes"].splice(index, 1);
  } else {
    // Update the cache with the data
    queryCache["classes"][index] = {
      classId: classId, // Firestore document ID
      ...classJson,
    };
  }
}

export async function getClassQueryCache() {
  // If our classQueryCache is already defined,
  if (queryCache["classes"] != undefined) return queryCache["classes"];
  return null;
}
