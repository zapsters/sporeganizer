import Jquery from 'jquery';
// @ts-ignore
var alertCount = 0;
// @ts-ignore
var modalAllowClickOut = true;

/**
 * @type {HTMLElement | null}
 */
var modalContainerReference = null;
/**
 * @type {HTMLElement | null}
 */
var modalBackground = null;
/**
 * @type {HTMLElement | null}
 */
var modalReference = null;
/**
 * @type {HTMLElement | null}
 */
var modalButtonsReference = null;

const alertParams = {
	icon: 'alert',
	header: '',
	subHeader: '',
	bodyText: '',
	allowClickOff: true,
	// onModalOut: function () {},
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
		// @ts-ignore
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

		// @ts-ignore
		// @ts-ignore
		document.getElementById('modalCloseBtn').addEventListener('click', function (e) {
			closeModal();
		});

		// @ts-ignore
		modalContainerReference.addEventListener('click', handleModalClickOff);
	}
}

/**
 * @param {{ target: any; }} event
 */
function handleModalClickOff(event) {
	if (
		event.target == modalBackground &&
		// @ts-ignore
		Jquery(modalContainerReference).attr('allowClickOff') != 'false'
	)
		closeModal();
}

/**
 * @param {{ allowClickOff: any; icon: any; header: any; subHeader: any; bodyText: any; buttons: any[]; }} customAlertParams
 */
function populateModalElement(customAlertParams) {
	customAlertParams = { ...alertParams, ...customAlertParams };

	// @ts-ignore
	Jquery(modalContainerReference).attr('allowClickOff', customAlertParams.allowClickOff);

	// Populate the Icon
	// @ts-ignore
	var iconRef = Jquery(modalReference).find('icon');
	iconRef.removeClass();
	iconRef.addClass(`pixelart-icons-font-${customAlertParams.icon}`);

	// Populate Text
	// @ts-ignore
	var headerRef = Jquery(modalReference).find('h2');
	// @ts-ignore
	var subHeaderRef = Jquery(modalReference).find('h3');
	// @ts-ignore
	var bodyTextRef = Jquery(modalReference).find('p');
	headerRef.html(customAlertParams.header);
	subHeaderRef.html(customAlertParams.subHeader);
	bodyTextRef.html(customAlertParams.bodyText);

	// Populate buttons
	// @ts-ignore
	Jquery(modalButtonsReference).html('');

	customAlertParams.buttons.forEach(
		(
			/** @type {{ text: any; class: any; closeModalOnClick: any; onlyAllowOneClick: any; onClick: () => void; }} */ buttonElement,
			/** @type {any} */ index
		) => {
			buttonElement = { ...buttonParams, ...buttonElement };
			var buttonElementHtml = `<button type="button" id="button${index}" class="button">${buttonElement.text}</button>`;
			// @ts-ignore
			Jquery(modalButtonsReference).append(buttonElementHtml);
			// @ts-ignore
			var buttonElementRef = Jquery(`#button${index}`);
			// @ts-ignore
			Jquery(buttonElementRef).addClass(`${buttonElement.class}`);
			// @ts-ignore
			Jquery(buttonElementRef).attr('closeModalOnClick', buttonElement.closeModalOnClick);
			// @ts-ignore
			Jquery(buttonElementRef).attr('onlyAllowOneClick', buttonElement.onlyAllowOneClick);
			// @ts-ignore
			Jquery(`#button${index}`).on('click', function () {
				// @ts-ignore
				if (Jquery(this).attr('clicked') == 'true') closeModal(customAlertParams);
				// @ts-ignore
				if (Jquery(this).attr('onlyAllowOneClick') == 'true') Jquery(this).off('click');

				buttonElement.onClick();

				// @ts-ignore
				if (Jquery(this).attr('closeModalOnClick') == 'true') closeModal(customAlertParams);
			});
		}
	);
}

function displayModal() {
	// @ts-ignore
	modalContainerReference.classList.remove('out');
	// @ts-ignore
	modalContainerReference.classList.add('active');
}
function closeModal() {
	// @ts-ignore
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
	// @ts-ignore
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
