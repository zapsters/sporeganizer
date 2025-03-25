<script>
	// @ts-nocheck
	import { alertManager } from '$lib';
	import Jquery from 'jquery';
	import { onMount } from 'svelte';
	import { onAuthStateChanged, getAuth, EmailAuthProvider } from 'firebase/auth';
	import {
		updateUserSettings,
		addClassToDatabase,
		getAllUserMadeClasses,
		getAllUserMadeAssignments,
		deleteClassFromDatabase,
		getClassById,
		updateClassInDatabase
	} from '$lib/firestoreDatabase.js';
	import {
		redirectPageRequiresAccount,
		resizeSelect,
		getDayOfTheWeekAbbr,
		signUserOut,
		DOMPurifyFunc,
		updateUserPassword,
		deleteCurrentUser,
		reauthenticate,
		updateUserDisplayName,
		initTogglePasswordVisibilityListeners
	} from '$lib/model';
	import { syncSettings, settings } from '$lib/userData.js';

	onMount(() => {
		// Redirect user to the login page if we are not logged in.
		// Give it a second to allow firebase to auto-login on page visit.
		const auth = getAuth();
		const unsubscribeDashboard = onAuthStateChanged(auth, (user) => {
			if (user) {
				// Do logic
				Jquery('.displayName').html(user.displayName);
				Jquery('#displayNameInput').val(user.displayName);
				Jquery('#emailInput').val(user.email);
				Jquery('#passwordInput').val('1234');
				unsubscribeDashboard();
				// User is signed in
			} else {
				redirectPageRequiresAccount();
				unsubscribeDashboard();
				// User is signed out
			}
		});
	});

	function onDeleteAccountBtnPress() {
		alertManager.generateModalAlert({
			icon: 'downasaur',
			header: 'Delete Account?',
			subHeader: `<span class="alert">This is un-reverseable.</span>`,
			bodyText: `<span id="deleteAccountStatusText"></span>`,
			buttons: [
				{ text: 'Cancel' },
				{
					text: 'Delete Account',
					class: 'dangerous',
					closeModalOnClick: 'false',
					onClick: async () => {
						try {
							deleteCurrentUser();
						} catch (error) {
							Jquery('#deleteAccountStatusText').html(error);
						}
					}
				}
			]
		});
	}

	function onDisplayNameBtnClick() {
		const auth = getAuth();
		const user = auth.currentUser;
		var newName = DOMPurifyFunc(Jquery('#displayNameInput').val());

		if (Jquery('#displayNameInput').val() != user.displayName) {
			alertManager.generateModalAlert({
				icon: 'label',
				header: 'Change Display Name?',
				subHeader: `${DOMPurifyFunc(user.displayName)} &#8674; ${DOMPurifyFunc(newName)}`,
				buttons: [
					{ text: 'Cancel' },
					{
						text: 'Change Name',
						// closeModalOnClick: "false",
						onClick: () => {
							updateUserDisplayName(DOMPurifyFunc(newName), '#displayNameChangeStatusText');
						}
					}
				]
			});
		} else {
			Jquery('#displayNameChangeStatusText').html(
				'<span>Enter a new display name to change it.</span>'
			);
		}
	}

	function onPasswordChangeBtnClick() {
		switch (getAuth().currentUser.providerData[0].providerId) {
			case 'google.com':
				alertManager.generateModalAlert({
					icon: 'error',
					header: 'Google Account',
					subHeader: 'Could not change password.',
					bodyText: 'Your account is associated with a google account.'
				});
				break;
			case 'password':
			default:
				alertManager.generateModalAlert({
					icon: 'label',
					header: 'Change Password',
					bodyText: `For your security, confirm your login details.
								<div class="signIn" style="margin-top: 20px">
								<form action="" id="changePassword-form">
								<div class="input-container">
									<input required="" type="password" id="changePassword-currentPassword" autocomplete="current-password">
									<label>Current Password</label>
									<div class="toggleVisibility">
										<img src="images/ui/eye-open.svg" alt="" srcset="">
									</div>
								</div>
								<div class="input-container">
									<input required="" type="password" id="changePassword-newPassword" autocomplete="current-password">
									<label>New Password</label>
									<div class="toggleVisibility">
										<img src="images/ui/eye-open.svg" alt="" srcset="">
									</div>
								</div>
								<div class="input-container">
									<input required="" type="password" id="changePassword-newPasswordSecond" autocomplete="current-password" data-np-autofill-field-type="password">
									<label>New Password</label>
									<div class="toggleVisibility">
									<img src="images/ui/eye-open.svg" alt="" srcset="">
								</div>
							</div>
							<span id="changePassword-statusText"></span>
							</form>
						</div>`,
					buttons: [
						{
							text: `Change Password`,
							closeModalOnClick: false,
							onlyAllowOneClick: false,
							onClick: async () => {
								try {
									var cred = EmailAuthProvider.credential(
										getAuth().currentUser.email,
										Jquery('#changePassword-currentPassword').val()
									);
									console.log(
										Jquery('#changePassword-newPasswordSecond').val(),
										Jquery('#changePassword-newPassword').val()
									);

									if (
										Jquery('#changePassword-newPasswordSecond').val() !=
										Jquery('#changePassword-newPassword').val()
									) {
										throw new Error('New passwords do not match');
										return;
									}

									await reauthenticate(cred);
									await updateUserPassword(Jquery('#changePassword-newPasswordSecond').val());
									alertManager.generateModalAlert({
										icon: 'check',
										header: 'Password Changed!',
										subHeader: '',
										bodyText: 'You may have to sign back in.'
									});
								} catch (error) {
									Jquery('#changePassword-statusText').html(error);
								}
							},
							class: 'secondary'
						}
					]
				});
				initTogglePasswordVisibilityListeners();
				break;
		}
	}

	function onEmailChangeBtnClick() {
		const auth = getAuth();
		const user = auth.currentUser;
		switch (getAuth().currentUser.providerData[0].providerId) {
			case 'google.com':
				alertManager.generateModalAlert({
					icon: 'error',
					header: 'Google Account',
					subHeader: 'Could not change email.',
					bodyText: 'Your account is associated with a google account.'
				});
				break;
			case 'password':
			default:
				alertManager.generateModalAlert({
					icon: 'label',
					header: 'Change Email',
					bodyText: `For your security, confirm your login details.
              <div class="signIn" style="margin-top: 20px">
              <form action="" id="changeEmail-form">
                <div class="input-container">
                <input required="" type="text" id="changeEmail-currentEmail" autocomplete="current-email">
                <label>Current Email</label>
                </div>
                <div class="input-container">
                <input required="" type="password" id="changeEmail-currentPassword" autocomplete="current-password">
                <label>Current Password</label>
                <div class="toggleVisibility">
                <img src="images/ui/eye-open.svg" alt="" srcset="">
                </div>
                </div>
                <div class="input-container">
                <input required="" type="text" id="changeEmail-newEmail" autocomplete="new-email" data-np-autofill-field-type="password">
                  <label>New Email</label>
                </div>
                <span id="changeEmail-statusText"></span>
                </form>
                </div>`,
					buttons: [
						{
							text: `Change Email`,
							closeModalOnClick: false,
							onClick: async () => {
								try {
									var cred = EmailAuthProvider.credential(
										Jquery('#changeEmail-currentEmail').val(),
										Jquery('#changeEmail-currentPassword').val()
									);
									await reauthenticate(cred);
									await updateUserEmail(Jquery('#changeEmail-newEmail').val());
									Jquery('#emailInput').val(getAuth().currentUser.email);
									alertManager.generateModalAlert({
										icon: 'check',
										header: 'Email Changed!',
										subHeader: '',
										bodyText: 'You may have to log back in.'
									});
								} catch (error) {
									Jquery('#changeEmail-statusText').html(error);
								}
							},
							class: 'secondary'
						}
					]
				});
				initTogglePasswordVisibilityListeners();
				break;
		}
	}
