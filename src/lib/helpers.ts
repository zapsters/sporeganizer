import Jquery from 'jquery';
import DOMPurify from 'dompurify';
import { getSettingParameter } from './userData';

export function areAllEntriesEqual(schedule) {
	const timeEntries = Object.values(schedule).map((times) => JSON.stringify(times));

	return timeEntries.every((entry) => entry === timeEntries[0]);
}

export function convertTo12Hour(time24) {
	if (getSettingParameter('do24HrTime')) return time24;
	const [hours, minutes] = time24.split(':').map(Number);
	const period = hours < 12 || hours === 24 ? 'AM' : 'PM';
	const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
	const formattedMinutes = minutes.toString().padStart(2, '0');
	return `${formattedHours}:${formattedMinutes} ${period}`;
}

export function DOMPurifyFunc(input) {
	return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * @param {Date} date
 */
export function getDayOfTheWeekAbbr(date) {
	const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const dayIndex = date.getDay();
	return daysOfWeek[dayIndex];
}

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

export function resizeSelect(selectId: string) {
	// Get the select element
	const select = document.getElementById(selectId) as HTMLSelectElement;
	if (!select) return; // Exit if no element is found

	// Create a temporary span to measure the selected option's width
	const tempSpan = document.createElement('span');

	// Apply the same styles to mimic the selected option's appearance
	const computedStyle = getComputedStyle(select);
	tempSpan.style.font = computedStyle.font;
	tempSpan.style.fontSize = computedStyle.fontSize;
	tempSpan.style.fontWeight = 'normal'; // Ensuring the style matches exactly
	tempSpan.style.whiteSpace = 'nowrap'; // Prevent text wrapping in the span

	// Set the text of the temporary span to the selected option's text
	tempSpan.textContent = select.options[select.selectedIndex].text;
	document.body.appendChild(tempSpan);

	// Adjust the select width based on the tempSpan's width
	const paddingLeft = parseInt(computedStyle.paddingLeft);
	const paddingRight = parseInt(computedStyle.paddingRight);
	const borderLeft = parseInt(computedStyle.borderLeftWidth);
	const borderRight = parseInt(computedStyle.borderRightWidth);

	// Calculate the full width, including padding and borders
	const newWidth =
		tempSpan.offsetWidth + paddingLeft + paddingRight + borderLeft + borderRight + 30;

	// Set the width of the select element
	select.style.width = newWidth + 'px';

	// Clean up: remove the temporary span
	document.body.removeChild(tempSpan);
}

export function isSameDay(date1, date2) {
	return date1.toDateString() === date2.toDateString();
}

export function waitForStoreTrue(store) {
	return new Promise<void>((resolve) => {
		const unsub = store.subscribe((val) => {
			// Only resolve and unsubscribe when the value is `true`
			if (val === true) {
				unsub(); // Unsubscribe after receiving the value
				resolve(); // Resolve the promise
			}
		});
	});
}

const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(someDateTimeStamp: Date) {
	const now = new Date();
	const dt = new Date(someDateTimeStamp);

	// Normalize both dates to midnight for accurate day comparison
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const target = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

	const diffTime = target.getTime() - today.getTime();
	const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
	const sameYear = now.getFullYear() === dt.getFullYear();
	const alertIcon = `<i class="pixelart-icons-font-alert pixelArtIcon"></i>`;

	if (diffDays === 0) {
		return 'Today';
	} else if (diffDays === -1) {
		return 'Yesterday' + alertIcon;
	} else if (diffDays === 1) {
		return 'Tomorrow';
	} else if (diffDays < -1) {
		return `${Math.abs(diffDays)} days ago` + alertIcon;
	} else if (diffDays > 1 && diffDays <= 6) {
		return fullDays[dt.getDay()];
	} else if (diffDays > 6 && sameYear) {
		return `${months[dt.getMonth()]} ${dt.getDate()}`;
	} else {
		return `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
	}
}

export function formatDateToIsoAlt(date: Date) {
	const pad = (num) => String(num).padStart(2, '0');

	const year = date.getFullYear();
	const month = pad(date.getMonth() + 1); // getMonth() is 0-based
	const day = pad(date.getDate());
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());

	return `${year}-${month}-${day}T${hours}:${minutes}`;
}
