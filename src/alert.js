import * as $ from "jquery";
var alertCount = 0;
var modalAllowClickOut = true;

var modalContainerReference = null;
var modalBackground = null;
var modalReference = null;
var modalButtonsReference = null;

const alertParams = {
  icon: "alert",
  header: "headerText",
  subHeader: "subHeaderText",
  includeDismissBtn: true,
};

// Icons currently use PixelArtIcons from Gerrit Halfmann found here:
// https://icon-sets.iconify.design/pixelarticons/

debug();
createModalElement();

export function createModalElement() {
  if (document.getElementById("modalContainer") == null) {
    $("body").append(
      `<div id="modalContainer" class="modalContainer">
        <div class="modalBackground" id="modalContainer-bg">
          <div class="modal" id="modalContainer-modal}">
            <button class="closeBtn pixelart-icons-font-close-box" id="modalCloseBtn"></button>
            <div id="modalMainContent">
              <icon id="modalIcon"></icon>
              <h2>Header</h2>
              <h3>Subheader</h3>
              <div id="modalMainButtons">
                <button type="button" class="button dismissBtn">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      </div>`
    );

    modalContainerReference = document.getElementById("modalContainer");
    modalBackground = document.getElementById("modalContainer-bg");
    modalReference = document.getElementById("modalMainContent");
    modalButtonsReference = document.getElementById("modalMainButtons");

    modalContainerReference.addEventListener("click", function (e) {
      if (modalAllowClickOut && e.target == modalBackground) closeModal();
    });
    document.getElementById("modalCloseBtn").addEventListener("click", function (e) {
      closeModal();
    });
    $(modalReference)
      .find(".dismissBtn")
      .on("click", function (e) {
        closeModal();
      });
  }
}

function populateModalElement(customAlertParams) {
  customAlertParams = { ...alertParams, ...customAlertParams };

  // Populate the Icon
  var iconRef = $(modalReference).find("icon");
  iconRef.removeClass();
  iconRef.addClass(`pixelart-icons-font-${customAlertParams.icon}`);

  // Populate Text
  var headerRef = $(modalReference).find("h2");
  var subHeaderRef = $(modalReference).find("h3");
  headerRef.html(customAlertParams.header);
  subHeaderRef.html(customAlertParams.subHeader);
}

function displayModal() {
  modalContainerReference.classList.remove("out");
  modalContainerReference.classList.add("active");
}
function closeModal() {
  modalContainerReference.classList.add("out");
}

export function generateModalAlert(params) {
  createModalElement();
  populateModalElement(params);
  displayModal();
}

function debug() {
  document.addEventListener("keypress", function (event) {
    switch (event.key) {
      case "`":
        generateModalAlert({});
        break;
      case "1":
        generateModalAlert({ icon: "subscriptions", header: "header", subHeader: "mySubtitle" });
        break;
      case "2":
        generateModalAlert({
          icon: "cake",
          header: "Happy Cake Day!",
          subHeader: "<i>the cake is a lie.</i>",
        });
        break;
    }
  });
}
