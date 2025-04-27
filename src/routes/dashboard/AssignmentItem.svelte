<script lang="ts">
	import { getClassById } from '$lib/firestoreDatabase';
	import { getMushroomDataFromName } from '$lib/mushroomBank';
	import { callAssignmentModal } from '$lib/customModals';
	import { convertTo12Hour } from '$lib/helpers';
	import type { ClassJson } from '$lib/types';
	import { classCache } from '$lib/userData';
	import { get } from 'svelte/store';

	export let assignmentData;

	let classData: ClassJson | null = null;
	let mushroomIconData = null;

	$: if (assignmentData.classId) {
		const $classes = get(classCache);
		classData = $classes.find((c) => c.classId === assignmentData.classId) ?? null;

		if (classData) {
			mushroomIconData = getMushroomDataFromName(classData.icon);
		} else {
			mushroomIconData = getMushroomDataFromName('');
		}
	}

	function handleEditClick() {
		callAssignmentModal('edit', assignmentData);
	}

	function getTime() {
		let date = new Date(assignmentData.time);
		let TimeString = `${date.getHours()}:${date.getMinutes()}`;

		return `Due at ${convertTo12Hour(TimeString)}`;
	}
</script>

<div
	class="classElement assignmentElement"
	id="assignmentElem-{assignmentData.assignmentId}"
	data-assignmentId={assignmentData.assignmentId}
>
	<div
		class="icon"
		style="background-image: url('{mushroomIconData?.icon}'); background-size: {mushroomIconData?.scale};"
	></div>

	<div class="classElement-content">
		<h3>{assignmentData.name}</h3>
		<h4>{classData?.name}</h4>
		<h5>{assignmentData?.notes}</h5>
		<h6>{@html getTime()}</h6>
	</div>

	<div class="actionBtns">
		<div class="actionButton">
			<button
				on:click={handleEditClick}
				class="raw editOnClick pixelart-icons-font-edit"
				aria-label="Edit Assignment"
			></button>
		</div>
		<div class="actionButton">
			<input type="checkbox" />
			<i></i>
		</div>
	</div>
</div>
