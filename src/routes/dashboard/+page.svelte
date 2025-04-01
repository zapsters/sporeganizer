<script>
	import Jquery from 'jquery';
	import { alertManager } from '$lib';
	import { onMount } from 'svelte';
	import { onAuthStateChanged, getAuth } from 'firebase/auth';
	import {
		updateUserSettings,
		addClassToDatabase,
		getAllUserMadeClasses,
		getAllUserMadeAssignments,
		deleteClassFromDatabase,
		getClassById,
		updateClassInDatabase
	} from '$lib/firestoreDatabase.js';
	import {
		getQueryCache,
		getSettingParameter,
		getSettings,
		syncSettings,
		updateQueryCache
	} from '$lib/userData';
	import {
		redirectPageRequiresAccount,
		resizeSelect,
		getDayOfTheWeekAbbr,
		DOMPurifyFunc
	} from '$lib/model';
	import { mushroomBank } from '$lib/mushroomBank';
	import { generateModalAlert } from '$lib/alert';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/firebaseConfig';

	onMount(async () => {
		// Redirect user to the login page if we are not logged in.
		// Give it a second to allow firebase to auto-login on page visit.

		await getSettings();
		if (getAuth().currentUser) {
			getAllUserMadeClasses().then((data) => {
				Jquery('#classEntryContainer').html('');
				data.forEach((classEntry) => {
					dashboardAddClassElement(classEntry);
				});
			});
			// User is signed in
		} else {
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
			if ((await getQueryCache('classes')) == null) {
				updateQueryCache('classes', [
					{
						name: 'Chemistry',
						icon: 'Shaggy Ink Cap',
						notes: 'S210 - Science Building',
						classId: 'preview1',
						time: {
							Mon: ['09:00', '11:50'],
							Wed: ['09:00', '11:50']
						}
					},
					{
						name: 'Intermediate Application Development',
						icon: 'Fly Agaric',
						notes: 'I215 - Informatics Building',
						classId: 'preview2',
						time: {
							Tue: ['16:00', '18:00'],
							Thu: ['13:00', '14:15']
						}
					}
				]);
			}
			getAllUserMadeClasses().then((data) => {
				Jquery('#classEntryContainer').html('');
				data.forEach((classEntry) => {
					dashboardAddClassElement(classEntry);
				});
			});
		}

		resizeSelect('dashboardAssignmentTab');
		// @ts-ignore
		document.getElementById('dashboardAssignmentTab').addEventListener('change', () => {
			resizeSelect('dashboardAssignmentTab');
		});
		Jquery('#classSectionFilters button').on('click', function () {
			Jquery(this).parent().find('button').removeClass('active');
			Jquery(this).addClass('active');
			Jquery('#classEntryContainer').html('');

			switch (Jquery(this).data('filter')) {
				case 'all':
					getAllUserMadeClasses().then((data) => {
						data.forEach((classEntry) => {
							dashboardAddClassElement(classEntry);
						});
					});
					break;
				case 'today':
					let today = getDayOfTheWeekAbbr(new Date());
					getAllUserMadeClasses().then((data) => {
						data.forEach((classEntry) => {
							// @ts-ignore
							if (classEntry.time[today] != undefined) {
								dashboardAddClassElement(classEntry);
							}
						});
					});
					break;
				case 'tomorrow':
					let tomorrow = new Date();
					tomorrow.setDate(tomorrow.getDate() + 1);
					// @ts-ignore
					tomorrow = getDayOfTheWeekAbbr(tomorrow);

					getAllUserMadeClasses().then((data) => {
						data.forEach((classEntry) => {
							// @ts-ignore
							if (classEntry.time[tomorrow] != undefined) {
								dashboardAddClassElement(classEntry);
							}
						});
					});
					break;
			}
		});

		// Manage the alternate / right screen select box.
		Jquery('#dashboardAssignmentTab').on('change', function () {
			switch (Jquery(this).val()) {
				case 'currentAssignments':
					break;
				case 'pastAssignments':
					break;
			}
		});
	});

	function getMushroomIconFromName(name) {
		let thisMushroomBankJson = mushroomBank.filter(function (data) {
			return data.title == name;
		})[0];
		if (thisMushroomBankJson == undefined)
			thisMushroomBankJson = mushroomBank.filter(function (data) {
				return data.title == 'missingno';
			})[0];
		return thisMushroomBankJson.icon;
	}

	function areAllEntriesEqual(schedule) {
		const timeEntries = Object.values(schedule).map((times) => JSON.stringify(times));

		return timeEntries.every((entry) => entry === timeEntries[0]);
	}

	function addEventListenerToClassElement(elem) {
		Jquery(elem)
			.find('.editOnClick')
			.on('click', async function () {
				var thisClassId = Jquery(this).closest('.classElement').data('classid');
				callClassModal('edit', await getClassById(thisClassId));
			});
		Jquery(elem)
			.find('textarea')
			.on('focusout', function () {
				var thisClassId = Jquery(this).closest('.classElement').data('classid');
				updateClassInDatabase(thisClassId, {
					notes: Jquery(this).val()
				});
			});
	}

	function classJsonToElement(classData) {
		if (classData['classId'] == undefined) throw 'NO CLASSID WAS PASSED';

		function ifDayIsSelected(dayAbbreviation) {
			if (classData.time[dayAbbreviation] != null) return "class='selected'";
			return '';
		}
		function getTimes() {
			var resultingTimeTable = '';

			//Check if no times are listed, in which case, no times are needed.
			if (Jquery.isEmptyObject(classData.time)) {
				return '';
			} else if (areAllEntriesEqual(classData.time)) {
				// If all times are the same for each day, only print one set.
				var value = Object.values(classData.time)[0];

				if (value[0] != '' && value[1] != '') {
					resultingTimeTable = `
        <tr>
        <td>${convertTo12Hour(value[0])} - ${convertTo12Hour(value[1])}</td>
        </tr>`;
				}
			} else {
				// If each day has different value, print each separately
				for (const [key, value] of Object.entries(classData.time)) {
					if (value[0] != '' && value[1] != '') {
						resultingTimeTable += `
            <tr>
            <td>${key}</td>
            <td>${convertTo12Hour(value[0])} - ${convertTo12Hour(value[1])}</td>
            </tr>`;
					}
				}
			}
			return resultingTimeTable;
		}
		return `
  <div class="classElement" id="classElem-${classData.classId}" data-classId="${classData.classId}">
    <div class="icon" style="background-image: url(${getMushroomIconFromName(
			classData.icon
		)})"></div>
    <div class="classElement-content">
      <h3>
        ${classData.name}
      </h3>
      <h6>${classData.notes}</h6>
      <ul class="classDatesContainer">
        <li ${ifDayIsSelected('Mon')}>Mon</li>
        <li ${ifDayIsSelected('Tue')}>Tue</li>
        <li ${ifDayIsSelected('Wed')}>Wed</li>
        <li ${ifDayIsSelected('Thu')}>Thu</li>
        <li ${ifDayIsSelected('Fri')}>Fri</li>
      </ul>
      <table>
        ${getTimes()}
      </table>
    </div>
    <div class="actionBtns">
      <div class="actionButton">
        <a class="editOnClick pixelart-icons-font-edit"></a>
      </div>
    </div>
  </div>`;
	}

	function convertTo12Hour(time24) {
		if (getSettingParameter('do24HrTime')) return time24;
		const [hours, minutes] = time24.split(':').map(Number);
		const period = hours < 12 || hours === 24 ? 'AM' : 'PM';
		const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
		const formattedMinutes = minutes.toString().padStart(2, '0');
		return `${formattedHours}:${formattedMinutes} ${period}`;
	}

	// Opens a create OR edit class modal.
	// @ts-ignore
	async function callClassModal(type, classData = {}) {
		var classTimeArray = {};
		const daySelectIds = [
			'#classModal-daySelectMon',
			'#classModal-daySelectTue',
			'#classModal-daySelectWed',
			'#classModal-daySelectThu',
			'#classModal-daySelectFri'
		];

		var alertBody = `
    <hr>
    <div class="inputContainer centered">
      <div class="classElementIcon center large" id="classModalIconPreview"></div>
      <div class="dropdown">
          <button class="dropbtn">
              Icons
          </button>
          
          <ul class="dropdown-content" id="classIconDropdown">
            ${getMushroomElementsForDropdown()}
        </ul>
      </div>
    </div>
    <div class="inputContainer centered" style="display:none">
      <label>Class Id</label>
      <input id="classModal-classId" type='text' readonly value='${
				// @ts-ignore
				classData.classId
			}'/>
    </div>
    <div class="inputContainer centered">
      <label>Class Name</label>
      <input id="classModal-className" type='text'/>
    </div>
    <div class="inputContainer centered">
      <label>Notes</label>
      <input id="classModal-notes" type='text'/>
    </div>
    <div class="inputContainer centered">
      <label>Date & Time</label>
      <ul class="classDatesContainer">
        <li>Mon <input id="classModal-daySelectMon" type="checkbox"></li>
        <li>Tue <input id="classModal-daySelectTue" type="checkbox"></li>
        <li>Wed <input id="classModal-daySelectWed" type="checkbox"></li>
        <li>Thu <input id="classModal-daySelectThu" type="checkbox"></li>
        <li>Fri <input id="classModal-daySelectFri" type="checkbox"></li>
      </ul>
    </div>
    <div class="inputContainer centered">
      <label>Time Settings</label>
      <select id="classModal-timeSettings">
        <option value='default'>Same time each day</option>
        <option value='uniqueDaily'>Different time every day</option>
      </select>
    </div>
    <div class="inputContainer centered flex" id="defaultFromAndToInputs">
      <div class="inputContainer">
        <label>From</label>
        <input id="classModal-timeFrom-all" type="time" />
      </div>
      <div class="inputContainer">
        <label>To</label>
        <input id="classModal-timeTo-all" type="time" />
      </div>
    </div>

    <div id="uniqueDailyTimeSelect" style="display: none">
      <div class="inputContainer centered flex spanLabel" style="display: none" id="uniqueDailyTimeSelectMon">
        <span class="primary">Monday</span>
        <div class="inputContainer">
          <label>From</label>
          <input id="classModal-timeFrom-Mon" type="time" />
        </div>
        <div class="inputContainer">
          <label>To</label>
          <input id="classModal-timeTo-Mon" type="time" />
        </div>
      </div>
      <div class="inputContainer centered flex spanLabel" style="display: none" id="uniqueDailyTimeSelectTue">
        <span class="primary">Tuesday</span>
        <div class="inputContainer">
          <label>From</label>
          <input id="classModal-timeFrom-Tue" type="time" />
        </div>
        <div class="inputContainer">
          <label>To</label>
          <input id="classModal-timeTo-Tue" type="time" />
        </div>
      </div>
      <div class="inputContainer centered flex spanLabel" style="display: none" id="uniqueDailyTimeSelectWed">
        <span class="primary">Wednesday</span>
        <div class="inputContainer">
          <label>From</label>
          <input id="classModal-timeFrom-Wed" type="time" />
        </div>
        <div class="inputContainer">
          <label>To</label>
          <input id="classModal-timeTo-Wed" type="time" />
        </div>
      </div>
      <div class="inputContainer centered flex spanLabel" style="display: none" id="uniqueDailyTimeSelectThu">
        <span class="primary">Thursday</span>
        <div class="inputContainer">
          <label>From</label>
          <input id="classModal-timeFrom-Thu" type="time" />
        </div>
        <div class="inputContainer">
          <label>To</label>
          <input id="classModal-timeTo-Thu" type="time" />
        </div>
      </div>
      <div class="inputContainer centered flex spanLabel" style="display: none" id="uniqueDailyTimeSelectFri">
        <span class="primary">Friday</span>
        <div class="inputContainer">
          <label>From</label>
          <input id="classModal-timeFrom-Fri" type="time" />
        </div>
        <div class="inputContainer">
          <label>To</label>
          <input id="classModal-timeTo-Fri" type="time" />
        </div>
      </div>
    </div>
  <span id="classModalStatusText"></span>
  `;

		async function formatClassJsonObject() {
			var classJson = {};
			classJson.name = Jquery('#classModal-className').val();
			classJson.icon = Jquery('input[name="classIconSelect"]:checked').val();
			classJson.notes = Jquery('#classModal-notes').val();
			classJson.classId = Jquery('#classModal-classId').val();

			// Construct time array
			// Check each of the day select fields to get days where class is in session.
			daySelectIds.forEach((checkboxId) => {
				// @ts-ignore
				if (document.getElementById(checkboxId.replace('#', '')).checked) {
					var day = checkboxId.replace('#classModal-daySelect', '');
					var timeSettings = Jquery('#classModal-timeSettings').val();
					switch (timeSettings) {
						case 'uniqueDaily':
							switch (day) {
								case 'Mon':
									// @ts-ignore
									classTimeArray[day] = [
										Jquery('#classModal-timeFrom-Mon').val(),
										Jquery('#classModal-timeTo-Mon').val()
									];
									break;
								case 'Tue':
									// @ts-ignore
									classTimeArray[day] = [
										Jquery('#classModal-timeFrom-Tue').val(),
										Jquery('#classModal-timeTo-Tue').val()
									];
									break;
								case 'Wed':
									// @ts-ignore
									classTimeArray[day] = [
										Jquery('#classModal-timeFrom-Wed').val(),
										Jquery('#classModal-timeTo-Wed').val()
									];
									break;
								case 'Thu':
									// @ts-ignore
									classTimeArray[day] = [
										Jquery('#classModal-timeFrom-Thu').val(),
										Jquery('#classModal-timeTo-Thu').val()
									];
									break;
								case 'Fri':
									// @ts-ignore
									classTimeArray[day] = [
										Jquery('#classModal-timeFrom-Fri').val(),
										Jquery('#classModal-timeTo-Fri').val()
									];
									break;

								default:
									break;
							}
							break;
						case 'default':
						default:
							// @ts-ignore
							classTimeArray[day] = [
								Jquery('#classModal-timeFrom-all').val(),
								Jquery('#classModal-timeTo-all').val()
							];
							break;
					}
				}
			});

			classJson.time = classTimeArray;
			return classJson;
		}

		// Generate Class Modal
		switch (type) {
			case 'edit':
				if (classData == undefined || classData == {})
					throw new Error('No class data passed through');

				// @ts-ignore
				await alertManager.generateModalAlert({
					icon: 'text-add',
					header: `Edit Class`,
					subHeader: '',
					bodyText: alertBody,
					buttons: [
						{ text: 'Cancel' },
						{
							text: 'Delete Class',
							class: 'dangerous',
							closeModalOnClick: false,
							onClick: async () => {
								try {
									const classId = Jquery('#classModal-classId').val();
									// @ts-ignore
									await deleteClassFromDatabase(classId)
										.then(async () => {
											Jquery(`#classElem-${classId}`).remove();

											// @ts-ignore
											alertManager.generateModalAlert({
												icon: 'mood-happy',
												subHeader: 'Class Deleted',
												buttons: [{}]
											});
										})
										.catch((error) => {
											throw new Error(error);
										});
								} catch (error) {
									// @ts-ignore
									alertManager.generateModalAlert({
										icon: 'mood-sad',
										header: '',
										subHeader: 'Error deleting class',
										bodyText: error,
										buttons: [{}]
									});
									throw error;
								}
							}
						},
						{
							text: 'Confirm',
							closeModalOnClick: false,
							onClick: async () => {
								try {
									const classResultJson = await formatClassJsonObject();
									const classId = Jquery('#classModal-classId').val();
									classResultJson[classId] = classId;
									// @ts-ignore
									await updateClassInDatabase(classId, classResultJson)
										.then(async () => {
											// @ts-ignore
											const newElem = classJsonToElement(classResultJson);
											Jquery(`#classElem-${classId}`).replaceWith(newElem);

											// @ts-ignore
											addEventListenerToClassElement(Jquery(`#classElem-${classId}`));

											// @ts-ignore
											alertManager.generateModalAlert({
												icon: 'mood-happy',
												subHeader: 'Class Updated!',
												buttons: [{}]
											});
										})
										.catch((error) => {
											throw new Error(error);
										});
								} catch (error) {
									// @ts-ignore
									alertManager.generateModalAlert({
										icon: 'mood-sad',
										header: '',
										subHeader: 'Error updating class',
										bodyText: error,
										buttons: [{}]
									});
								}
							}
						}
					]
				});

				break;
			case 'create':
				// @ts-ignore
				alertManager.generateModalAlert({
					icon: 'text-add',
					header: `Create Class`,
					subHeader: '',
					bodyText: alertBody,
					buttons: [
						{ text: 'Cancel' },
						{
							text: 'Create',
							closeModalOnClick: false,
							onClick: async () => {
								try {
									var classResultJson = await formatClassJsonObject();
									// if (classResultJson.name == "") throw new Error("A class name is required.");

									// @ts-ignore
									await addClassToDatabase(classResultJson)
										.then(async (classId) => {
											classResultJson['classId'] = classId;
											dashboardAddClassElement(classResultJson);
											// @ts-ignore
											alertManager.generateModalAlert({
												icon: 'mood-happy',
												subHeader: 'Class Added!',
												buttons: [{}]
											});
										})
										.catch(async (error) => {
											throw new Error(error);
										});
								} catch (error) {
									// @ts-ignore
									alertManager.generateModalAlert({
										icon: 'mood-sad',
										header: '',
										subHeader: 'Error creating class',
										bodyText: error,
										buttons: [{}]
									});
								}
							}
						}
					]
				});
				break;
			default:
				alert('error unrecognized class modal type.');
				break;
		}

		// Add logic to the modal ==============================
		//   Sterilize all html
		Jquery('input[type=text]').on('change', function () {
			Jquery(this).val(
				// @ts-ignore
				DOMPurifyFunc(Jquery(this).val(), { allowedTags: [], allowedAttributes: {} })
			);
		});
		//   On Icon select, update the preview.
		Jquery('#classIconDropdown li input').on('click', (elem) => {
			Jquery('#classModalIconPreview').css(
				'background-image',
				// @ts-ignore
				`url("${getMushroomIconFromName(elem.target.getAttribute('value'))}")`
			);
		});
		//   Then, click the first icon in the list for the default icon!
		Jquery('#classIconDropdown li input')[0].click();

		// Listen to the timeSettings dropdown.
		Jquery('#classModal-timeSettings').on('change', function () {
			switch (Jquery(this).val()) {
				case 'uniqueDaily':
					Jquery('#uniqueDailyTimeSelect').css('display', 'block');
					Jquery('#defaultFromAndToInputs').css('display', 'none');
					break;
				case 'default':
				default:
					Jquery('#defaultFromAndToInputs').css('display', 'flex');
					Jquery('#uniqueDailyTimeSelect').css('display', 'none');
					break;
			}
		});

		// Handle creating input fields for unique daily time settings.
		daySelectIds.forEach((checkboxId) => {
			Jquery(checkboxId).on('click', function () {
				var day = checkboxId.replace('#classModal-daySelect', '');
				var elemId = `#uniqueDailyTimeSelect${day}`;
				// @ts-ignore
				if (this.checked) {
					Jquery(elemId).css('display', 'flex');
				} else {
					Jquery(elemId).css('display', 'none');
				}
			});
		});

		// Populate the input fields if we are in type edit.
		if (type == 'edit') {
			// Set the icon
			// @ts-ignore
			document.getElementById(`mushroomIconBtn-${classData.icon}`).click();
			// Set the name and notes fields
			// @ts-ignore
			document.getElementById(`classModal-className`).value = classData.name;
			// @ts-ignore
			document.getElementById(`classModal-notes`).value = classData.notes;
			// Toggle the day selects
			daySelectIds.forEach((checkboxId) => {
				var day = checkboxId.replace('#classModal-daySelect', '');
				// @ts-ignore
				if (classData.time[day] != undefined) {
					// @ts-ignore
					document.getElementById(checkboxId.replace('#', '')).click();
				}
			});
			// Set the timeSetting dropdown and the time boxes
			// @ts-ignore
			if (classData.time == {} || Jquery.isEmptyObject(classData.time)) {
				return;
				// @ts-ignore
			} else if (areAllEntriesEqual(classData.time)) {
				Jquery(`#classModal-timeSettings`).val('default').change();
				// @ts-ignore
				var value = Object.values(classData.time)[0];
				Jquery(`#classModal-timeFrom-all`).val(value[0]);
				Jquery(`#classModal-timeTo-all`).val(value[1]);
			} else {
				Jquery(`#classModal-timeSettings`).val('uniqueDaily').change();
				// @ts-ignore
				for (const [key, value] of Object.entries(classData.time)) {
					Jquery(`#classModal-timeFrom-${key}`).val(value[0]);
					Jquery(`#classModal-timeTo-${key}`).val(value[1]);
				}
			}
		}
	}

	// Opens a create OR edit assignment modal.
	// callAssignmentModal("create");
	// @ts-ignore
	async function callAssignmentModal(type, assignmentData = {}) {
		var alertBody = `
    <hr>
    <div class="inputContainer centered">
      <div class="classElementIcon center large" id="assignmentModalIconPreview"></div>
			</div>
			<div class="inputContainer centered" style="display: none">
				<label>assignment Id</label>
				<input id="assignmentModal-assignmentId" type='text' readonly value='${
					// @ts-ignore
					assignmentData.assignmentId
				}'/>
					</div>
	<div class="inputContainer centered">
		<label>Assignment Name</label>
		<input id="assignmentModal-assignmentName" type='text'/>
		</div>
		<div class="inputContainer centered">
			<label>Class</label>
			<select id="assignmentModal-classSelection">
				<option value='none'>none</option>
				${await getClassesForDropdown()}
			</select>
		</div>
		<div class="inputContainer centered">
			<label>Notes</label>
			<input id="assignmentModal-notes" type='text'/>
		</div>
    <div class="inputContainer centered flex" id="defaultFromAndToInputs">
      <div class="inputContainer">
        <label>Due date</label>
        <input id="assignmentModal-dueDate" type="date" />
      </div>
      <div class="inputContainer">
        <label>Due time</label>
        <input id="assignmentModal-dueTime" type="time" value="23:59"/>
      </div>
    </div>

    <div id="uniqueDailyTimeSelect" style="display: none">
      <div class="inputContainer centered flex spanLabel" style="display: none" id="uniqueDailyTimeSelectMon">
        <span class="primary">Monday</span>
        <div class="inputContainer">
          <label>From</label>
          <input id="assignmentModal-timeFrom-Mon" type="time" />
        </div>
        <div class="inputContainer">
          <label>To</label>
          <input id="assignmentModal-timeTo-Mon" type="time" />
        </div>
      </div>
      <div class="inputContainer centered flex spanLabel" style="display: none" id="uniqueDailyTimeSelectTue">
        <span class="primary">Tuesday</span>
        <div class="inputContainer">
          <label>From</label>
          <input id="assignmentModal-timeFrom-Tue" type="time" />
        </div>
        <div class="inputContainer">
          <label>To</label>
          <input id="assignmentModal-timeTo-Tue" type="time" />
        </div>
      </div>
      <div class="inputContainer centered flex spanLabel" style="display: none" id="uniqueDailyTimeSelectWed">
        <span class="primary">Wednesday</span>
        <div class="inputContainer">
          <label>From</label>
          <input id="assignmentModal-timeFrom-Wed" type="time" />
        </div>
        <div class="inputContainer">
          <label>To</label>
          <input id="assignmentModal-timeTo-Wed" type="time" />
        </div>
      </div>
      <div class="inputContainer centered flex spanLabel" style="display: none" id="uniqueDailyTimeSelectThu">
        <span class="primary">Thursday</span>
        <div class="inputContainer">
          <label>From</label>
          <input id="assignmentModal-timeFrom-Thu" type="time" />
        </div>
        <div class="inputContainer">
          <label>To</label>
          <input id="assignmentModal-timeTo-Thu" type="time" />
        </div>
      </div>
      <div class="inputContainer centered flex spanLabel" style="display: none" id="uniqueDailyTimeSelectFri">
        <span class="primary">Friday</span>
        <div class="inputContainer">
          <label>From</label>
          <input id="assignmentModal-timeFrom-Fri" type="time" />
        </div>
        <div class="inputContainer">
          <label>To</label>
          <input id="assignmentModal-timeTo-Fri" type="time" />
        </div>
      </div>
    </div>
  <span id="assignmentModalStatusText"></span>
  `;

		async function formatAssignmentJsonObject() {
			var assignmentJson = {};
			assignmentJson.name = Jquery('#assignmentModal-assignmentName').val();
			assignmentJson.classId = Jquery('input[name="assignmentIconSelect"]:checked').val();
			assignmentJson.notes = Jquery('#assignmentModal-notes').val();
			assignmentJson.assignmentId = Jquery('#assignmentModal-assignmentId').val();

			// @ts-ignore
			assignmentJson.time = assignmentTimeArray;
			return assignmentJson;
		}

		// Generate Assignment Modal
		switch (type) {
			case 'edit':
				if (assignmentData == undefined || assignmentData == {})
					throw new Error('No assignment data passed through');

				// @ts-ignore
				await alertManager.generateModalAlert({
					icon: 'text-add',
					header: `Edit Assignment`,
					subHeader: '',
					bodyText: alertBody,
					buttons: [
						{ text: 'Cancel' },
						{
							text: 'Delete Assignment',
							class: 'dangerous',
							closeModalOnClick: false,
							onClick: async () => {
								try {
									const assignmentId = Jquery('#assignmentModal-assignmentId').val();
									// @ts-ignore
									await deleteAssignmentFromDatabase(assignmentId)
										.then(async () => {
											Jquery(`#assignmentElem-${assignmentId}`).remove();

											// @ts-ignore
											alertManager.generateModalAlert({
												icon: 'mood-happy',
												subHeader: 'Assignment Deleted',
												buttons: [{}]
											});
										})
										// @ts-ignore
										.catch((error) => {
											throw new Error(error);
										});
								} catch (error) {
									// @ts-ignore
									alertManager.generateModalAlert({
										icon: 'mood-sad',
										header: '',
										subHeader: 'Error deleting assignment',
										bodyText: error,
										buttons: [{}]
									});
									throw error;
								}
							}
						},
						{
							text: 'Confirm',
							closeModalOnClick: false,
							onClick: async () => {
								try {
									const assignmentResultJson = await formatAssignmentJsonObject();
									// @ts-ignore
									const AssignmentId = Jquery('#assignmentModal-assignmentId').val();
									// @ts-ignore
									await updateAssignmentInDatabase(assignmentId, assignmentResultJson)
										.then(async () => {
											// @ts-ignore
											const newElem = assignmentJsonToElement(assignmentResultJson);
											// @ts-ignore
											Jquery(`#assignmentElem-${assignmentId}`).replaceWith(newElem);

											// @ts-ignore
											addEventListenerToAssignmentElement(
												// @ts-ignore
												Jquery(`#assignmentElem-${assignmentId}`)
											);

											// @ts-ignore
											alertManager.generateModalAlert({
												icon: 'mood-happy',
												subHeader: 'Assignment Updated!',
												buttons: [{}]
											});
										})
										// @ts-ignore
										.catch((error) => {
											throw new Error(error);
										});
								} catch (error) {
									// @ts-ignore
									alertManager.generateModalAlert({
										icon: 'mood-sad',
										header: '',
										subHeader: 'Error updating assignment',
										bodyText: error,
										buttons: [{}]
									});
								}
							}
						}
					]
				});

				break;
			case 'create':
				// @ts-ignore
				alertManager.generateModalAlert({
					icon: 'text-add',
					header: `Create Assignment`,
					subHeader: '',
					bodyText: alertBody,
					buttons: [
						{ text: 'Cancel' },
						{
							text: 'Create',
							closeModalOnClick: false,
							onClick: async () => {
								try {
									var assignmentResultJson = await formatAssignmentJsonObject();
									// if (assignmentResultJson.name == "") throw new Error("A assignment name is required.");

									// @ts-ignore
									await addAssignmentToDatabase(assignmentResultJson)
										// @ts-ignore
										.then((assignmentId) => {
											assignmentResultJson['assignmentId'] = assignmentId;
											// @ts-ignore
											dashboardAddAssignmentElement(assignmentResultJson);
											// @ts-ignore
											alertManager.generateModalAlert({
												icon: 'mood-happy',
												subHeader: 'Assignment Added!',
												buttons: [{}]
											});
										})
										// @ts-ignore
										.catch(async (error) => {
											throw new Error(error);
										});
								} catch (error) {
									// @ts-ignore
									alertManager.generateModalAlert({
										icon: 'mood-sad',
										header: '',
										subHeader: 'Error creating assignment',
										bodyText: error,
										buttons: [{}]
									});
								}
							}
						}
					]
				});
				break;
			default:
				alert('error unrecognized assignment modal type.');
				break;
		}

		// Add logic to the modal ==============================
		//   Sterilize all html
		Jquery('input[type=text]').on('change', function () {
			// @ts-ignore
			return Jquery(this).val(Jquery(this).val());
		});

		//   On Icon select, update the preview.
		Jquery('#assignmentModal-classSelection').on('change', async function () {
			let classSelectionId = Jquery(this).val();
			if (classSelectionId == 'none') {
				Jquery('#assignmentModalIconPreview').css(
					'background-image',
					// @ts-ignore
					`url('${getMushroomIconFromName('missingnolol')}')`
				);
				return;
			}
			await getAllUserMadeClasses().then(function (result) {
				let selectedClassJson = result.find((classes) => classes.classId == classSelectionId);
				if (selectedClassJson == null) throw new Error('Class not found!');
				Jquery('#assignmentModalIconPreview').css(
					'background-image',
					// @ts-ignore
					`url('${getMushroomIconFromName(selectedClassJson.icon)}')`
				);
			});
		});

		// Populate the input fields if we are in type edit.
		if (type == 'edit') {
		}
	}

	// HELPER FUNCTIONS ============================================
	// Get mushroom elements and format them for the dropdown menu
	async function getClassesForDropdown() {
		var dropdownContent = '';
		await getAllUserMadeClasses().then((classes) => {
			classes.forEach((classInfo) => {
				dropdownContent += `<option value='${classInfo.classId}'>${classInfo.name}</option>`;
			});
		});
		return dropdownContent;
	}
	function getMushroomElementsForDropdown() {
		var dropdownContent = '';
		// @ts-ignore
		mushroomBank.forEach((mushroomElement, index) => {
			if (mushroomElement.title == 'missingno') return;
			dropdownContent += `
        <li><label><div style="background-image: url(${mushroomElement.icon}); background-size: ${mushroomElement.scale}" class="classElementIcon"></div><span>${mushroomElement.title}</span></label>
            <input type="radio" checked name="classIconSelect" value="${mushroomElement.title}" id="mushroomIconBtn-${mushroomElement.title}"></li>`;
		});
		return dropdownContent;
	}

	export function dashboardAddClassElement(classData) {
		let classElement = classJsonToElement(classData);
		let newElement = Jquery('#classEntryContainer').append(classElement);
		addEventListenerToClassElement(newElement[0].lastChild);
	}
