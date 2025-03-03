import { getUserSettings } from "./firestoreDatabase";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import * as $ from "jquery";

export const settings = {
  do24HrTime: false, // This can now be updated
};

export async function syncSettings() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        try {
          const userSettings = await getUserSettings(); // Ensure this is awaited
          settings.do24HrTime = Boolean(userSettings["24hrTime"]);
          console.log("Synced settings:", settings);
          unsubscribe(); // Stop listening to auth state changes
          resolve(); // Resolve when settings are fully synced
        } catch (error) {
          console.error("Error syncing settings:", error);
          reject(error);
        }
      } else {
        resolve(); // If no user is logged in, resolve anyway
      }
    });
  });
}
