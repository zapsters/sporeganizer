import * as $ from "jquery";
var alertCount = 0;
var modalAllowClickOut = true;

var modalContainerReference = null;
var modalBackground = null;
var modalReference = null;

// SVG COLLECTION
const closeBtn = `<svg xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 24 24">
	<path fill="#fff" d="M5 5h2v2H5zm4 4H7V7h2zm2 2H9V9h2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2zm2-2v2h-2V9zm2-2v2h-2V7zm0 0V5h2v2z" />
</svg>`;

debug();
createModalElement();

export function createModalElement() {
  if (document.getElementById("modalContainer") == null) {
    $("body").append(
      `<div id=${"modalContainer"} class="modalContainer">
        <div class="modalBackground" id=${"modalContainer-bg"}>
          <div class="modal" id="${"modalContainer-modal"}">
            <span class="closeBtn" id="modalCloseBtn">${closeBtn}</span>
            <div id="modalIcon"></div>
            <h2>Header</h2>
            <p>Subheader</p>
            <div id="modalButtonSection">buttons</div>
          </div>
        </div>
      </div>`
    );

    modalContainerReference = document.getElementById("modalContainer");
    modalReference = document.getElementById("modalContainer-modal");
    modalBackground = document.getElementById("modalContainer-bg");

    modalContainerReference.addEventListener("click", function (e) {
      if (modalAllowClickOut && e.target == modalBackground) closeModal();
    });
    document.getElementById("modalCloseBtn").addEventListener("click", function (e) {
      closeModal();
    });
  }
}

function displayModal() {
  modalContainerReference.classList.remove("out");
  modalContainerReference.classList.add("active");
}
function closeModal() {
  modalContainerReference.classList.add("out");
}

export function generateModalAlert() {
  createModalElement();
  displayModal();
}

function debug() {
  document.addEventListener("keypress", function (event) {
    if (event.key === "`") {
      generateModalAlert();
    }
  });
}
