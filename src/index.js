import * as $ from "jquery";
import {
  signUserUp,
  signUserOut,
  signUserIn,
  changeRoute,
  checkRequired,
  getUserDisplayName,
  googlePopup,
  getUserAuth,
  updateUserDisplayName,
  getCurrentUser,
  reauthenticate,
  deleteCurrentUser,
  sanitizeHtmlFunc,
} from "./model";

import * as alertManager from "./alert.js";

import sanitizeHtml from "sanitize-html";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import * as cookieManager from "./cookieManager.min.js";
import { checkDarkModePreference, setTheme, browserTheme } from "./browserTheme.js";
import * as firestoreDatabase from "./firestoreDatabase.js";

var sidebarOpen = true;

$(document).ready(function () {
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
  $(".displayName").html(getUserDisplayName());
  switch (pageID) {
    case "home":
      break;
    case "signUp":
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

    case "signIn":
      initTogglePasswordVisibilityListeners();
      initGoogleLoginBtn();

      $("#signIn-submit").on("click", (e) => {
        firestoreDatabase.testWrite();
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
    case "account":
      $(".signoutBtn").on("click", (e) => {
        signUserOut();
        window.location = "#signIn";
      });
      // console.log(getUserAuth());

      // Listen for the auth to update / load, then fill data
      const unsubscribe = onAuthStateChanged(getUserAuth(), (user) => {
        if (user) {
          $("#displayNameInput").val(user.displayName);
          $("#emailInput").val(user.email);
          $("#passwordInput").val("1234");
          unsubscribe();
          // User is signed in
        } else {
          console.log("no user");
          window.location = "#signIn";
          unsubscribe();
          // User is signed out
        }
      });

      $("#deleteAccountBtn").on("click", () => {
        // promptForCredentials();
        alertManager.generateModalAlert({
          icon: "downasaur",
          header: "Delete Account?",
          subHeader: `<span class="alert">This is un-reverseable.</span>`,
          buttons: [
            { text: "Cancel" },
            {
              text: "Delete Account",
              class: "dangerous",
              closeModalOnClick: "false",
              onClick: () => {
                deleteCurrentUser();
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

        console.log($("#displayNameInput").val());

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
        const auth = getAuth();
        const user = auth.currentUser;
        alertManager.generateModalAlert({
          icon: "label",
          header: "Change Password",
          bodyText: `For your security, confirm your login details.
            <div class="signIn" style="margin-top: 20px">
              <form action="" id="signIn-form" autocomplete="off" data-np-autofill-form-type="login" data-np-checked="1" data-np-watching="1" class="">
                <div class="input-container">
                  <input required="" type="password" id="changePassword-currentPassword" autocomplete="current-password" data-np-autofill-field-type="password" data-np-uid="24bad00c-c9bf-4240-87d9-fe2ac60fc0ed">
                  <label>Current Password</label>
                  <div class="toggleVisibility">
                    <img src="images/eye-open.svg" alt="" srcset="">
                  </div>
                </div>
                <div class="input-container">
                  <input required="" type="password" id="changePassword-newPassword" autocomplete="current-password" data-np-autofill-field-type="password" data-np-uid="24bad00c-c9bf-4240-87d9-fe2ac60fc0ed">
                  <label>New Password</label>
                  <div class="toggleVisibility">
                    <img src="images/eye-open.svg" alt="" srcset="">
                  </div>
                </div>
                <div class="input-container">
                  <input required="" type="password" id="changePassword-newPasswordSecond" autocomplete="current-password" data-np-autofill-field-type="password" data-np-uid="24bad00c-c9bf-4240-87d9-fe2ac60fc0ed">
                  <label>New Password</label>
                  <div class="toggleVisibility">
                    <img src="images/eye-open.svg" alt="" srcset="">
                  </div>
                </div>
                <span id="signIn-statusText"></span>
                <div class="input-container">
                  <input autocomplete="off" type="submit" id="signIn-submit" value="Sign In">
                </div>
              </form>
              </div>`,
          buttons: [],
        });
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
      firestoreDatabase.testWrite();
      $("#appearanceSelect img").on("click", function () {
        $("#appearanceSelect img").each(function () {
          $(this).removeClass("active");
        });
        $(this).addClass("active");
        var data = $(this).data("appearance");
        cookieManager.setCookie("themePreference", data);
        setTheme(data);
      });
      if (browserTheme == "dark") {
        $("#darkModeBtn").addClass("active");
        $("#lightModeBtn").removeClass("active");
      } else {
        $("#darkModeBtn").removeClass("active");
        $("#lightModeBtn").addClass("active");
      }
      $("#appearanceSelect span").html(
        browserTheme.charAt(0).toUpperCase() + browserTheme.slice(1) + " Mode"
      );
      break;
    default:
      break;
  }
}

function initTogglePasswordVisibilityListeners() {
  $(".toggleVisibility").attr("tabindex", "0");
  $(".toggleVisibility").on("click", function (e) {
    e.preventDefault();
    $(this).toggleClass("visibility");
    if ($(this).hasClass("visibility")) {
      $(this).find("img").attr("src", "images/eye-closed.svg");
      $(this).parent().find("input").attr("type", "text");
    } else {
      $(this).find("img").attr("src", "images/eye-open.svg");
      $(this).parent().find("input").attr("type", "password");
    }
  });
}

function initGoogleLoginBtn() {
  $(".googleSignIn").on("click", function () {
    console.log("Attempting pop up");

    googlePopup();
  });
}

function setStatusText(id, text, time = 5) {
  $(id).html(text);
  setTimeout(() => {
    $(id).html("");
  }, time * 1000);
}

function promptForCredentials() {
  alertManager.generateModalAlert({
    header: "Confirm your Credentials",
    bodyText: `For your security, confirm your login details.
    <div class="signIn" style="margin-top: 20px">
      <form action="" id="signIn-form" autocomplete="off" data-np-autofill-form-type="login" data-np-checked="1" data-np-watching="1" class="">
        <div class="input-container">
          <input required="" type="text" id="signIn-email" autocomplete="email" data-np-autofill-field-type="username" data-np-uid="787df108-3938-4481-93a3-f87348a4b9d3">
          <label>Email</label>
        <nordpass-icon data-np-uid="787df108-3938-4481-93a3-f87348a4b9d3" style="all: initial !important;"></nordpass-icon></div>
        <div class="input-container">
          <input required="" type="password" id="signIn-password" autocomplete="current-password" data-np-autofill-field-type="password" data-np-uid="24bad00c-c9bf-4240-87d9-fe2ac60fc0ed">
          <label>Password</label>
          <button class="toggleVisibility">
            <img src="images/eye-open.svg" alt="" srcset="">
          </button>
        <nordpass-icon data-np-uid="24bad00c-c9bf-4240-87d9-fe2ac60fc0ed" style="all: initial !important;"></nordpass-icon></div>
        <span id="signIn-statusText"></span>
        <div class="input-container">
          <input autocomplete="off" type="submit" id="signIn-submit" value="Sign In">
        </div>
      </form>
      </div>`,
    buttons: [],
  });
  initTogglePasswordVisibilityListeners();
  // $("#signIn-submit").on("click", (e) => {
  //   e.preventDefault();
  //   var checkRequiredResponse = checkRequired("signIn-form");
  //   if (checkRequiredResponse[0]) {
  //     const email = $("#signIn-email").val();
  //     const password = $("#signIn-password").val();
  //     reauthenticate(email, password)
  //       .then((res) => console.log(res))
  //       .catch((error) => console.log(error));
  //   } else {
  //     $("#signIn-statusText").html(checkRequiredResponse[1]);
  //   }
  // });
}
