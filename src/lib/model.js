import Jquery from 'jquery';
import {
	getAuth,
	createUserWithEmailAndPassword,
	signOut,
	updateProfile,
	signInWithEmailAndPassword,
	// @ts-ignore
	onAuthStateChanged,
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

// @ts-ignore
// @ts-ignore
import { app, db, provider } from '$lib/firebase';
import * as alertManager from '$lib/alert.js';
import * as firestoreDatabase from '$lib/firestoreDatabase';
import DOMPurify from 'dompurify';

// @ts-ignore
export function DOMPurifyFunc(input) {
	return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

// USER HANDLING =========================================
const auth = getAuth();
// @ts-ignore
export async function signUserUp(displayName, email, password) {
	if (displayName.length > 30) throw new Error('Display name is invalid.');

	return await createUserWithEmailAndPassword(auth, email, password)
		.then(() => {
			// @ts-ignore
			firestoreDatabase.addUserToCollection(auth.currentUser);
			// @ts-ignore
			updateProfile(auth.currentUser, {
				displayName: displayName
			}).then(() => {
				// @ts-ignore
				Jquery('.displayName').html(auth.currentUser.displayName);
			});
		})
		.catch((error) => {
			Jquery('#signUp-statusText').html(error.message);
			console.error('Authentication error:', error.code, error.message);
			throw new Error(error.message);
		});
}

// @ts-ignore
export async function signUserIn(siEmail, siPassword) {
	await signInWithEmailAndPassword(auth, siEmail, siPassword);
}

// @ts-ignore
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
	// @ts-ignore
	window.sessionStorage.setItem('pending', 1);
	if (true) {
		signInWithPopup(auth, provider)
			.then((result) => {
				firestoreDatabase.addUserToCollection(result.user);
				goto('/dashboard');
			})
			.catch((error) => {
				throw error;
			});
	} else {
		// @ts-ignore
		// @ts-ignore
		signInWithRedirect(auth, provider);
	}
}

// @ts-ignore
export async function reauthenticate(credentials) {
	const auth = getAuth();
	const user = auth.currentUser;
	// @ts-ignore
	return await reauthenticateWithCredential(user, credentials)
		.then(() => {
			// User re-authenticated.
			return true;
		})
		.catch((error) => {
			throw new Error(error.message);
		});
}

// @ts-ignore
export async function updateUserPassword(newPassword) {
	// @ts-ignore
	await updatePassword(getAuth().currentUser, newPassword)
		.then(() => {
			console.log('worked', newPassword);

			return 'success';
		})
		.catch((error) => {
			console.log('didnpt work', newPassword);
			throw new Error(error);
		});
}

// @ts-ignore
export async function updateUserEmail(newEmail) {
	// @ts-ignore
	return await updateEmail(getAuth().currentUser, newEmail)
		.then(() => {
			return 'success';
		})
		.catch((error) => {
			return error;
		});
}

// @ts-ignore
export async function updateUserDisplayName(displayName, responseElement) {
	// @ts-ignore
	await firestoreDatabase.updateFieldInUserCollection(auth.currentUser, 'displayName', displayName);
	// @ts-ignore
	updateProfile(auth.currentUser, {
		displayName: displayName
	})
		// @ts-ignore
		// @ts-ignore
		.then((data) => {
			Jquery(responseElement).html('Display Name Updated!');
			alertManager.generateModalAlert({
				icon: 'check',
				header: `Your display name is now`,
				// @ts-ignore
				subHeader: `'${auth.currentUser.displayName}'`
			});

			// @ts-ignore
			Jquery('.displayName').html(auth.currentUser.displayName);
			// @ts-ignore
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
			goto('/');
		})
		.catch((error) => {
			throw error;
		});
}

export function deleteCurrentUser() {
	// @ts-ignore
	firestoreDatabase.deleteUserFromCollection(getAuth().currentUser.uid);
	// @ts-ignore
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
					// @ts-ignore
					text: 'Login'
				}
			]
		})
		.then(function () {
			if (redirect) goto('/signin');
		});
}

/**
 * @param {Date} date
 */
export function getDayOfTheWeekAbbr(date) {
	const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const dayIndex = date.getDay();
	return daysOfWeek[dayIndex];
}

// @ts-ignore
export function initTogglePasswordVisibilityListeners() {
	Jquery('.toggleVisibility').attr('tabindex', '0');
	Jquery('.toggleVisibility').on('click', function (e) {
		e.preventDefault();
		Jquery(this).toggleClass('visibility');
		if (Jquery(this).hasClass('visibility')) {
			Jquery(this).find('img').attr('src', 'images/ui/eye-closed.svg');
			Jquery(this).parent().find('input').attr('type', 'text');
		} else {
			Jquery(this).find('img').attr('src', 'images/ui/eye-open.svg');
			Jquery(this).parent().find('input').attr('type', 'password');
		}
	});
}

// @ts-ignore
export function areAllEntriesEqual(schedule) {
	const timeEntries = Object.values(schedule).map((times) => JSON.stringify(times));

	return timeEntries.every((entry) => entry === timeEntries[0]);
}

// @ts-ignore
export function resizeSelect(selectId) {
	const select = document.getElementById(selectId);
	const tempSpan = document.createElement('span');

	// Apply same styles to mimic select option rendering
	// tempSpan.style.visibility = 'hidden';
	// tempSpan.style.position = 'absolute';
	// tempSpan.style.whiteSpace = 'nowrap';
	tempSpan.style.font = getComputedStyle(select).font;
	tempSpan.style.fontSize = getComputedStyle(select).fontSize;
	tempSpan.style.fontWeight = '900';
	// @ts-ignore
	tempSpan.textContent = select.options[select.selectedIndex].text;
	document.body.appendChild(tempSpan);
	// Adjust the select width to match the option text +/- some padding
	select.style.width =
		tempSpan.offsetWidth + parseInt(getComputedStyle(select).backgroundSize) - 13 + 'px';

	document.body.removeChild(tempSpan);
}

// @ts-ignore
export function checkRequired(id) {
	let allAreFilled = true;
	let reason = 'valid';
	// @ts-ignore
	document
		.getElementById(id)
		.querySelectorAll('[required]')
		.forEach(function (i) {
			if (!allAreFilled) return;
			// @ts-ignore
			if (i.type === 'radio') {
				let radioValueCheck = false;
				// @ts-ignore
				document
					.getElementById('myForm')
					// @ts-ignore
					.querySelectorAll(`[name=${i.name}]`)
					.forEach(function (r) {
						// @ts-ignore
						if (r.checked) radioValueCheck = true;
					});
				allAreFilled = radioValueCheck;
				if (!allAreFilled) reason = 'Complete radio selection.';
				return;
			}
			// @ts-ignore
			if (i.type === 'email' || i.id.toString().includes('email')) {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				// @ts-ignore
				allAreFilled = emailRegex.test(i.value);
				if (!allAreFilled) reason = 'Please enter a valid email.';
			}
			// @ts-ignore
			if (!i.value) {
				allAreFilled = false;
				if (!allAreFilled) reason = 'Please complete all required boxes.';
				return;
			}
		});
	return [allAreFilled, reason];
}
