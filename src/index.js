import * as $ from "jquery";
import {
  signUserUp,
  signUserOut,
  signUserIn,
  changeRoute,
  checkRequired,
  googlePopup,
  updateUserDisplayName,
  reauthenticate,
  deleteCurrentUser,
  sanitizeHtmlFunc,
  updateUserPassword,
  updateUserEmail,
  sendResetPasswordEmail,
} from "./model";

import { syncSettings, settings } from "./userData.js";
import * as alertManager from "./alert.js";
import { mushroomBank } from "./mushroomBank.js";
import sanitizeHtml from "sanitize-html";
import { onAuthStateChanged, getAuth, EmailAuthProvider } from "firebase/auth";
import { checkDarkModePreference, setTheme, browserTheme } from "./browserTheme.js";
import * as cookieManager from "./cookieManager.min.js";
import {
  updateUserSettings,
  addClassToDatabase,
  getAllUserMadeClasses,
  getAllUserMadeAssignments,
  deleteClassFromDatabase,
  getClassById,
  updateClassInDatabase,
} from "./firestoreDatabase.js";

var sidebarOpen = true;

// Call loadSettingsPage when the page loads
$(document).ready(async function () {
  await syncSettings();

  initURLListener();
  checkDarkModePreference();

  $(".sidebarToggle").on("click", function () {
    sidebarOpen = !sidebarOpen;
    if (sidebarOpen) {
      $(this)
        .find("i")
        .html(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2zM10 7H8v2h2zm0 0h2V5h-2zm0 10H8v-2h2zm0 0h2v2h-2z" /> </svg>`
        );
      $("aside").addClass("sb-expanded");
    } else {
      $(this)
        .find("i")
        .html(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2zm10-4h2v2h-2zm0 0h-2V5h2zm0 10h2v-2h-2zm0 0h-2v2h2z"/></svg>`
        );
      $("aside").removeClass("sb-expanded");
    }
  });
});

function initURLListener() {
  $(window).on(`hashchange`, changeRoute);
  changeRoute();
}

