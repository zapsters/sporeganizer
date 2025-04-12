<script lang="ts">
	import Jquery from 'jquery';
	import { onMount } from 'svelte';
	import { getAuth } from 'firebase/auth';
	import {
		assignmentCache,
		assignmentCacheFetched,
		classCache,
		classCacheFetched,
		settingsCacheFetched
	} from '$lib/userData';
	import { generateModalAlert } from '$lib/alert';
	import { goto } from '$app/navigation';
	import ClassItem from './ClassItem.svelte';
	import { callAssignmentModal, callClassModal } from '$lib/customModals';
	import { formatDate, getDayOfTheWeekAbbr, resizeSelect } from '$lib/helpers';

	// This will hold the classes results, useful for display both mobile and desktop data.
	import { derived, get, writable } from 'svelte/store';
	import AssignmentItem from './AssignmentItem.svelte';
	import { getAllUserMadeAssignments, getAllUserMadeClasses } from '$lib/firestoreDatabase';

	export const selectedFilter = writable('all');
	let selectedScreen = 'assignments';

	// Derived store that filters based on `selectedFilter`
	export const classQueryResult = derived(
		[classCache, selectedFilter],
		([$classCache, $selectedFilter]) => {
			const today = new Date();
			const tomorrow = new Date();
			tomorrow.setDate(today.getDate() + 1);

			switch ($selectedFilter) {
				case 'today':
					return $classCache.filter((c) => {
						const dayOfTheWeek = getDayOfTheWeekAbbr(today);
						return c.time[dayOfTheWeek] != undefined;
					});
				case 'tomorrow':
					return $classCache.filter((c) => {
						const dayOfTheWeek = getDayOfTheWeekAbbr(tomorrow);
						return c.time[dayOfTheWeek] != undefined;
					});
				default:
					return $classCache; // "all" case
			}
		}
	);

	export const assignmentQueryResult = derived(
		[assignmentCache, selectedFilter],
		([$assignmentCache, $selectedFilter]) => {
			const today = new Date();
			const tomorrow = new Date();
			tomorrow.setDate(today.getDate() + 1);

			return $assignmentCache.sort(function (a, b) {
				return new Date(a.time).getTime() - new Date(b.time).getTime();
			}); // "all" case
		}
	);

	// Checking if our device is mobile.
	let isMobile = false;

	// Function to update screen size state
	function checkScreenSize() {
		isMobile = window.innerWidth <= 1100;
	}

	onMount(async () => {
		resizeSelect('dashboardAssignmentTab');
		checkScreenSize();
		window.addEventListener('resize', checkScreenSize);
		await getAuth().authStateReady();
		await getAllUserMadeClasses();
		await getAllUserMadeAssignments();
		if (!getAuth().currentUser) {
			generateModalAlert({
				icon: 'warning-box',
				header: 'This is a preview',
				bodyText:
					'Without a login, your data will not be saved past this session. Login or create an account to save your session data and utilize Sporeganizer to its full extent.',
				buttons: [
					{},
					{
						text: 'Login',
						class: 'primary',
						onClick: function () {
							goto('signin');
						}
					}
				]
			});

			if (!get(classCacheFetched)) {
				classCacheFetched.set(true);
				classCache.set([
					{
						name: 'PRINCIPLES OF CHEMISTRY I',
						icon: 'Shaggy Ink Cap',
						notes: 'CHEM-C 105',
						classId: 'preview1',
						time: {
							Mon: ['09:00', '11:50'],
							Wed: ['09:00', '11:50'],
							Fri: ['09:00', '11:50']
						}
					},
					{
						name: 'CALCULUS II',
						icon: 'Fly Agaric',
						notes: 'MATH-M 216 | 100% Online',
						classId: 'preview2',
						time: {}
					}
				]);
			}
			if (!get(assignmentCacheFetched)) {
				assignmentCacheFetched.set(true);
				function getDateWithDayOffset(dateOffset: number) {
					var result = new Date();
					result.setDate(result.getDate() + dateOffset);
					return setTimeMidnight(result);
				}
				function setTimeMidnight(date: Date) {
					date.setHours(23);
					date.setMinutes(59);
					return date;
				}
				assignmentCache.set([
					{
						name: 'Atomic Structure and Periodicity Worksheet',
						notes: 'Pages 1-5',
						classId: 'preview1',
						assignmentId: 'preview1',
						time: getDateWithDayOffset(-3),
						completed: false
					},
					{
						name: 'Techniques of Integration Problem Set',
						notes: '',
						classId: 'preview2',
						assignmentId: 'preview2',
						time: getDateWithDayOffset(-1),
						completed: false
					},
					{
						name: 'Series Convergence Project',
						notes: 'Ask the professor about this...',
						classId: 'preview2',
						assignmentId: 'preview3',
						time: getDateWithDayOffset(0),
						completed: false
					},
					{
						name: 'Stoichiometry Lab Report',
						notes: 'Determining the Limiting Reactant',
						classId: 'preview1',
						assignmentId: 'preview4',
						time: getDateWithDayOffset(1),
						completed: false
					},
					{
						name: 'Taylor Series Worksheet',
						classId: 'preview2',
						notes: '',
						assignmentId: 'preview5',
						time: getDateWithDayOffset(5),
						completed: false
					},
					{
						name: 'Mole-to-Mass Conversions Lab',
						classId: 'preview1',
						notes: '',
						assignmentId: 'preview6',
						time: getDateWithDayOffset(5),
						completed: false
					}
				]);
			}
			settingsCacheFetched.set(true);
		}
		// @ts-ignore
		document.getElementById('dashboardAssignmentTab').addEventListener('change', () => {
			resizeSelect('dashboardAssignmentTab');
		});
	});
	function updateFilter(thisElem) {
		Jquery(thisElem).parent().find('button').removeClass('active');
		Jquery(thisElem).addClass('active');
		selectedFilter.set(Jquery(thisElem).data('filter'));
	}
	let lastDateOnAssignmentScreen = '';
	function handleAssignmentDateHeaders(assignmentDate: Date) {
		const formattedDate = formatDate(assignmentDate);
		if (formattedDate == lastDateOnAssignmentScreen) return;
		lastDateOnAssignmentScreen = formattedDate;
		return `<h5>${formattedDate}</h5>`;
	}
