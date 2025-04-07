import Jquery from 'jquery';

var modalContainerReference = null;
var modalBackground = null;
var modalReference = null;
var modalButtonsReference = null;

const alertParams = {
	icon: 'alert',
	header: '',
	subHeader: '',
	bodyText: '',
	allowClickOff: true,
	buttons: [
		{
			/* Empty object will default to the dismiss button */
		}
	]
};

const buttonParams = {
	text: 'Dismiss',
	closeModalOnClick: true,
	onClick: () => {},
	class: 'secondary',
	onlyAllowOneClick: true
};

// Icons currently use PixelArtIcons from Gerrit Halfmann found here:
// https://icon-sets.iconify.design/pixelarticons/

function createModalElement() {
	if (document.getElementById('modalContainer') == null) {
		Jquery('body').append(
			`<div id="modalContainer" class="modalContainer">
        <div class="modalBackground" id="modalContainer-bg">
          <div class="modal" id="modalContainer-modal">
            <button class="raw closeBtn pixelart-icons-font-close-box" id="modalCloseBtn"></button>
            <div id="modalMainContent">
              <icon id="modalIcon"></icon>
              <h2 class="modalHeader">Header</h2>
              <h3 class="modalSubheader">Subheader</h3>
              <p class="modalBody">bodyText</p>
              <div id="modalMainButtons">
                <button type="button" class="button dismissBtn">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      </div>`
		);

		modalContainerReference = document.getElementById('modalContainer');
		modalBackground = document.getElementById('modalContainer-bg');
		modalReference = document.getElementById('modalMainContent');
		modalButtonsReference = document.getElementById('modalMainButtons');

		document.getElementById('modalCloseBtn').addEventListener('click', function (e) {
			closeModal();
		});

		modalContainerReference.addEventListener('click', handleModalClickOff);
	}
}

/**
 * @param {{ target: any; }} event
 */
function handleModalClickOff(event) {
	if (
		event.target == modalBackground &&
		Jquery(modalContainerReference).attr('allowClickOff') != 'false'
	)
		closeModal();
}

/**
 * @param {{ allowClickOff: any; icon: any; header: any; subHeader: any; bodyText: any; buttons: any[]; }} customAlertParams
 */
function populateModalElement(customAlertParams) {
	customAlertParams = { ...alertParams, ...customAlertParams };

	Jquery(modalContainerReference).attr('allowClickOff', customAlertParams.allowClickOff);

	// Populate the Icon

	var iconRef = Jquery(modalReference).find('icon');
	iconRef.removeClass();
	iconRef.addClass(`pixelart-icons-font-${customAlertParams.icon}`);

	// Populate Text

	var headerRef = Jquery(modalReference).find('h2');

	var subHeaderRef = Jquery(modalReference).find('h3');

	var bodyTextRef = Jquery(modalReference).find('p');
	headerRef.html(customAlertParams.header);
	subHeaderRef.html(customAlertParams.subHeader);
	bodyTextRef.html(customAlertParams.bodyText);

	// Populate buttons

	Jquery(modalButtonsReference).html('');

	customAlertParams.buttons.forEach(
		(
			/** @type {{ text: any; class: any; closeModalOnClick: any; onlyAllowOneClick: any; onClick: () => void; }} */ buttonElement,
			/** @type {any} */ index
		) => {
			buttonElement = { ...buttonParams, ...buttonElement };
			var buttonElementHtml = `<button type="button" id="button${index}" class="button">${buttonElement.text}</button>`;

			Jquery(modalButtonsReference).append(buttonElementHtml);

			var buttonElementRef = Jquery(`#button${index}`);

			Jquery(buttonElementRef).addClass(`${buttonElement.class}`);

			Jquery(buttonElementRef).attr('closeModalOnClick', buttonElement.closeModalOnClick);

			Jquery(buttonElementRef).attr('onlyAllowOneClick', buttonElement.onlyAllowOneClick);

			Jquery(`#button${index}`).on('click', function () {
				if (Jquery(this).attr('clicked') == 'true') closeModal();

				if (Jquery(this).attr('onlyAllowOneClick') == 'true') Jquery(this).off('click');

				buttonElement.onClick();

				if (Jquery(this).attr('closeModalOnClick') == 'true') closeModal();
			});
		}
	);
}

function displayModal() {
	modalContainerReference.classList.remove('out');

	modalContainerReference.classList.add('active');
}
function closeModal() {
	modalContainerReference.classList.add('out');
}

/**
 * @param {{
 *  icon?: string;
 *  header?: string;
 *  subHeader?: string;
 *  bodyText?: string;
 *  allowClickOff?: boolean;
 *  buttons?: {
 *      text?: string;
 *      class?: string;
 *      closeModalOnClick?: boolean;
 *      onlyAllowOneClick?: boolean;
 *      onClick?: () => void;
 *  }[];
 * }} params
 */
export async function generateModalAlert(params) {
	createModalElement();

	populateModalElement(params);
	displayModal();
}

function debug() {
	document.addEventListener('keypress', function (event) {
		switch (event.key) {
			case '~':
				generateModalAlert({});
				break;
			case '!':
				generateModalAlert({
					icon: 'subscriptions',
					header: 'header',
					subHeader: 'mySubtitle',
					bodyText: 'myBodyText'
				});
				break;
			case '@':
				generateModalAlert({
					icon: 'cake',
					header: 'Happy Cake Day!',
					subHeader: 'the cake is a lie.',
					bodyText: 'Or is it?',
					allowClickOff: false
				});
				break;
			case '#':
				generateModalAlert({
					icon: 'alert',
					header: 'headerText',
					subHeader: 'subHeaderText',
					bodyText: '',
					allowClickOff: true,
					buttons: [
						{
							closeModalOnClick: false
						}
					]
				});
				break;
		}
	});
}
