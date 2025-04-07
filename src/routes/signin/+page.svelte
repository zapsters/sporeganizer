<script>
	import { goto } from '$app/navigation';
	import Jquery from 'jquery';
	import { googlePopup, checkRequired, signUserIn } from '$lib/modal';
	import { onMount } from 'svelte';
	import { initTogglePasswordVisibilityListeners } from '$lib/helpers';
	onMount(() => {
		initTogglePasswordVisibilityListeners();
	});
	// @ts-ignore
	async function onSubmit(e) {
		e.preventDefault();
		var checkRequiredResponse = checkRequired('signIn-form');
		if (!checkRequiredResponse[0]) {
			// @ts-ignore
			Jquery('#signIn-statusText').html(checkRequiredResponse[1]);
			return;
		}
		const email = Jquery('#signIn-email').val();
		const password = Jquery('#signIn-password').val();
		await signUserIn(email, password)
			.then(() => {
				goto('/dashboard');
			})
			.catch((error) => {
				console.log('um2');
				Jquery('#signIn-statusText').html(error);
			});
	}
</script>

<div class="mainContainer flex">
	<div class="signIn content">
		<h1>Login to Your Account</h1>
		<h2>Don't let your tasks <i>sprout</i> out of control!</h2>
		<form action="" id="signIn-form" autocomplete="off">
			<div class="input-container">
				<input
					required
					type="text"
					name="email"
					id="signIn-email"
					autocomplete="email"
					data-np-autofill-field-type="email"
				/>
				<label for="email">Email</label>
			</div>
			<div class="input-container">
				<input
					required
					type="password"
					name="password"
					id="signIn-password"
					autocomplete="current-password"
				/>
				<label for="password">Password</label>
				<button class="toggleVisibility" aria-label="toggle Visibility">
					<img src="images/ui/eye-open.svg" alt="" srcset="" />
				</button>
			</div>

			<div class="input-container" style="text-align: left">
				<a class="primary" href="/forgot">Forgot Password</a>
			</div>
			<span id="signIn-statusText"></span>
			<div class="input-container">
				<input
					autocomplete="off"
					type="submit"
					id="signIn-submit"
					value="Sign In"
					onclick={(e) => {
						onSubmit(e);
					}}
				/>
			</div>
		</form>
		<div class="orBox">
			<span>OR</span>
			<hr class="raw" />
		</div>
		<a href="/signup" class="gsi-material-button">
			<div class="gsi-material-button-state"></div>
			<div class="gsi-material-button-content-wrapper">
				<span class="gsi-material-button-contents">Create Account</span>
			</div>
		</a>
		<button
			onclick={() => {
				googlePopup();
			}}
			class="gsi-material-button googleSignIn"
		>
			<div class="gsi-material-button-state"></div>
			<div class="gsi-material-button-content-wrapper">
				<div class="gsi-material-button-icon">
					<svg
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 48 48"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						style="display: block"
					>
						<path
							fill="#EA4335"
							d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
						></path>
						<path
							fill="#4285F4"
							d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
						></path>
						<path
							fill="#FBBC05"
							d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
						></path>
						<path
							fill="#34A853"
							d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
						></path>
						<path fill="none" d="M0 0h48v48H0z"></path>
					</svg>
				</div>
				<span class="gsi-material-button-contents">Sign in with Google</span>
				<span id="googleSignIn" style="display: none">Sign in with Google</span>
			</div>
		</button>
	</div>
</div>
