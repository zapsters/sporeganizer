// @ts-ignore
// @ts-ignore
import { getAuth, sendEmailVerification } from 'firebase/auth';

import { db } from '$lib/firebase';
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
import { DOMPurifyFunc } from './model';
import {
	updateQueryCache,
	getQueryCache,
	updateClassInCache,
	updateSettingParameter
} from '$lib/userData';

export async function getUserSettings() {
	if (!checkLogInStatus()) return;
	const user = getAuth().currentUser;
	if (!user) {
		return null;
	}

	let queryCheck = await getQueryCache('settings');

	if (queryCheck != null) {
		console.log('Retrieved settings from cache');
		return queryCheck;
	}

	const userRef = doc(db, 'users', user.uid);

	try {
		const userSnap = await getDoc(userRef);
		if (userSnap.exists()) {
			const settings = userSnap.data().settings || {};
			console.warn('Loaded Settings Data from Database');
			updateQueryCache('settings', userSnap);
			return settings;
		} else {
			return null;
		}
	} catch (error) {
		return null;
	}
}

/**
 * @param {any} key
 * @param {any} value
 */
export async function updateUserSettings(key, value) {
	if (!checkLogInStatus()) return;
	// @ts-ignore
	const userRef = doc(db, 'users', getAuth().currentUser.uid);

	await updateDoc(userRef, {
		[`settings.${key}`]: value // Firestore dot notation
	});
	await updateSettingParameter(key, value);
}

/**
 * @param {{ uid: string; displayName: any; email: any; emailVerified: any; providerData: { providerId: any; }[]; } | undefined} currentUser
 */
export async function addUserToCollection(currentUser) {
	if (!checkLogInStatus()) return;
	if (currentUser == undefined || getAuth().currentUser != currentUser) return;
	await setDoc(doc(db, `users`, currentUser.uid), {
		userId: currentUser.uid,
		// @ts-ignore
		email: DOMPurifyFunc(currentUser.email),
		providerId: currentUser.providerData[0].providerId,
		icon: 'none',
		created: serverTimestamp(),
		settings: {}
	});
	if (!currentUser.emailVerified) {
		// @ts-ignore
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
/**
 * @param {{ name: string | undefined; icon: any; professor: any; time: any; }} classJson
 */
export async function addClassToDatabase(classJson) {
	if (!checkLogInStatus()) return;
	if (classJson.name == '' || classJson.name == undefined) {
		throw new Error('Missing class name');
	}

	try {
		const classRef = await addDoc(collection(db, 'classes'), {
			icon: classJson.icon,
			// @ts-ignore
			name: DOMPurifyFunc(classJson.name),
			// @ts-ignore
			professor: DOMPurifyFunc(classJson.professor),
			time: classJson.time,
			// @ts-ignore
			userId: getAuth().currentUser.uid,
			createdAt: serverTimestamp(),
			notes: ''
		});
		updateClassInCache(classRef.id, classJson);
		return classRef.id;
	} catch (error) {
		throw error;
	}
}
/**
 * @param {{ icon: any; assignmentId: any; name: any; time: any; completed: any; }} assignmentJson
 */
export async function addAssignmentToDatabase(assignmentJson) {
	if (!checkLogInStatus()) return;
	try {
		const assignmentRef = await addDoc(collection(db, 'assignments'), {
			icon: assignmentJson.icon,
			assignmentId: assignmentJson.assignmentId,
			// @ts-ignore
			name: DOMPurifyFunc(assignmentJson.name),
			time: assignmentJson.time,
			// @ts-ignore
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

// Update class / assignment data
/**
 * @param {string} classId
 * @param {any} classJson
 */
export async function updateClassInDatabase(classId, classJson) {
	if (!checkLogInStatus()) return;
	await updateDoc(doc(db, 'classes', classId), classJson);
	updateClassInCache(classId, classJson);
}

// Remove class / assignment data
/**
 * @param {string} classId
 */
export async function deleteClassFromDatabase(classId) {
	if (!checkLogInStatus()) return;
	await deleteDoc(doc(db, 'classes', classId));
	updateClassInCache(classId, '');
}

// Create a reference to the classes collection
const classesRef = collection(db, 'classes');
export async function getAllUserMadeClasses() {
	if (!checkLogInStatus()) {
		return;
	}

	let queryCheck = await getQueryCache('classes');

	if (queryCheck != null) {
		console.log('Retrieved classes from cache');
		return queryCheck;
	}

	// Create a query against the classes collection.
	const q = query(
		classesRef,
		// @ts-ignore
		where('userId', '==', getAuth().currentUser.uid),
		orderBy('createdAt', 'asc')
	);
	const querySnapshot = await getDocs(q);

	const querySnapshotResults = querySnapshot.docs.map((doc) => ({
		classId: doc.id, // Firestore document ID
		...doc.data() // Other document fields
	}));
	console.warn('Loaded Class Data from Database');
	updateQueryCache('classes', querySnapshotResults);
	return querySnapshotResults;
}

/**
 * @param {any} classId
 */
export async function getClassById(classId) {
	const allClasses = await getAllUserMadeClasses();
	return allClasses.find(
		(/** @type {{ classId: any; }} */ classEntry) => classEntry.classId == classId
	);
}

// Create a reference to the assignments collection
const assignmentsRef = collection(db, 'assignments');
export async function getAllUserMadeAssignments() {
	if (!checkLogInStatus()) return;
	// Create a query against the assignments collection.
	// @ts-ignore
	const q = query(assignmentsRef, where('userId', '==', getAuth().currentUser.uid));
	const querySnapshot = await getDocs(q);

	const querySnapshotResults = querySnapshot.docs.map((doc) => ({
		assignmentId: doc.id, // Firestore document ID
		...doc.data() // Other document fields
	}));

	return querySnapshotResults;
}

export function checkLogInStatus() {
	const loggedIn = getAuth().currentUser != null;
	if (!loggedIn) console.error('No current user.');
	return loggedIn;
}