</script>

<div class="mainContainer mainContainer-alt account">
	<header>
		<h1><span>Account</span></h1>
	</header>
	<div class="mainContainer-content">
		<h2>Hi <span class="displayName">###</span>,</h2>
		<section>
			<h3>Display Name</h3>
			<form>
				<div class="inline">
					<input type="text" maxlength="30" autocomplete="off" id="displayNameInput" />
					<button
						type="button"
						class="button changeDisplayName"
						id="displayNameChangeButton"
						onclick={() => {
							onDisplayNameBtnClick();
						}}
					>
						Change Display Name
					</button>
					<span id="displayNameChangeStatusText"></span>
				</div>
				<h3>Password</h3>
				<div class="inline">
					<input
						class="readOnly"
						autocomplete="current-password"
						type="password"
						readonly
						id="passwordInput"
					/>
					<button
						type="button"
						onclick={() => {
							onPasswordChangeBtnClick();
						}}
						class="button changePasswordBtn"
						id="passwordChangeButton"
					>
						Change Password
					</button>
					<span id="passwordStatusText"></span>
				</div>
			</form>
			<h3>Email</h3>
			<div class="inline">
				<input class="readOnly" type="email" readonly id="emailInput" />
				<button
					type="button"
					onclick={() => {
						onEmailChangeBtnClick();
					}}
					class="button changeEmailBtn"
					id="emailChangeButton"
				>
					Change Email
				</button>
				<span id="emailStatusText"></span>
			</div>
			<button type="button" class="button signoutBtn" onclick={() => signUserOut()}>Signout</button>
			<button
				type="button"
				style="margin-top: 15px"
				id="deleteAccountBtn"
				class="button dangerous"
				onclick={() => onDeleteAccountBtnPress()}
			>
				Delete Account
			</button>
		</section>
	</div>
</div>
