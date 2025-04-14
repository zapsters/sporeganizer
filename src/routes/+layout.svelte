<script lang="ts">
	import '../styles/styles.scss';
	import { onMount } from 'svelte';
	import jQuery from 'jquery';
	import { firebase } from '$lib';
	import { getAuth, onAuthStateChanged } from 'firebase/auth';

	import { navigating } from '$app/state';
	import { fly } from 'svelte/transition';
	import { syncSettings } from '$lib/userData';
	import { checkDarkModePreference } from '$lib/browserTheme';
	export let settings;

	let sidebarOpen: boolean = true; // Define the state outside of the event

	onMount(async () => {
		firebase.connectEmulators();
		checkDarkModePreference();

		const auth = getAuth();

		// Wait to continue until our Auth services has initialized.
		await getAuth().authStateReady();

		await syncSettings();

		onAuthStateChanged(auth, async (user) => {
			if (user) {
				// User is signed in, see docs for a list of available properties
				// https://firebase.google.com/docs/reference/js/auth.user

				// @ts-ignore
				let uid = user.uid;
				// @ts-ignore
				jQuery('.displayName').html(user.displayName);
				// @ts-ignore
				jQuery('#displayNameInput').val(user.displayName);
				jQuery('#status').html('signed in');
				jQuery('#nav-accountTab').css('display', 'block');
				jQuery('#nav-signInTab').css('display', 'none');
			} else {
				jQuery('#status').html('not signed in');
				jQuery('#nav-accountTab').css('display', 'none');
				jQuery('#nav-signInTab').css('display', 'block');
			}
		});

		jQuery('.sidebarToggle').on('click', function () {
			sidebarOpen = !sidebarOpen; // Toggle the state

			if (sidebarOpen) {
				jQuery(this)
					.find('i')
					.html(
						`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2zM10 7H8v2h2zm0 0h2V5h-2zm0 10H8v-2h2zm0 0h2v2h-2z" /> </svg>`
					);
				jQuery('aside').addClass('sb-expanded');
			} else {
				jQuery(this)
					.find('i')
					.html(
						`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2zm10-4h2v2h-2zm0 0h-2V5h2zm0 10h2v-2h-2zm0 0h-2v2h2z"/></svg>`
					);
				jQuery('aside').removeClass('sb-expanded');
			}
		});
	});

	let isNavigating = false;

	$: if (navigating) {
		isNavigating = true;
		setTimeout(() => {
			isNavigating = false;
		}, 500); // Short delay for smoother UX
	}
</script>

{#if isNavigating}
	<div class="loader" transition:fly={{ y: -20, duration: 300 }}>
		<img src="/images/ui/ShaggyInkCapAnim.gif" alt="loader" srcset="" />
		<p style="padding: 0; margin: 0;">Loading...</p>
	</div>
{/if}

<main id="app-root">
	<aside class="sb-expanded">
		<nav>
			<ul>
				<li>
					<a href="/">
						<i><img src="/images/Sporeganizer.png" class="logo" alt="" srcset="" /></i>
						<span class="logo">Sporeganizer</span>
					</a>
				</li>
				<li id="nav-homeTab" class="hideOnMobile">
					<a href="/">
						<i><img src="/images/ui/home.svg" alt="dashboard" srcset="" /></i>
						<span>Home</span>
					</a>
				</li>
				<li>
					<a href="/dashboard">
						<i><img src="/images/ui/dashboard.png" alt="dashboard" srcset="" /></i>
						<span>Dashboard</span>
					</a>
				</li>
				<li id="nav-signInTab">
					<a href="/signin">
						<i><img src="/images/ui/person.svg" alt="login icon" srcset="" /></i>
						<span>Login</span>
					</a>
				</li>
				<li id="nav-accountTab" style="display: none">
					<a href="/account" class="wordWrap">
						<i><img src="/images/ui/person.svg" alt="account icon" srcset="" /></i>
						<span class="displayName">Account</span>
					</a>
				</li>
				{#if settings}
					<p>Theme: {settings.theme}</p>
				{/if}
				<!-- <li>
						<a href="/dashboard">
							<i class="pixelart-icons-font-art-text pixelArtIcon"></i>
							<span>Dashboard</span>
              </a>
							</li> -->
				<li id="nav-optionsTab">
					<a href="/options">
						<i
							><img
								src="/images/ui/settings.svg"
								style="width: 100%"
								alt="dashboard"
								srcset=""
							/></i
						>
						<span>Options</span>
					</a>
				</li>
				<li>
					<button class="clickable sidebarToggle raw" aria-label="home">
						<i
							><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path
									fill="#ffffff"
									d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2zM10 7H8v2h2zm0 0h2V5h-2zm0 10H8v-2h2zm0 0h2v2h-2z"
								/>
							</svg>
						</i>
					</button>
				</li>
			</ul>
		</nav>
	</aside>
	<div id="app">
		<slot />
	</div>
</main>

<style>
	.loader {
		position: fixed;
		top: 50%;
		left: 50%;
		z-index: 100 !important;
		transform: translate(-50%, -50%);
		padding: 1rem 2rem;
		background: #333;
		color: white;
		border-radius: 8px;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
	}
</style>
