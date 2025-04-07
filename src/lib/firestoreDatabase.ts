import { getAuth, sendEmailVerification } from 'firebase/auth';

import { db } from '$lib/firebaseConfig';
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
	orderBy
} from 'firebase/firestore';
import {
	updateClassInCache,
	updateSettingParameter,
	updateAssignmentInCache,
	settingsCacheFetched,
	settingsCache,
	classCacheFetched,
	classCache,
	assignmentCache,
	assignmentCacheFetched
} from '$lib/userData';
import { DOMPurifyFunc } from './helpers';
import { get } from 'svelte/store';
import type { AssignmentJson } from './types';

export async function getUserSettings() {
	const user = getAuth().currentUser;
	if (!user) {
		throw new Error('No current user');
	}

	if (get(settingsCacheFetched)) {
		return get(settingsCache);
	}

	const userRef = doc(db, 'users', user.uid);
	const userSnap = await getDoc(userRef);
	console.warn('Loaded Settings Data from Database');
	if (userSnap.exists()) {
		const settings = userSnap.data().settings || {};
		settingsCache.set(settings);
		settingsCacheFetched.set(true);
		return settings;
	} else {
		console.error('No user found');
		return null;
	}
}

/**
 * @param {any} key
 * @param {any} value
 */
export async function updateUserSettings(key, value) {
	updateSettingParameter(key, value);
	if (checkLogInStatus()) {
		const userRef = doc(db, 'users', getAuth().currentUser.uid);

		await updateDoc(userRef, {
			[`settings.${key}`]: value // Firestore dot notation
		});
	}
}

/**
 * @param {{ uid: string; displayName: any; email: any; emailVerified: any; providerData: { providerId: any; }[]; } | undefined} currentUser
 */
export async function addUserToCollection(currentUser) {
	if (!checkLogInStatus()) return;
	if (currentUser == undefined || getAuth().currentUser != currentUser) return;
	await setDoc(doc(db, `users`, currentUser.uid), {
		userId: currentUser.uid,
		email: DOMPurifyFunc(currentUser.email),
		providerId: currentUser.providerData[0].providerId,
		icon: 'none',
		created: serverTimestamp(),
		settings: {}
	});
	if (!currentUser.emailVerified) {
		sendEmailVerification(getAuth().currentUser);
	}
}

/**
 * @param {string} uid
 */
export async function deleteUserFromCollection(uid) {
	if (!checkLogInStatus()) return;
	await deleteDoc(doc(db, 'users', uid));
}

/**
 * @param {any} key
 * @param {any} value
 */
export async function updateFieldInUserCollection(key, value) {
	if (!checkLogInStatus()) return;
	try {
		await updateDoc(doc(db, `users`, getAuth().currentUser.uid), { [key]: value });
	} catch (error) {
		console.error('Error updating key: ', key);
	}
}

// Add class / assignment Documents
export async function addClassToDatabase(classJson) {
	if (!checkLogInStatus()) {
		let classes = Array(await getAllUserMadeClasses());
		classJson.classId = `preview${classes.length}`;
		updateClassInCache(classJson.classId + 1, classJson);
		return classJson.classId;
	}

	try {
		const classRef = await addDoc(collection(db, 'classes'), {
			icon: classJson.icon,
			name: DOMPurifyFunc(classJson.name),
			notes: DOMPurifyFunc(classJson.notes),
			time: classJson.time,
			userId: getAuth().currentUser.uid,
			createdAt: serverTimestamp()
		});
		updateClassInCache(classRef.id, classJson);
		return classRef.id;
	} catch (error) {
		throw error;
	}
}

