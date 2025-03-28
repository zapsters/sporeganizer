import Jquery from 'jquery';
import { getUserSettings } from '$lib/firestoreDatabase';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

const settings = {
	hasBeenFetched: false,
	do24HrTime: false // This can now be updated
};

export async function syncSettings() {
	return /** @type {Promise<void>} */ (
		/** @type {Promise<void>} */ (
			new Promise((resolve, reject) => {
				const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
					unsubscribe(); // Unsubscribe immediately to avoid multiple triggers

					if (user) {
						try {
							const userSettings = await getUserSettings(); // Ensure this is awaited
							settings.do24HrTime = Boolean(userSettings['24hrTime']);

							Object.defineProperty(settings, 'hasBeenFetched', {
								value: true,
								writable: false
							});
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

export async function getSettings() {
	while (!settings['hasBeenFetched'])
		// define the condition as you like
		await new Promise((resolve) => setTimeout(resolve, 1000));
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
	classes: null,
	settings: null
};

// Function to update cache (mutates existing array)
export async function updateQueryCache(cacheName, cachedData) {
	queryCache[cacheName] = cachedData; // Add new data
}
export async function updateClassInCache(classId, classJson) {
	const index = queryCache['classes'].findIndex((item) => item.classId === classId);

	// Check if the classId does not exist, if so, add it.
	if (index == -1) {
		queryCache['classes'][classId] = {
			classId: classId, // Firestore document ID
			...classJson
		};
	} else if (Jquery.isEmptyObject(classJson)) {
		// Delete if our new json is empty...
		queryCache['classes'].splice(index, 1);
	} else {
		// Update the cache with the data
		// @ts-ignore
		queryCache['classes'][index] = {
			classId: classId, // Firestore document ID
			...classJson
		};
	}
	console.log('updated class cache.', queryCache['classes']);
}

export async function getQueryCache(queryCacheKey) {
	// If our classQueryCache is already defined,
	if (queryCache[queryCacheKey] != undefined) return queryCache[queryCacheKey];
	return null;
}