</script>

{#if !isMobile}
	<div class="mainContainer" style="flex: 0.8; min-width: 200px">
		<header>
			<h1>Classes</h1>
			<button id="classAddBtn" on:click={() => callClassModal('create')} class="raw">
				<img src="images/ui/plus.svg" alt="Add Class" srcset="" />
			</button>
		</header>
		<div class="buttonContainer" id="classSectionFilters">
			<button
				on:click={function () {
					updateFilter(this);
				}}
				data-filter="all"
				class="active">All</button
			>
			<button
				on:click={function () {
					updateFilter(this);
				}}
				data-filter="today">Today</button
			>
			<button
				on:click={function () {
					updateFilter(this);
				}}
				data-filter="tomorrow">Tomorrow</button
			>
		</div>
		<section class="flex">
			<div class="mainContainer-content" style="padding-top: 0" id="classEntryContainer">
				{#each $classQueryResult as classData}
					<ClassItem {classData} />
				{/each}
			</div>
		</section>
	</div>
{/if}

<div class="mainContainer">
	<header>
		<select bind:value={selectedScreen} name="dashboardAssignmentTab" id="dashboardAssignmentTab">
			{#if isMobile}
				<option value="classes">Classes</option>
			{/if}
			<option value="assignments" selected>Assignments</option>
			<option value="completedAssignments">Completed Assignments</option>
		</select>

		{#if selectedScreen == 'classes'}
			<button id="classAddBtn" on:click={() => callClassModal('create')} class="raw">
				<img src="images/ui/plus.svg" alt="Add Class" srcset="" />
			</button>
		{:else}
			<button id="assignmentAddBtn" on:click={() => callAssignmentModal('create')} class="raw">
				<img src="images/ui/plus.svg" alt="Add Assignment" srcset="" />
			</button>
		{/if}
	</header>
	{#if selectedScreen == 'classes'}
		<div id="classScreen">
			<div class="buttonContainer" id="classSectionFilters">
				<button
					on:click={function () {
						updateFilter(this);
					}}
					data-filter="all"
					class="active">All</button
				>
				<button
					on:click={function () {
						updateFilter(this);
					}}
					data-filter="today">Today</button
				>
				<button
					on:click={function () {
						updateFilter(this);
					}}
					data-filter="tomorrow">Tomorrow</button
				>
			</div>
			<section class="flex">
				<div class="mainContainer-content" style="padding-top: 0" id="classEntryContainerMobile">
					{#each $classQueryResult as classData}
						<ClassItem {classData} />
					{/each}
				</div>
			</section>
		</div>
	{:else if selectedScreen === 'assignments'}
		<div class="mainContainer-content" style="padding-top: 0" id="assignmentEntryContainer">
			<!-- <div class="classElement assignmentElement">
				<div class="icon"></div>
				<div class="classElement-content">
					<h3>Memorize that one table</h3>
					<h6>Chemistry</h6>
					<p>Due 11:59 PM</p>
				</div>
				<div class="actionBtns">
					<div class="actionButton">
						<button class="raw editOnClick pixelart-icons-font-edit" aria-label="Edit Assignment"
						></button>
					</div>
					<div class="actionButton">
						<input type="checkbox" name="" id="" />
						<i></i>
					</div>
				</div>
			</div> -->
			{#each $assignmentQueryResult as assignmentData}
				{@html handleAssignmentDateHeaders(new Date(assignmentData.time))}
				<AssignmentItem {assignmentData} />
			{/each}
		</div>
	{/if}
</div>
