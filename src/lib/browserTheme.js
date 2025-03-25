import Jquery from 'jquery';
import * as cookieManager from '$lib/cookieManager.min.js';

export var browserTheme = '';

export function checkDarkModePreference() {
	if (cookieManager.checkCookie('themePreference')) {
		switch (cookieManager.getCookie('themePreference')) {
			case 'dark':
				setTheme('dark');
				break;
			case 'light':
				setTheme('light');
				break;
			case 'auto':
				if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
					setTheme('dark');
				} else {
					setTheme('light');
				}
				break;
			default:
				cookieManager.clearCookie('themePreference');
		}
	} else {
		setTheme('auto');
	}
}

export function setTheme(theme) {
	switch (theme) {
		case 'light':
			browserTheme = 'light';
			Jquery('html').addClass('theme-light');
			Jquery('html').removeClass('theme-dark');
			break;
		case 'dark':
			browserTheme = 'dark';
			Jquery('html').removeClass('theme-light');
			Jquery('html').addClass('theme-dark');
			break;
		default:
			browserTheme = 'auto';
			if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
				Jquery('html').removeClass('theme-light');
				Jquery('html').addClass('theme-dark');
			} else {
				Jquery('html').addClass('theme-light');
				Jquery('html').removeClass('theme-dark');
			}
			break;
	}
}
