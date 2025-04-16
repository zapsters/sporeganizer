<script lang="ts">
	import { callClassModal } from '$lib/customModals';
	import { getClassById } from '$lib/firestoreDatabase';
	import { areAllEntriesEqual } from '$lib/helpers';
	import { getMushroomDataFromName } from '$lib/mushroomBank';
	import { convertTo12Hour } from '$lib/helpers';
	import type { ClassJson } from '$lib/types';

	export let classData: ClassJson;

	if (!classData?.classId) throw new Error('NO CLASSID WAS PASSED');

	// Handle fetching class details
	async function handleEditClick() {
		const classDetails = await getClassById(classData.classId);
		callClassModal('edit', classDetails);
	}

	// Determine if a day is selected
	function ifDayIsSelected(dayAbbreviation: string): string {
		return classData.time?.[dayAbbreviation] ? 'selected' : '';
	}

	// Format the times for the class schedule
	function getTimes() {
		const time = classData.time;
		if (!time || Object.keys(time).length === 0) return '';

		const times = Object.entries(time)
			.map(([day, [start, end]]) =>
				start && end ? { day, start: convertTo12Hour(start), end: convertTo12Hour(end) } : null
			)
			.filter(Boolean);

		if (times.length === 0) return '';

		// If all entries are equal, return a single time slot
		if (areAllEntriesEqual(time)) {
			let { start, end } = times[0];
			return `<tr><td>${start} - ${end}</td></tr>`;
		}

		// Otherwise, return a list of all times
		return times
			.map(({ day, start, end }) => `<tr><td>${day}</td><td>${start} - ${end}</td></tr>`)
			.join('');
	}

	// Get the day selection UI for the class schedule
	function getDatesContainer() {
		if (!classData.time || Object.keys(classData.time).length === 0) return '';

		const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
		const selectedDays = daysOfWeek.filter((day) => ifDayIsSelected(day));

		return `
			<ul class="classDatesContainer">
				${selectedDays.map((day) => `<li class="${ifDayIsSelected(day)}">${day}</li>`).join('')}
			</ul>
		`;
	}

	// Reactive assignment for mushroom icon data
	$: mushroomIconData = getMushroomDataFromName(classData.icon);
</script>

<div class="classElement" id="classElem-{classData.classId}" data-classId={classData.classId}>
	<div
		class="icon"
		style="background-image: url('{mushroomIconData.icon}'); background-size: {mushroomIconData.scale};"
	></div>
	<div class="classElement-content">
		<h3>{classData.name}</h3>
		<h4>{classData.notes}</h4>

		{@html getDatesContainer()}

		<table>{@html getTimes()}</table>
	</div>
	<div class="actionBtns">
		<div class="actionButton">
			<button
				on:click={handleEditClick}
				class="raw editOnClick pixelart-icons-font-edit"
				aria-label="Edit class"
			></button>
		</div>
	</div>
</div>
