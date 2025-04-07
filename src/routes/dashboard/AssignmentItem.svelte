<script lang="ts">
	import { getClassById } from '$lib/firestoreDatabase';
	import { getMushroomDataFromName } from '$lib/mushroomBank';
	import { callAssignmentModal } from '$lib/customModals';
	import { convertTo12Hour } from '$lib/helpers';

	export let assignmentData;

	let classData = null;
	let mushroomIconData = null;

	// Load class data and mushroom icon once when assignmentData is available
	$: if (assignmentData?.classId) {
		getClassById(assignmentData.classId)
			.then((data) => {
				classData = data;
				mushroomIconData = getMushroomDataFromName(data.icon);
			})
			.catch(() => {
				mushroomIconData = getMushroomDataFromName();
			});
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
