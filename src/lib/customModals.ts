import type { AssignmentJson, ClassJson } from '$lib/types';
import Jquery from 'jquery';
// Opens a create OR edit class modal.
import {
	addAssignmentToDatabase,
	addClassToDatabase,
	deleteAssignmentFromDatabase,
	deleteClassFromDatabase,
	getAllUserMadeClasses,
	getClassById,
	updateAssignmentInDatabase,
	updateClassInDatabase
} from './firestoreDatabase';
import { getMushroomDataFromName, getMushroomBank } from '$lib/mushroomBank';
import { alertManager } from '$lib';
import { areAllEntriesEqual, DOMPurifyFunc, formatDateToIsoAlt } from './helpers';

export async function callClassModal(type: string, classJson = {} as ClassJson) {
	var classTimeArray = {};
	const daySelectIds = [
		'#classModal-daySelectMon',
		'#classModal-daySelectTue',
		'#classModal-daySelectWed',
		'#classModal-daySelectThu',
		'#classModal-daySelectFri',
		'#classModal-daySelectSat',
		'#classModal-daySelectSun'
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
      <input id="classModal-classId" type='text' readonly value='${classJson.classId}'/>
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
        <li>Sat <input id="classModal-daySelectSat" type="checkbox"></li>
        <li>Sun <input id="classModal-daySelectSun" type="checkbox"></li>
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
			<div class="inputContainer centered flex spanLabel" style="display: none" id="uniqueDailyTimeSelectSat">
        <span class="primary">Saturday</span>
        <div class="inputContainer">
          <label>From</label>
          <input id="classModal-timeFrom-Sat" type="time" />
        </div>
        <div class="inputContainer">
          <label>To</label>
          <input id="classModal-timeTo-Sat" type="time" />
        </div>
      </div>
			<div class="inputContainer centered flex spanLabel" style="display: none" id="uniqueDailyTimeSelectSun">
        <span class="primary">Sunday</span>
        <div class="inputContainer">
          <label>From</label>
          <input id="classModal-timeFrom-Sun" type="time" />
        </div>
        <div class="inputContainer">
          <label>To</label>
          <input id="classModal-timeTo-Sun" type="time" />
        </div>
      </div>
    </div>
  <span id="classModalStatusText"></span>
  `;

	async function formatClassJsonObject() {
		var classJson = {} as ClassJson;
		classJson.name = String(Jquery('#classModal-className').val());
		classJson.icon = String(Jquery('input[name="classIconSelect"]:checked').val());
		classJson.notes = String(Jquery('#classModal-notes').val());
		classJson.classId = String(Jquery('#classModal-classId').val());

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
								classTimeArray[day] = [
									Jquery('#classModal-timeFrom-Mon').val(),
									Jquery('#classModal-timeTo-Mon').val()
								];
								break;
							case 'Tue':
								classTimeArray[day] = [
									Jquery('#classModal-timeFrom-Tue').val(),
									Jquery('#classModal-timeTo-Tue').val()
								];
								break;
							case 'Wed':
								classTimeArray[day] = [
									Jquery('#classModal-timeFrom-Wed').val(),
									Jquery('#classModal-timeTo-Wed').val()
								];
								break;
							case 'Thu':
								classTimeArray[day] = [
									Jquery('#classModal-timeFrom-Thu').val(),
									Jquery('#classModal-timeTo-Thu').val()
								];
								break;
							case 'Fri':
								classTimeArray[day] = [
									Jquery('#classModal-timeFrom-Fri').val(),
									Jquery('#classModal-timeTo-Fri').val()
								];
								break;
							case 'Sat':
								classTimeArray[day] = [
									Jquery('#classModal-timeFrom-Sat').val(),
									Jquery('#classModal-timeTo-Sat').val()
								];
								break;
							case 'Sun':
								classTimeArray[day] = [
									Jquery('#classModal-timeFrom-Sun').val(),
									Jquery('#classModal-timeTo-Sun').val()
								];
								break;

							default:
								break;
						}
						break;
					case 'default':
					default:
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
			if (classJson == undefined) throw new Error('No class data passed through');

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
								const classId = String(Jquery('#classModal-classId').val());

								await deleteClassFromDatabase(classId)
									.then(async () => {
										Jquery(`#classElem-${classId}`).remove();

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
								const classId = String(Jquery('#classModal-classId').val());
								classResultJson[classId] = classId;

								await updateClassInDatabase(classId, classResultJson)
									.then(async () => {
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

								await addClassToDatabase(classResultJson)
									.then(async (classId) => {
										classResultJson['classId'] = classId;
										// dashboardAddClassElement(classResultJson);
										// classResultContent.update((classResultContent) => [
										// 	...classResultContent,
										// 	classResultJson
										// ]);

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
		Jquery(this).val(DOMPurifyFunc(Jquery(this).val()));
	});
	//   On Icon select, update the preview.
	Jquery('#classIconDropdown li input').on('click', (elem) => {
		var mushroomIconData = getMushroomDataFromName(elem.target.getAttribute('value'));
		Jquery('#classModalIconPreview').css(
			'background-image',

			`url("${mushroomIconData.icon}")`
		);
		Jquery('#classModalIconPreview').css(
			'background-size',

			`${mushroomIconData.scale}`
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

			if ((this as HTMLInputElement).checked) {
				Jquery(elemId).css('display', 'flex');
			} else {
				Jquery(elemId).css('display', 'none');
			}
		});
	});

	// Populate the input fields if we are in type edit.
	if (type == 'edit') {
		// Set the icon

		document.getElementById(`mushroomIconBtn-${classJson.icon}`).click();
		// Set the name and notes fields

		(document.getElementById(`classModal-className`) as HTMLInputElement).value = classJson.name;

		(document.getElementById(`classModal-notes`) as HTMLInputElement).value = classJson.notes;
		// Toggle the day selects
		daySelectIds.forEach((checkboxId) => {
			var day = checkboxId.replace('#classModal-daySelect', '');

			if (classJson.time[day] != undefined) {
				document.getElementById(checkboxId.replace('#', '')).click();
			}
		});
		// Set the timeSetting dropdown and the time boxes

		if (Jquery.isEmptyObject(classJson.time)) {
			return;
		} else if (areAllEntriesEqual(classJson.time)) {
			Jquery(`#classModal-timeSettings`).val('default').change();

			var value = Object.values(classJson.time)[0];
			Jquery(`#classModal-timeFrom-all`).val(value[0]);
			Jquery(`#classModal-timeTo-all`).val(value[1]);
		} else {
			Jquery(`#classModal-timeSettings`).val('uniqueDaily').change();

			for (const [key, value] of Object.entries(classJson.time)) {
				Jquery(`#classModal-timeFrom-${key}`).val(value[0]);
				Jquery(`#classModal-timeTo-${key}`).val(value[1]);
			}
		}
	}
}

// Opens a create OR edit assignment modal.
// callAssignmentModal("create");

export async function callAssignmentModal(type, assignmentData = {} as AssignmentJson) {
	var alertBody = `
    <hr>
    <div class="inputContainer centered">
      <div class="classElementIcon center large" id="assignmentModalIconPreview"></div>
			</div>
			<div class="inputContainer centered" style="display: none">
				<label>assignment Id</label>
				<input id="assignmentModal-assignmentId" type='text' readonly value='${
					assignmentData?.assignmentId
				}'/>
					</div>
	<div class="inputContainer centered">
		<label>Assignment Name</label>
		<input id="assignmentModal-assignmentName" type='text' value="${assignmentData?.name == undefined ? '' : assignmentData.name}"/>
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
			<input id="assignmentModal-notes" type='text' value="${assignmentData.notes == undefined ? '' : assignmentData.notes}"/>
		</div>
		<div class="inputContainer">
			<label>Due time</label>
			<input id="assignmentModal-time" type="datetime-local" value="${assignmentData.time == undefined ? getDefaultDueDate() : formatDateToIsoAlt(new Date(assignmentData.time))}"/>
		</div>

    
  <span id="assignmentModalStatusText"></span>
  `;

	function getDefaultDueDate() {
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');

		const datetimeString = `${year}-${month}-${day} 23:59`;
		return datetimeString;
	}

	async function formatAssignmentJsonObject() {
		var assignmentJson = {} as AssignmentJson;
		assignmentJson.name = String(Jquery('#assignmentModal-assignmentName').val());
		assignmentJson.classId = String(Jquery('#assignmentModal-classSelection').val());
		assignmentJson.notes = String(Jquery('#assignmentModal-notes').val());
		assignmentJson.assignmentId = String(Jquery('#assignmentModal-assignmentId').val());

		assignmentJson.time = String(Jquery('#assignmentModal-time').val());
		return assignmentJson;
	}

	// Generate Assignment Modal
	switch (type) {
		case 'edit':
			if (assignmentData == undefined || assignmentData == ({} as AssignmentJson))
				throw new Error('No assignment data passed through');

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

								await deleteAssignmentFromDatabase(assignmentId)
									.then(async () => {
										Jquery(`#assignmentElem-${assignmentId}`).remove();

										alertManager.generateModalAlert({
											icon: 'mood-happy',
											subHeader: 'Assignment Deleted',
											buttons: [{}]
										});
									})

									.catch((error) => {
										throw new Error(error);
									});
							} catch (error) {
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

								const assignmentId = Jquery('#assignmentModal-assignmentId').val();

								await updateAssignmentInDatabase(assignmentId, assignmentResultJson)
									.then(async () => {
										alertManager.generateModalAlert({
											icon: 'mood-happy',
											subHeader: 'Assignment Updated!',
											buttons: [{}]
										});
									})

									.catch((error) => {
										throw new Error(error);
									});
							} catch (error) {
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

								await addAssignmentToDatabase(assignmentResultJson)
									.then((assignmentId) => {
										assignmentResultJson['assignmentId'] = assignmentId;

										alertManager.generateModalAlert({
											icon: 'mood-happy',
											subHeader: 'Assignment Added!',
											buttons: [{}]
										});
									})

									.catch(async (error) => {
										throw new Error(error);
									});
							} catch (error) {
								console.error(error);
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
		return Jquery(this).val(Jquery(this).val());
	});

	//   On Icon select, update the preview.
	Jquery('#assignmentModal-classSelection').on('change', async function () {
		let classSelectionId = Jquery(this).val();

		let classData = await getClassById(classSelectionId);

		if (classSelectionId == 'none' || classSelectionId == null) {
			Jquery('#assignmentModal-classSelection').val('none');
			Jquery('#assignmentModalIconPreview').css(
				'background-image',

				`url('${getMushroomDataFromName('missingnolol').icon}')`
			);
			return;
		} else {
			await getAllUserMadeClasses().then(function (result) {
				if (classData == null) {
					throw new Error('Class not found!');
				}
				Jquery('#assignmentModalIconPreview').css(
					'background-image',

					`url('${getMushroomDataFromName(classData.icon).icon}')`
				);
			});
		}
	});

	// Populate the input fields if we are in type edit.
	if (type == 'edit') {
		Jquery('#assignmentModal-classSelection').val(assignmentData?.classId);
		Jquery('#assignmentModal-classSelection').trigger('change');
	}
}

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
	const mushroomBank = getMushroomBank();
	mushroomBank.forEach((mushroomElement, index) => {
		if (mushroomElement.title == 'missingno') return;
		dropdownContent += `
        <li><label><div style="background-image: url(${mushroomElement.icon}); background-size: ${mushroomElement.scale}" class="classElementIcon"></div><span>${mushroomElement.title}</span></label>
            <input type="radio" checked name="classIconSelect" value="${mushroomElement.title}" id="mushroomIconBtn-${mushroomElement.title}"></li>`;
	});
	return dropdownContent;
}
