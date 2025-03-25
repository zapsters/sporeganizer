import Jquery from 'jquery';
import { getUserSettings } from '$lib/firestoreDatabase';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

const settingsChangeEvent = new Event('settingsChangeEvent');

let settingsSyncedThisVisit = false;

export const settings = {
	do24HrTime: false // This can now be updated
};

export async function syncSettings() {
	return /** @type {Promise<void>} */ (
		/** @type {Promise<void>} */ (
			new Promise((resolve, reject) => {
				if (settingsSyncedThisVisit) {
					resolve();
				}
				const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
					unsubscribe(); // Unsubscribe immediately to avoid multiple triggers

					if (user) {
						try {
							const userSettings = await getUserSettings(); // Ensure this is awaited
							settings.do24HrTime = Boolean(userSettings['24hrTime']);

							console.log('Settings updated!');
							settingsSyncedThisVisit = true;
							resolve(); // Resolve when settings are fully synced
						} catch (error) {
							console.error('Error syncing settings:', error);
							reject(error);
						}
					} else {
						resolve(); // No user logged in, resolve anyway
					}
				});
			})
		)
	);
}

export function getSettingParameter(key) {
	return settings[key];
}
export function updateSettingParameter(key, value) {
	settings[key] = value;
	console.log(`Setting Param Updated ${key}:${value}`);
}

// DATA CACHING HANDLER =====================================================
const queryCache = {
	classes: null
};

// Function to update cache (mutates existing array)
export async function updateClassQueryCache(newCache) {
	queryCache['classes'] = newCache; // Add new data
}
export async function updateClassInCache(classId, classJson) {
	const index = queryCache['classes'].findIndex((item) => item.classId === classId);

	if (index == -1) throw new Error('Class not found.');

	// Delete if our new json is empty...
	if (Jquery.isEmptyObject(classJson)) {
		queryCache['classes'].splice(index, 1);
	} else {
		// Update the cache with the data
		// @ts-ignore
		queryCache['classes'][index] = {
			classId: classId, // Firestore document ID
			...classJson
		};
	}
}

export async function getClassQueryCache() {
	// If our classQueryCache is already defined,
	if (queryCache['classes'] != undefined) return queryCache['classes'];
	return null;
}
