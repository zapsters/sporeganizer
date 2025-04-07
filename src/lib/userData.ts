import { getUserSettings } from '$lib/firestoreDatabase';
import { getAuth } from 'firebase/auth';
import { get, writable } from 'svelte/store';

export const classCache = writable([]);
export const assignmentCache = writable([]);
export const settingsCache = writable([]);

export const classCacheFetched = writable(false);
export const assignmentCacheFetched = writable(false);
export const settingsCacheFetched = writable(false);

export function clearLocalData() {
	settingsCache.set([]);
	classCache.set([]);
	assignmentCache.set([]);
	classCacheFetched.set(false);
	assignmentCacheFetched.set(false);
	settingsCacheFetched.set(false);
}

export async function syncSettings() {
	await getAuth().authStateReady(); // Wait for Firebase Auth to be ready
	const user = getAuth().currentUser;

	if (user) {
		try {
			const userSettings = await getUserSettings();
			settingsCache.set(userSettings);
		} catch (error) {
			console.error('Error syncing settings:', error);
		}
	} else {
		settingsCacheFetched.set(true);
	}
}
export async function getSettings() {
	await getAuth().authStateReady();

	// Retry mechanism if settings are not fetched yet
	const maxRetries = 10;
	let retries = 0;

	while (retries < maxRetries && !get(settingsCacheFetched)) {
		await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 100ms
		retries++;
	}

	if (get(settingsCacheFetched)) {
		return get(settingsCache); // Return the cache if fetched
	}

	// If after retries the settings are still not fetched, handle the case
	console.error('Settings not fetched after retries');
	return null; // Or a fallback value
}

export function getSettingParameter(key) {
	const settings = get(settingsCache);
	return settings ? settings[key] : undefined;
}

export function updateSettingParameter(key, value) {
	const current = get(settingsCache) || [];
	settingsCache.set({ ...current, [key]: value });
	console.log(`Setting Param Updated ${key}:${value}`);
}

// Function to update cache (mutates existing array)
export async function updateQueryCache(cacheName, cachedData) {
	switch (cacheName) {
		case 'classes':
			classCache.set(cachedData);
			break;
		case 'assignments':
			assignmentCache.set(cachedData);
			break;
		case 'settings':
			settingsCache.set(cachedData);
			break;
		default:
			console.error(`Could not find cache '${cacheName}'`);
			break;
	}
}

export async function updateClassInCache(classId, classJson) {
	const currentClasses = get(classCache);
	const index = currentClasses.findIndex((item) => item.classId === classId);

	if (index === -1) {
		// Class doesn't exist in cache — add it
		classCache.update((classes) => [...classes, { ...classJson, classId }]);
	} else if (Object.keys(classJson).length === 0) {
		// If the new data is empty — remove the class
		classCache.update((classes) => classes.filter((c) => c.classId !== classId));
	} else {
		// Update the existing class
		classCache.update((classes) =>
			classes.map((c) => (c.classId === classId ? { ...c, ...classJson } : c))
		);
	}

	console.log('Updated class cache:', get(classCache));
}

export async function updateAssignmentInCache(assignmentId, assignmentJson) {
	const currentAssignments = get(assignmentCache);
	const index = currentAssignments.findIndex((item) => item.assignmentId === assignmentId);

	if (index === -1) {
		// Class doesn't exist in cache — add it
		assignmentCache.update((assignments) => [...assignments, { ...assignmentJson, assignmentId }]);
	} else if (Object.keys(assignmentJson).length === 0) {
		// If the new data is empty — remove the class
		assignmentCache.update((assignments) =>
			assignments.filter((c) => c.assignmentId !== assignmentId)
		);
	} else {
		// Update the existing class
		assignmentCache.update((assignments) =>
			assignments.map((c) => (c.assignmentId === assignmentId ? { ...c, ...assignmentJson } : c))
		);
	}
	console.log('Updated assignment cache:', get(assignmentCache));
}

export async function getQueryCache(queryCacheKey) {
	switch (queryCacheKey) {
		case 'classes':
			return get(classCache);
		case 'assignments':
			return get(assignmentCache);
		case 'settings':
			return get(settingsCache);
		default:
			console.error(`Could not find cache '${queryCacheKey}'`);
			return null;
	}
}
