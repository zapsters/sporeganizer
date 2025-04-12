<script lang="ts">
	import { callClassModal } from '$lib/customModals';
	import { getClassById } from '$lib/firestoreDatabase';
	import { areAllEntriesEqual } from '$lib/helpers';
	import { getMushroomDataFromName } from '$lib/mushroomBank';
	import { convertTo12Hour } from '$lib/helpers';
	import type { ClassJson } from '$lib/types';

	export let classData: ClassJson;

	if (!classData?.classId) throw new Error('NO CLASSID WAS PASSED');

	async function handleEditClick() {
		const classDetails = await getClassById(classData.classId);
		callClassModal('edit', classDetails);
	}

	function ifDayIsSelected(dayAbbreviation) {
		return classData.time?.[dayAbbreviation] ? 'selected' : '';
	}

	function getTimes() {
		const time = classData.time;
		if (!time || Object.keys(time).length === 0) return '';

		const times = Object.entries(time)
			.map(([day, [start, end]]) =>
				start && end ? { day, start: convertTo12Hour(start), end: convertTo12Hour(end) } : null
			)
			.filter(Boolean);

		if (times.length === 0) return '';

		if (areAllEntriesEqual(time)) {
			let { start, end } = times[0];
			return `<tr><td>${start} - ${end}</td></tr>`;
		}

		return times
			.map(({ day, start, end }) => `<tr><td>${day}</td><td>${start} - ${end}</td></tr>`)
			.join('');
	}

	function getDatesContainer() {
		if (!classData.time || Object.keys(classData.time).length === 0) return '';
		// If Saturday and Sunday are not selected, then hide them in the class element.
		if (ifDayIsSelected('Sat') != 'selected' && ifDayIsSelected('Sun') != 'selected') {
			return `
      <ul class="classDatesContainer">
			<li class="${ifDayIsSelected('Mon')}">Mon</li>
			<li class="${ifDayIsSelected('Tue')}">Tue</li>
			<li class="${ifDayIsSelected('Wed')}">Wed</li>
			<li class="${ifDayIsSelected('Thu')}">Thu</li>
			<li class="${ifDayIsSelected('Fri')}">Fri</li>
      </ul>
			`;
		}
		return `
      <ul class="classDatesContainer">
			<li class="${ifDayIsSelected('Mon')}">Mon</li>
			<li class="${ifDayIsSelected('Tue')}">Tue</li>
			<li class="${ifDayIsSelected('Wed')}">Wed</li>
			<li class="${ifDayIsSelected('Thu')}">Thu</li>
			<li class="${ifDayIsSelected('Fri')}">Fri</li>
			<li class="${ifDayIsSelected('Sat')}">Sat</li>
			<li class="${ifDayIsSelected('Sun')}">Sun</li>
      </ul>
			`;
	}

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
				onclick={handleEditClick}
				class="raw editOnClick pixelart-icons-font-edit"
				aria-label="Edit class"
			></button>
		</div>
	</div>
</div>