export async function addAssignmentToDatabase(assignmentJson: AssignmentJson) {
	if (!checkLogInStatus()) {
		let assignments = Array(await getAllUserMadeAssignments());
		assignmentJson.assignmentId = `preview${assignments.length}`;
		updateAssignmentInCache(assignmentJson.assignmentId + 1, assignmentJson);
		return assignmentJson.assignmentId;
	}

	try {
		const assignmentRef = await addDoc(collection(db, 'assignments'), {
			assignmentId: assignmentJson.assignmentId,
			name: DOMPurifyFunc(assignmentJson.name),
			time: assignmentJson.time,
			userId: getAuth().currentUser.uid,
			completed: assignmentJson.completed,
			createdAt: serverTimestamp()
		});
		// syncAssignmentQueryCacheWithDatabase();
		return assignmentRef.id;
	} catch (error) {
		throw error;
	}
}

export async function updateClassInDatabase(classId, classJson) {
	if (!checkLogInStatus()) {
		updateClassInCache(classId, classJson);
		return;
	}
	await updateDoc(doc(db, 'classes', classId), classJson);
	updateClassInCache(classId, classJson);
}

export async function updateAssignmentInDatabase(assignmentId, assignmentJson) {
	if (!checkLogInStatus()) {
		updateAssignmentInCache(assignmentId, assignmentJson);
		return;
	}
	await updateDoc(doc(db, 'assignments', assignmentId), assignmentJson);
	updateAssignmentInCache(assignmentId, assignmentJson);
}

export async function deleteClassFromDatabase(classId) {
	if (!checkLogInStatus()) {
		updateClassInCache(classId, '');
		return;
	}
	await deleteDoc(doc(db, 'classes', classId));
	updateClassInCache(classId, '');
}
export async function deleteAssignmentFromDatabase(assignmentId) {
	if (!checkLogInStatus()) {
		updateAssignmentInCache(assignmentId, '');
		return;
	}
	await deleteDoc(doc(db, 'assignments', assignmentId));
	updateAssignmentInCache(assignmentId, '');
}

// Create a reference to the classes collection
const classesRef = collection(db, 'classes');
export async function getAllUserMadeClasses() {
	if (get(classCacheFetched)) {
		// Already fetched once, use cache
		return get(classCache);
	}

	if (checkLogInStatus) {
		console.error('No current user.');
		return;
	}

	// Fetch from Firestore
	const q = query(
		classesRef,
		where('userId', '==', getAuth().currentUser.uid),
		orderBy('createdAt', 'asc')
	);
	const querySnapshot = await getDocs(q);

	const querySnapshotResults = querySnapshot.docs.map((doc) => ({
		classId: doc.id,
		...doc.data()
	}));
	console.warn('Loaded Class Data from Database');
	classCache.set(querySnapshotResults);
	classCacheFetched.set(true);

	return querySnapshotResults;
}

export async function getClassById(classId) {
	const allClasses = await getAllUserMadeClasses();
	const result = allClasses.find((classEntry) => classEntry.classId == classId);

	return result;
}

// Create a reference to the assignments collection
const assignmentsRef = collection(db, 'assignments');
export async function getAllUserMadeAssignments() {
	if (get(assignmentCacheFetched)) {
		// Already fetched once, use cache
		return get(assignmentCache);
	}

	if (checkLogInStatus) {
		console.error('No current user.');
		return;
	}

	// Fetch from Firestore
	const q = query(
		assignmentsRef,
		where('userId', '==', getAuth().currentUser.uid),
		orderBy('time', 'desc')
	);
	const querySnapshot = await getDocs(q);

	console.log(querySnapshot);

	const querySnapshotResults = querySnapshot.docs.map((doc) => ({
		assignmentId: doc.id,
		...doc.data()
	}));
	console.warn('Loaded Assignment Data from Database');
	assignmentCache.set(querySnapshotResults);
	assignmentCacheFetched.set(true);

	return querySnapshotResults;
}

export async function getAssignmentById(assignmentId) {
	const allAssignments = await getAllUserMadeAssignments();
	return allAssignments.find((assignmentEntry) => assignmentEntry.assignmentId == assignmentId);
}

export function checkLogInStatus() {
	return getAuth().currentUser != null;
}