</script>

<div class="mainContainer" style="flex: 0.8; min-width: 200px">
	<header>
		<h1>Classes</h1>
		<button id="classAddBtn" on:click={() => callClassModal('create')} class="raw">
			<img src="images/ui/plus.svg" alt="Add Class" srcset="" />
		</button>
	</header>
	<div class="buttonContainer" id="classSectionFilters">
		<button data-filter="all" class="active">All</button>
		<button data-filter="today">Today</button>
		<button data-filter="tomorrow">Tomorrow</button>
	</div>
	<section class="flex">
		<div class="mainContainer-content" style="padding-top: 0" id="classEntryContainer">
			<!-- <div class="classElement">
        <div class="icon"></div>
        <div class="classElement-content">
          <h3><a>Math</a></h3>
          <h6>notes Thomas</h6>
          <ul class="classDatesContainer">
            <li>Mon</li>
            <li class="selected">Tue</li>
            <li>Wed</li>
            <li class="selected">Thur</li>
            <li>Fri</li>
						</ul>
						<table>
							<tr>
								<td>Mon</td>
								<td>8:30am - 10:00am</td>
								</tr>
								<tr>
									<td>Tues</td>
									<td>8:30am - 10:00am</td>
									</tr>
									</table>
									</div>
									</div> -->
		</div>
	</section>
</div>
<div class="mainContainer">
	<header>
		<!-- <h1>Assignments</h1> -->
		<select name="dashboardAssignmentTab" id="dashboardAssignmentTab">
			<option value="assignments">Assignments</option>
			<option value="pastAssignments">Past Assignments</option>
		</select>
		<button id="assignmentAddBtn" on:click={() => callAssignmentModal('create')} class="raw">
			<img src="images/ui/plus.svg" alt="Add Assignment" srcset="" />
		</button>
	</header>
	<div class="mainContainer-content" style="padding-top: 0" id="assignmentEntryContainer">
		<h2>Due Today,</h2>
		<div class="classElement assignmentElement">
			<div class="icon"></div>
			<div class="classElement-content">
				<h3>Memorize that one table</h3>
				<h6>Chemistry</h6>
				<p>Due 11:59 PM</p>
			</div>
			<div class="actionBtns">
				<div class="actionButton">
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<!-- svelte-ignore a11y_missing_attribute -->
					<a class="editOnClick pixelart-icons-font-edit"></a>
				</div>
				<div class="actionButton">
					<input type="checkbox" name="" id="" />
					<i></i>
				</div>
			</div>
		</div>
		<hr />
	</div>
</div>
