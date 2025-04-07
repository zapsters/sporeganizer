import Jquery from 'jquery';
import {
	getAuth,
	createUserWithEmailAndPassword,
	signOut,
	updateProfile,
	signInWithEmailAndPassword,
	signInWithPopup,
	signInWithRedirect,
	GoogleAuthProvider,
	updateEmail,
	reauthenticateWithCredential,
	deleteUser,
	updatePassword,
	sendPasswordResetEmail
} from 'firebase/auth';
import { goto } from '$app/navigation';

import * as alertManager from '$lib/alert.js';
import * as firestoreDatabase from '$lib/firestoreDatabase';
import { clearLocalData } from './userData';

// USER HANDLING =========================================
const auth = getAuth();

export async function signUserUp(displayName, email, password) {
	if (displayName.length > 30) throw new Error('Display name is invalid.');

	return await createUserWithEmailAndPassword(auth, email, password)
		.then(() => {
			firestoreDatabase.addUserToCollection(auth.currentUser);

			updateProfile(auth.currentUser, {
				displayName: displayName
			}).then(() => {
				Jquery('.displayName').html(auth.currentUser.displayName);
			});
			clearLocalData();
		})
		.catch((error) => {
			Jquery('#signUp-statusText').html(error.message);
			console.error('Authentication error:', error.code, error.message);
			throw new Error(error.message);
		});
}

export async function signUserIn(siEmail, siPassword) {
	await signInWithEmailAndPassword(auth, siEmail, siPassword);
	clearLocalData();
}

export async function sendResetPasswordEmail(email) {
	return await sendPasswordResetEmail(getAuth(), email)
		.then(() => {
			// Password reset email sent!
			return '<p>Password reset email sent</p>';
		})
		.catch((error) => {
			return error.message;
		});
}

export async function googlePopup() {
	const provider = new GoogleAuthProvider();

	window.sessionStorage.setItem('pending', '1');
	if (true) {
		signInWithPopup(auth, provider)
			.then((result) => {
				firestoreDatabase.addUserToCollection(result.user);
				clearLocalData();
				goto('/dashboard');
			})
			.catch((error) => {
				throw error;
			});
	} else {
		signInWithRedirect(auth, provider);
	}
}

export async function reauthenticate(credentials) {
	const auth = getAuth();
	const user = auth.currentUser;

	return await reauthenticateWithCredential(user, credentials)
		.then(() => {
			// User re-authenticated.
			return true;
		})
		.catch((error) => {
			throw new Error(error.message);
		});
}

export async function updateUserPassword(newPassword) {
	await updatePassword(getAuth().currentUser, newPassword)
		.then(() => {
			console.log('worked', newPassword);

			return 'success';
		})
		.catch((error) => {
			throw new Error(error);
		});
}

export async function updateUserEmail(newEmail) {
	return await updateEmail(getAuth().currentUser, newEmail)
		.then(() => {
			return 'success';
		})
		.catch((error) => {
			return error;
		});
}

export async function updateUserDisplayName(displayName, responseElement) {
	await firestoreDatabase.updateFieldInUserCollection(auth.currentUser, 'displayName');

	updateProfile(auth.currentUser, {
		displayName: displayName
	})
		.then((data) => {
			Jquery(responseElement).html('Display Name Updated!');
			alertManager.generateModalAlert({
				icon: 'check',
				header: `Your display name is now`,

				subHeader: `'${auth.currentUser.displayName}'`
			});

			Jquery('.displayName').html(auth.currentUser.displayName);

			Jquery('#displayNameInput').val(auth.currentUser.displayName);
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
			console.error(errorCode, errorMessage);
			Jquery(responseElement).html(`${errorCode} ${errorMessage}`);
		});
}

export function signUserOut() {
	signOut(auth)
		.then(() => {
			clearLocalData();
			goto('/');
		})
		.catch((error) => {
			throw error;
		});
}

export function deleteCurrentUser() {
	firestoreDatabase.deleteUserFromCollection(getAuth().currentUser.uid);

	deleteUser(getAuth().currentUser)
		.then(() => {
			// User deleted.
			alertManager.generateModalAlert({ header: 'Your account is now deleted.' });
			goto('/');
		})
		.catch((error) => {
			// An error ocurred
			alertManager.generateModalAlert({
				header: `An error occurred while deleting your account.`,
				bodyText: `${error.message}`
			});
		});
}

// HELPER FUNCTIONS =====================

export function redirectPageRequiresAccount(redirect = true) {
	alertManager
		.generateModalAlert({
			header: 'Requires an Account',
			subHeader: `No user logged in`,
			bodyText: `Ready to see what Sporeganizer has to offer? Create an account to get started!`,
			buttons: [
				{
					text: 'Login'
				}
			]
		})
		.then(function () {
			if (redirect) goto('/signin');
		});
}

export function checkRequired(id) {
	let allAreFilled = true;
	let reason = 'valid';

	document
		.getElementById(id)
		.querySelectorAll('[required]')
		.forEach(function (i: HTMLInputElement) {
			if (!allAreFilled) return;

			if (i.type === 'radio') {
				let radioValueCheck = false;

				document
					.getElementById('myForm')
					.querySelectorAll(`[name=${i.name}]`)
					.forEach(function (r: HTMLInputElement) {
						if (r.checked) radioValueCheck = true;
					});
				allAreFilled = radioValueCheck;
				if (!allAreFilled) reason = 'Complete radio selection.';
				return;
			}

			if (i.type === 'email' || i.id.toString().includes('email')) {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

				allAreFilled = emailRegex.test(i.value);
				if (!allAreFilled) reason = 'Please enter a valid email.';
			}

			if (!i.value) {
				allAreFilled = false;
				if (!allAreFilled) reason = 'Please complete all required boxes.';
				return;
			}
		});
	return [allAreFilled, reason];
}
