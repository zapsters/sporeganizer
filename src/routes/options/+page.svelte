<script>
	import Jquery from 'jquery';
	import { onMount } from 'svelte';
	import * as cookieManager from '$lib/cookieManager.min.js';
	import { updateUserSettings } from '$lib/firestoreDatabase.js';
	import { getSettings, getSettingParameter } from '$lib/userData.js';
	import { browserTheme, setTheme } from '$lib/browserTheme';
	import Footer from '$lib/components/Footer.svelte';

	onMount(async () => {
		// Redirect user to the login page if we are not logged in.
		// Give it a second to allow firebase to auto-login on page visit.
		await getSettings();
		Jquery('#24hrTimeInput').prop('checked', getSettingParameter('do24HrTime'));

		Jquery('#24hrTimeInput').on('settingsChangeEvent', () => {
			console.log('setting change caught');
		});

		Jquery('#appearanceSelect button').on('click', function () {
			Jquery('#appearanceSelect button').each(function () {
				Jquery(this).removeClass('active');
			});
			Jquery(this).addClass('active');
			var data = Jquery(this).data('appearance');

			setTheme(data);
			Jquery('#appearanceSelectCurrentText').html(
				data.charAt(0).toUpperCase() + data.slice(1) + ' Mode'
			);
			updateAppearanceUI();
			switch (data) {
				case 'dark':
					cookieManager.setCookie('themePreference', 'dark');
					cookieManager.getCookie('themePreference');
					break;
				case 'light':
					cookieManager.setCookie('themePreference', 'light');
					break;
				default:
					cookieManager.clearCookie('themePreference');
					break;
			}
		});

		updateAppearanceUI();
		function updateAppearanceUI() {
			switch (browserTheme) {
				case 'dark':
					Jquery('#darkModeBtn').addClass('active');
					Jquery('#lightModeBtn').removeClass('active');
					Jquery('#autoModeBtn').removeClass('active');
					break;
				case 'light':
					Jquery('#darkModeBtn').removeClass('active');
					Jquery('#lightModeBtn').addClass('active');
					Jquery('#autoModeBtn').removeClass('active');
					break;
				case 'auto':
				default:
					Jquery('#darkModeBtn').removeClass('active');
					Jquery('#lightModeBtn').removeClass('active');
					Jquery('#autoModeBtn').addClass('active');
					break;
			}
		}
		Jquery('#appearanceSelectCurrentText').html(
			browserTheme.charAt(0).toUpperCase() + browserTheme.slice(1) + ' Mode'
		);

		Jquery('#24hrTimeInput').on('change', function () {
			if (Jquery(this).is(':checked')) {
				updateUserSettings('do24HrTime', true);
			} else {
				updateUserSettings('do24HrTime', false);
			}
		});
	});
</script>

<div class="mainContainer mainContainer-alt account options">
	<header>
		<h1><span>Options</span></h1>
	</header>
	<div class="mainContainer-content">
		<h2>Time Settings</h2>
		<section>
			<span>24 hour time</span>
			<label class="toggle-switch square">
				<input type="checkbox" id="24hrTimeInput" />
				<span class="slider"></span>
			</label>
		</section>
		<h2>Appearance</h2>
		<section id="appearanceSelect">
			<span id="appearanceSelectCurrentText">#### Mode</span>
			<button class="raw" data-appearance="auto" id="autoModeBtn" aria-label="Match System Theme">
				<i class="pixelart-icons-font-clock"></i>
			</button>
			<button class="raw" data-appearance="light" id="lightModeBtn" aria-label="Light Mode">
				<i class="pixelart-icons-font-cloud-sun"></i>
			</button>
			<button class="raw" data-appearance="dark" id="darkModeBtn" aria-label="Dark Mode">
				<i class="pixelart-icons-font-cloud-moon"></i>
			</button>
			<!-- <img src="images/cloud-auto.svg" data-appearance="auto" alt="" srcset="" /> -->
		</section>
		<p style="margin: 50px 0 0 0; font-size: 18px;">Version: {__APP_VERSION__}</p>
		<p><a href="/about" style="font-size: 18px;">About this project</a></p>
		<Footer />
	</div>
</div>