export function initListenersByPage(pageID) {
  switch (pageID) {
    case "home":
      let slideIndex = 1;
      showSlides(slideIndex);

      $(".dot").on("click", function () {
        currentSlide($(this).attr("id")[3]);
      });

      $(".prev").on("click", () => {
        plusSlides(-1);
      });
      $(".next").on("click", () => {
        plusSlides(1);
      });

      // Next/previous controls
      function plusSlides(n) {
        showSlides((slideIndex += n));
      }

      // Thumbnail image controls
      function currentSlide(n) {
        showSlides((slideIndex = n));
      }

      function showSlides(n) {
        let i;
        let slides = document.getElementsByClassName("mySlides");
        let dots = document.getElementsByClassName("dot");
        if (n > slides.length) {
          slideIndex = 1;
        }
        if (n < 1) {
          slideIndex = slides.length;
        }
        for (i = 0; i < slides.length; i++) {
          slides[i].style.display = "none";
        }
        for (i = 0; i < dots.length; i++) {
          dots[i].className = dots[i].className.replace(" active", "");
        }
        slides[slideIndex - 1].style.display = "block";
        dots[slideIndex - 1].className += " active";
      }
      break;
    case "signup":
      initTogglePasswordVisibilityListeners();
      initGoogleLoginBtn();
      $("#signUp-submit").on("click", (e) => {
        e.preventDefault();
        var checkRequiredResponse = checkRequired("signUp-form");
        if (checkRequiredResponse[0]) {
          const displayName = $("#signUp-displayName").val();
          const email = $("#signUp-email").val();
          const password = $("#signUp-password").val();
          signUserUp(displayName, email, password);
        } else {
          $("#signUp-statusText").html(checkRequiredResponse[1]);
        }
      });
      break;
    case "signin":
      initTogglePasswordVisibilityListeners();
      initGoogleLoginBtn();

      $("#signIn-submit").on("click", (e) => {
        e.preventDefault();
        var checkRequiredResponse = checkRequired("signIn-form");
        if (checkRequiredResponse[0]) {
          const email = $("#signIn-email").val();
          const password = $("#signIn-password").val();
          signUserIn(email, password);
        } else {
          $("#signIn-statusText").html(checkRequiredResponse[1]);
        }
      });
      break;
    case "forgot":
      $("#resetPassword-submit").on("click", async (e) => {
        e.preventDefault();
        try {
          var checkRequiredResponse = checkRequired("resetPassword-form");
          if (checkRequiredResponse[0]) {
            const email = $("#resetPassword-email").val();
            $("#resetPassword-statusText").html(await sendResetPasswordEmail(email));
          } else {
            $("#resetPassword-statusText").html(checkRequiredResponse[1]);
          }
        } catch (error) {
          $("#resetPassword-statusText").html(error);
        }
      });
      break;
    case "account":
      $(".signoutBtn").on("click", (e) => {
        signUserOut();
        window.location = "#signin";
      });

      // Listen for the auth to update / load, then fill data
      const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
        if (user) {
          $(".displayName").html(user.displayName);
          $("#displayNameInput").val(user.displayName);
          $("#emailInput").val(user.email);
          $("#passwordInput").val("1234");
          unsubscribe();
          // User is signed in
        } else {
          window.location = "#signin";
          unsubscribe();
          // User is signed out
        }
      });

      $("#deleteAccountBtn").on("click", () => {
        alertManager.generateModalAlert({
          icon: "downasaur",
          header: "Delete Account?",
          subHeader: `<span class="alert">This is un-reverseable.</span>`,
          bodyText: `<span id="deleteAccountStatusText"></span>`,
          buttons: [
            { text: "Cancel" },
            {
              text: "Delete Account",
              class: "dangerous",
              closeModalOnClick: "false",
              onClick: async () => {
                try {
                  deleteCurrentUser();
                } catch (error) {
                  $("#deleteAccountStatusText").html(error);
                }
              },
            },
          ],
        });
      });

      $("#displayNameInput").on("change", function () {
        $(this).val(sanitizeHtml($(this).val(), { allowedTags: [], allowedAttributes: {} }));
      });

      $("#displayNameChangeButton").on("click", () => {
        const auth = getAuth();
        const user = auth.currentUser;
        var newName = sanitizeHtmlFunc($("#displayNameInput").val());

        if ($("#displayNameInput").val() != user.displayName) {
          alertManager.generateModalAlert({
            icon: "label",
            header: "Change Display Name?",
            subHeader: `${sanitizeHtmlFunc(user.displayName)} &#8674; ${sanitizeHtmlFunc(newName)}`,
            buttons: [
              { text: "Cancel" },
              {
                text: "Change Name",
                // closeModalOnClick: "false",
                onClick: () => {
                  updateUserDisplayName(sanitizeHtmlFunc(newName), "#displayNameChangeStatusText");
                },
              },
            ],
          });
        } else {
          setStatusText(
            "#displayNameChangeStatusText",
            "<span>Enter a new display name to change it.</span>"
          );
        }
      });
      $("#passwordChangeButton").on("click", () => {
        switch (getAuth().currentUser.providerData[0].providerId) {
          case "google.com":
            alertManager.generateModalAlert({
              icon: "error",
              header: "Google Account",
              subHeader: "Could not change password.",
              bodyText: "Your account is associated with a google account.",
            });
            break;
          case "password":
          default:
            alertManager.generateModalAlert({
              icon: "label",
              header: "Change Password",
              bodyText: `For your security, confirm your login details.
            <div class="signIn" style="margin-top: 20px">
              <form action="" id="changePassword-form">
                <div class="input-container">
                  <input required="" type="password" id="changePassword-currentPassword" autocomplete="current-password">
                  <label>Current Password</label>
                  <div class="toggleVisibility">
                    <img src="images/eye-open.svg" alt="" srcset="">
                  </div>
                </div>
                <div class="input-container">
                  <input required="" type="password" id="changePassword-newPassword" autocomplete="current-password">
                  <label>New Password</label>
                  <div class="toggleVisibility">
                    <img src="images/eye-open.svg" alt="" srcset="">
                  </div>
                </div>
                <div class="input-container">
                  <input required="" type="password" id="changePassword-newPasswordSecond" autocomplete="current-password" data-np-autofill-field-type="password">
                  <label>New Password</label>
                  <div class="toggleVisibility">
                    <img src="images/eye-open.svg" alt="" srcset="">
                  </div>
                </div>
                <span id="changePassword-statusText"></span>
              </form>
              </div>`,
              buttons: [
                {
                  text: `Change Password`,
                  closeModalOnClick: false,
                  onClick: async () => {
                    try {
                      var cred = EmailAuthProvider.credential(
                        getAuth().currentUser.email,
                        $("#changePassword-currentPassword").val()
                      );
                      await reauthenticate(cred);
                      await updateUserPassword($("#changePassword-currentPassword").val());
                      alertManager.generateModalAlert({
                        icon: "check",
                        header: "Password Changed!",
                        subHeader: "",
                        bodyText: "You may have to sign back in.",
                      });
                    } catch (error) {
                      $("#changePassword-statusText").html(error);
                    }
                  },
                  class: "secondary",
                },
              ],
            });
            initTogglePasswordVisibilityListeners();
            break;
        }

        // alertManager.generateModalAlert({
        //   icon: "label",
        //   header: "Change Password?",
        //   bodyText: `Enter your current password`,
        //   buttons: [
        //     { text: "Cancel" },
        //     {
        //       text: "Change Password",
        //       // closeModalOnClick: "false",
        //       onClick: () => {
        //         alert("logic unfinished");
        //       },
        //     },
        //   ],
        // });
      });
      $("#emailChangeButton").on("click", () => {
        const auth = getAuth();
        const user = auth.currentUser;
        switch (getAuth().currentUser.providerData[0].providerId) {
          case "google.com":
            alertManager.generateModalAlert({
              icon: "error",
              header: "Google Account",
              subHeader: "Could not change email.",
              bodyText: "Your account is associated with a google account.",
            });
            break;
          case "password":
          default:
            alertManager.generateModalAlert({
              icon: "label",
              header: "Change Email",
              bodyText: `For your security, confirm your login details.
              <div class="signIn" style="margin-top: 20px">
              <form action="" id="changeEmail-form">
                <div class="input-container">
                <input required="" type="text" id="changeEmail-currentEmail" autocomplete="current-email">
                <label>Current Email</label>
                </div>
                <div class="input-container">
                <input required="" type="password" id="changeEmail-currentPassword" autocomplete="current-password">
                <label>Current Password</label>
                <div class="toggleVisibility">
                <img src="images/eye-open.svg" alt="" srcset="">
                </div>
                </div>
                <div class="input-container">
                <input required="" type="text" id="changeEmail-newEmail" autocomplete="new-email" data-np-autofill-field-type="password">
                  <label>New Email</label>
                </div>
                <span id="changeEmail-statusText"></span>
                </form>
                </div>`,
              buttons: [
                {
                  text: `Change Email`,
                  closeModalOnClick: false,
                  onClick: async () => {
                    try {
                      var cred = EmailAuthProvider.credential(
                        $("#changeEmail-currentEmail").val(),
                        $("#changeEmail-currentPassword").val()
                      );
                      await reauthenticate(cred);
                      await updateUserEmail($("#changeEmail-newEmail").val());
                      $("#emailInput").val(getAuth().currentUser.email);
                      alertManager.generateModalAlert({
                        icon: "check",
                        header: "Email Changed!",
                        subHeader: "",
                        bodyText: "You may have to log back in.",
                      });
                    } catch (error) {
                      $("#changeEmail-statusText").html(error);
                    }
                  },
                  class: "secondary",
                },
              ],
            });
        }
        initTogglePasswordVisibilityListeners();

        // alertManager.generateModalAlert({
        //   icon: "label",
        //   header: "Change Password?",
        //   bodyText: `Enter your current password`,
        //   buttons: [
        //     { text: "Cancel" },
        //     {
        //       text: "Change Password",
        //       // closeModalOnClick: "false",
        //       onClick: () => {
        //         alert("logic unfinished");
        //       },
        //     },
        //   ],
        // });
      });
      break;
    case "options":
      const unsubscribeOptions = onAuthStateChanged(getAuth(), (user) => {
        if (user) {
          // Do logic
          $("#24hrTimeInput").prop("checked", settings.do24HrTime);
          unsubscribeOptions();
        } else {
          redirectPageRequiresAccount();
          unsubscribeOptions();
        }
      });

      $("#24hrTimeInput").change(function () {
        if ($(this).is(":checked")) {
          updateUserSettings("24hrTime", true);
          settings.do24HrTime = true;
        } else {
          updateUserSettings("24hrTime", false);
          settings.do24HrTime = false;
        }
      });

      $("#appearanceSelect button").on("click", function () {
        $("#appearanceSelect button").each(function () {
          $(this).removeClass("active");
        });
        $(this).addClass("active");
        var data = $(this).data("appearance");

        setTheme(data);
        $("#appearanceSelectCurrentText").html(
          data.charAt(0).toUpperCase() + data.slice(1) + " Mode"
        );
        updateAppearanceUI();
        switch (data) {
          case "dark":
            cookieManager.setCookie("themePreference", "dark");
            cookieManager.getCookie("themePreference");
            break;
          case "light":
            cookieManager.setCookie("themePreference", "light");
            break;
          default:
            cookieManager.clearCookie("themePreference");
            break;
        }
      });
      updateAppearanceUI();
      function updateAppearanceUI() {
        switch (browserTheme) {
          case "dark":
            $("#darkModeBtn").addClass("active");
            $("#lightModeBtn").removeClass("active");
            $("#autoModeBtn").removeClass("active");
            break;
          case "light":
            $("#darkModeBtn").removeClass("active");
            $("#lightModeBtn").addClass("active");
            $("#autoModeBtn").removeClass("active");
            break;
          case "auto":
          default:
            $("#darkModeBtn").removeClass("active");
            $("#lightModeBtn").removeClass("active");
            $("#autoModeBtn").addClass("active");
            break;
        }
      }
      $("#appearanceSelectCurrentText").html(
        browserTheme.charAt(0).toUpperCase() + browserTheme.slice(1) + " Mode"
      );

      break;
    case "dashboard":
      // Redirect user to the login page if we are not logged in.
      // Give it a second to allow firebase to auto-login on page visit.
      const unsubscribeDashboard = onAuthStateChanged(getAuth(), (user) => {
        if (user) {
          getAllUserMadeClasses().then((data) => {
            $("#classEntryContainer").html("");
            data.forEach((classEntry) => {
              dashboardAddClassElement(classEntry);
            });
          });
          unsubscribeDashboard();
          // User is signed in
        } else {
          redirectPageRequiresAccount();
          unsubscribeDashboard();
          // User is signed out
        }
      });
      resizeSelect("dashboardAssignmentTab");
      document.getElementById("dashboardAssignmentTab").addEventListener("change", () => {
        resizeSelect("dashboardAssignmentTab");
      });
      $("#classSectionFilters button").on("click", function () {
        $(this).parent().find("button").removeClass("active");
        $(this).addClass("active");
        $("#classEntryContainer").html("");
        switch ($(this).data("filter")) {
          case "all":
            getAllUserMadeClasses().then((data) => {
              data.forEach((classEntry) => {
                dashboardAddClassElement(classEntry);
              });
            });
            break;
          case "today":
            let today = getDayOfTheWeekAbbr(new Date());
            getAllUserMadeClasses().then((data) => {
              data.forEach((classEntry) => {
                if (classEntry.time[today] != undefined) {
                  dashboardAddClassElement(classEntry);
                }
              });
            });
            break;
          case "tomorrow":
            let tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow = getDayOfTheWeekAbbr(tomorrow);

            getAllUserMadeClasses().then((data) => {
              data.forEach((classEntry) => {
                if (classEntry.time[tomorrow] != undefined) {
                  dashboardAddClassElement(classEntry);
                }
              });
            });
            break;
        }
      });
      $("#classAddBtn").on("click", () => {
        callClassModal("create");
      });
      break;
    default:
      break;
  }
}

// Opens a create OR edit class modal.
async function callClassModal(type, classData = {}) {
  // Get mushroom elements and format them for the dropdown menu
  function getMushroomElementsForDropdown() {
    var dropdownContent = "";
    mushroomBank.forEach((mushroomElement, index) => {
      dropdownContent += `
        <li><label><div style="background-image: url(${mushroomElement.icon}); background-size: ${mushroomElement.scale}" class="classElementIcon"></div><span>${mushroomElement.title}</span></label>
            <input type="radio" checked name="classIconSelect" value="${mushroomElement.title}" id="mushroomIconBtn-${mushroomElement.title}"></li>`;
    });
    return dropdownContent;
  }

  var classTimeArray = {};
  const daySelectIds = [
    "#classModal-daySelectMon",
    "#classModal-daySelectTue",
    "#classModal-daySelectWed",
    "#classModal-daySelectThu",
    "#classModal-daySelectFri",
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
      <input id="classModal-classId" type='text' readonly value='${classData.classId}'/>
    </div>
    <div class="inputContainer centered">
      <label>Class Name</label>
      <input id="classModal-className" type='text'/>
    </div>
    <div class="inputContainer centered">
      <label>Professor</label>
      <input id="classModal-professor" type='text'/>
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
    classJson.name = $("#classModal-className").val();
    classJson.icon = $('input[name="classIconSelect"]:checked').val();
    classJson.professor = $("#classModal-professor").val();
    classJson.classId = $("#classModal-classId").val();

    // Construct time array
    // Check each of the day select fields to get days where class is in session.
    daySelectIds.forEach((checkboxId) => {
      if (document.getElementById(checkboxId.replace("#", "")).checked) {
        var day = checkboxId.replace("#classModal-daySelect", "");
        var timeSettings = $("#classModal-timeSettings").val();
        switch (timeSettings) {
          case "uniqueDaily":
            switch (day) {
              case "Mon":
                classTimeArray[day] = [
                  $("#classModal-timeFrom-Mon").val(),
                  $("#classModal-timeTo-Mon").val(),
                ];
                break;
              case "Tue":
                classTimeArray[day] = [
                  $("#classModal-timeFrom-Tue").val(),
                  $("#classModal-timeTo-Tue").val(),
                ];
                break;
              case "Wed":
                classTimeArray[day] = [
                  $("#classModal-timeFrom-Wed").val(),
                  $("#classModal-timeTo-Wed").val(),
                ];
                break;
              case "Thu":
                classTimeArray[day] = [
                  $("#classModal-timeFrom-Thu").val(),
                  $("#classModal-timeTo-Thu").val(),
                ];
                break;
              case "Fri":
                classTimeArray[day] = [
                  $("#classModal-timeFrom-Fri").val(),
                  $("#classModal-timeTo-Fri").val(),
                ];
                break;

              default:
                break;
            }
            break;
          case "default":
          default:
            classTimeArray[day] = [
              $("#classModal-timeFrom-all").val(),
              $("#classModal-timeTo-all").val(),
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
    case "edit":
      if (classData == undefined || classData == {})
        throw new Error("No class data passed through");

      await alertManager.generateModalAlert({
        icon: "text-add",
        header: `Edit Class`,
        subHeader: "",
        bodyText: alertBody,
        buttons: [
          { text: "Cancel" },
          {
            text: "Delete Class",
            class: "dangerous",
            closeModalOnClick: "false",
            onClick: async () => {
              try {
                const classId = $("#classModal-classId").val();
                await deleteClassFromDatabase(classId)
                  .then(async () => {
                    $(`#classElem-${classId}`).remove();

                    alertManager.generateModalAlert({
                      icon: "mood-happy",
                      subHeader: "Class Deleted",
                      buttons: [{}],
                    });
                  })
                  .catch((error) => {
                    throw new Error(error);
                  });
              } catch (error) {
                alertManager.generateModalAlert({
                  icon: "mood-sad",
                  header: "",
                  subHeader: "Error deleting class",
                  bodyText: error,
                  buttons: [{}],
                });
                throw error;
              }
            },
          },
          {
            text: "Confirm",
            closeModalOnClick: "false",
            onClick: async () => {
              try {
                const classResultJson = await formatClassJsonObject();
                const classId = $("#classModal-classId").val();
                await updateClassInDatabase(classId, classResultJson)
                  .then(async () => {
                    const newElem = classJsonToElement(classResultJson);
                    $(`#classElem-${classId}`).replaceWith(newElem);

                    addEventListenerToClassElement($(`#classElem-${classId}`));

                    alertManager.generateModalAlert({
                      icon: "mood-happy",
                      subHeader: "Class Updated!",
                      buttons: [{}],
                    });
                  })
                  .catch((error) => {
                    throw new Error(error);
                  });
              } catch (error) {
                alertManager.generateModalAlert({
                  icon: "mood-sad",
                  header: "",
                  subHeader: "Error updating class",
                  bodyText: error,
                  buttons: [{}],
                });
              }
            },
          },
        ],
      });

      break;
    case "create":
      alertManager.generateModalAlert({
        icon: "text-add",
        header: `Create Class`,
        subHeader: "",
        bodyText: alertBody,
        buttons: [
          { text: "Cancel" },
          {
            text: "Create",
            closeModalOnClick: false,
            onClick: async () => {
              try {
                var classResultJson = await formatClassJsonObject();
                // if (classResultJson.name == "") throw new Error("A class name is required.");

                await addClassToDatabase(classResultJson)
                  .then((classId) => {
                    classResultJson["classId"] = classId;
                    dashboardAddClassElement(classResultJson);
                    alertManager.generateModalAlert({
                      icon: "mood-happy",
                      subHeader: "Class Added!",
                      buttons: [{}],
                    });
                  })
                  .catch(async (error) => {
                    throw new Error(error);
                  });
              } catch (error) {
                alertManager.generateModalAlert({
                  icon: "mood-sad",
                  header: "",
                  subHeader: "Error creating class",
                  bodyText: error,
                  buttons: [{}],
                });
              }
            },
          },
        ],
      });
      break;
    default:
      alert("error unrecognized class modal type.");
      break;
  }

  // Add logic to the modal ==============================
  //   Sterilize all html
  $("input[type=text]").on("change", function () {
    $(this).val(sanitizeHtml($(this).val(), { allowedTags: [], allowedAttributes: {} }));
  });
  //   On Icon select, update the preview.
  $("#classIconDropdown li input").on("click", (elem) => {
    $("#classModalIconPreview").css(
      "background-image",
      `url("${getMushroomIconFromName(elem.target.getAttribute("value"))}")`
    );
  });
  //   Then, click the first icon in the list for the default icon!
  $("#classIconDropdown li input")[0].click();

  // Listen to the timeSettings dropdown.
  $("#classModal-timeSettings").on("change", function () {
    switch ($(this).val()) {
      case "uniqueDaily":
        $("#uniqueDailyTimeSelect").css("display", "block");
        $("#defaultFromAndToInputs").css("display", "none");
        break;
      case "default":
      default:
        $("#defaultFromAndToInputs").css("display", "flex");
        $("#uniqueDailyTimeSelect").css("display", "none");
        break;
    }
  });

  // Handle creating input fields for unique daily time settings.
  daySelectIds.forEach((checkboxId) => {
    $(checkboxId).on("click", function () {
      var day = checkboxId.replace("#classModal-daySelect", "");
      var elemId = `#uniqueDailyTimeSelect${day}`;
      if (this.checked) {
        $(elemId).css("display", "flex");
      } else {
        $(elemId).css("display", "none");
      }
    });
  });

  // Populate the input fields if we are in type edit.
  if (type == "edit") {
    // Set the icon
    document.getElementById(`mushroomIconBtn-${classData.icon}`).click();
    // Set the name and professor fields
    document.getElementById(`classModal-className`).value = classData.name;
    document.getElementById(`classModal-professor`).value = classData.professor;
    // Toggle the day selects
    daySelectIds.forEach((checkboxId) => {
      var day = checkboxId.replace("#classModal-daySelect", "");
      if (classData.time[day] != undefined) {
        document.getElementById(checkboxId.replace("#", "")).click();
      }
    });
    // Set the timeSetting dropdown and the time boxes
    if (classData.time == {} || $.isEmptyObject(classData.time)) {
      return;
    } else if (areAllEntriesEqual(classData.time)) {
      $(`#classModal-timeSettings`).val("default").change();
      var value = Object.values(classData.time)[0];
      $(`#classModal-timeFrom-all`).val(value[0]);
      $(`#classModal-timeTo-all`).val(value[1]);
    } else {
      $(`#classModal-timeSettings`).val("uniqueDaily").change();
      for (const [key, value] of Object.entries(classData.time)) {
        $(`#classModal-timeFrom-${key}`).val(value[0]);
        $(`#classModal-timeTo-${key}`).val(value[1]);
      }
    }
  }
}

function classJsonToElement(classData) {
  if (classData["classId"] == undefined) throw "NO CLASSID WAS PASSED";

  function ifDayIsSelected(dayAbbreviation) {
    if (classData.time[dayAbbreviation] != null) return "class='selected'";
    return "";
  }
  function getTimes() {
    var resultingTimeTable = "";

    //Check if no times are listed, in which case, no times are needed.
    if ($.isEmptyObject(classData.time)) {
      return "";
    } else if (areAllEntriesEqual(classData.time)) {
      // If all times are the same for each day, only print one set.
      var value = Object.values(classData.time)[0];

      if (value[0] != "" && value[1] != "") {
        resultingTimeTable = `
        <tr>
        <td>${convertTo12Hour(value[0])} - ${convertTo12Hour(value[1])}</td>
        </tr>`;
      }
    } else {
      // If each day has different value, print each separately
      for (const [key, value] of Object.entries(classData.time)) {
        if (value[0] != "" && value[1] != "") {
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
      <h6>${classData.professor}</h6>
      <ul class="classDatesContainer">
        <li ${ifDayIsSelected("Mon")}>Mon</li>
        <li ${ifDayIsSelected("Tue")}>Tue</li>
        <li ${ifDayIsSelected("Wed")}>Wed</li>
        <li ${ifDayIsSelected("Thu")}>Thu</li>
        <li ${ifDayIsSelected("Fri")}>Fri</li>
      </ul>
      <table>
        ${getTimes()}
      </table>
    </div>
    <div class="infoBox">
      <textarea placeholder="Notes..." name="infoBox" id="infoBox">${classData.info}</textarea>
    </div>
    <div class="actionBtns">
      <div class="actionButton">
        <a class="editOnClick pixelart-icons-font-edit"></a>
      </div>
    </div>
  </div>`;
}

function redirectPageRequiresAccount() {
  window.location.href = "#signin";
  alertManager.generateModalAlert({
    header: "Requires an Account",
    subHeader: `This page requires an account.`,
    bodyText: `Ready to see what Sporeganizer has to offer? Create an account to get started!`,
    buttons: [
      {
        text: "Login",
      },
    ],
  });
}

// HELPER FUNCTIONS ============================================
export function dashboardAddClassElement(classData) {
  let classElement = classJsonToElement(classData);
  let newElement = $("#classEntryContainer").append(classElement);
  addEventListenerToClassElement(newElement[0].lastChild);
}

function getDayOfTheWeekAbbr(date) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayIndex = date.getDay();
  return daysOfWeek[dayIndex];
}

function addEventListenerToClassElement(elem) {
  $(elem)
    .find(".editOnClick")
    .on("click", async function () {
      var thisClassId = $(this).closest(".classElement").data("classid");
      callClassModal("edit", await getClassById(thisClassId));
    });
}

function convertTo12Hour(time24) {
  if (settings.do24HrTime) return time24;
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours < 12 || hours === 24 ? "AM" : "PM";
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");
  return `${formattedHours}:${formattedMinutes} ${period}`;
}

function getMushroomIconFromName(name) {
  const thisMushroomBankJson = mushroomBank.filter(function (data) {
    return data.title == name;
  })[0];
  if (thisMushroomBankJson == undefined) return null;
  return thisMushroomBankJson.icon;
}

function areAllEntriesEqual(schedule) {
  const timeEntries = Object.values(schedule).map((times) => JSON.stringify(times));

  return timeEntries.every((entry) => entry === timeEntries[0]);
}

function initTogglePasswordVisibilityListeners() {
  $(".toggleVisibility").attr("tabindex", "0");
  $(".toggleVisibility").on("click", function (e) {
    e.preventDefault();
    $(this).toggleClass("visibility");
    if ($(this).hasClass("visibility")) {
      $(this).find("img").attr("src", "images/ui/eye-closed.svg");
      $(this).parent().find("input").attr("type", "text");
    } else {
      $(this).find("img").attr("src", "images/ui/eye-open.svg");
      $(this).parent().find("input").attr("type", "password");
    }
  });
}

function initGoogleLoginBtn() {
  $(".googleSignIn").on("click", function () {
    googlePopup();
  });
}

function setStatusText(id, text, time = 5) {
  $(id).html(text);
  setTimeout(() => {
    $(id).html("");
  }, time * 1000);
}

function resizeSelect(selectId) {
  const select = document.getElementById(selectId);
  const tempSpan = document.createElement("span");

  // Apply same styles to mimic select option rendering
  tempSpan.style.visibility = "hidden";
  tempSpan.style.position = "absolute";
  tempSpan.style.whiteSpace = "nowrap";
  tempSpan.style.font = getComputedStyle(select).font;
  tempSpan.style.fontWeight = 900;

  tempSpan.textContent = select.options[select.selectedIndex].text;
  document.body.appendChild(tempSpan);

  // Adjust the select width to match the option text + some padding
  select.style.width = tempSpan.offsetWidth + 34 + "px";

  document.body.removeChild(tempSpan);
}
