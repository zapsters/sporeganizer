import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  updateEmail,
  reauthenticateWithCredential,
  deleteUser,
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import { initListenersByPage } from "./index.js";

import * as $ from "jquery";
import { app, db, provider } from "./firebaseConfig";
import * as alertManager from "./alert.js";
import * as sanitizeHtml from "sanitize-html";
import * as firestoreDatabase from "./firestoreDatabase.js";

let uid = "";
const auth = getAuth(app);
const currentHost = window.location.host;

// ROUTE HANDLING ========================================

export function changeRoute() {
  let hashTag = window.location.hash;
  let pageID = hashTag.replace(`#`, ``);

  if (pageID == ``) {
    pageID = `home`;
  }
  $.get(`pages/${pageID}.html`, function (data) {
    $(`#app`).html(data);
  })
    .done(function () {
      initListenersByPage(pageID);
    })
    .fail(function (error) {
      $(`#app`).html(
        `<!DOCTYPE html><style>.error {padding-top: 100px} .box{margin:0 auto; margin-bottom:100px; border-radius: 20px; background-color:rgba(128,128,128,.356);width:fit-content;padding:30px 30px;width:100%;max-width:500px} .box span{font-family:sans-serif;font-size:15px} .box span{font-size:15px} h1 {margin: 0}</style><div class='mainContainer-raw'><div class='error'><div class='box'><h1>Error</h1><p id='errorDetails'></p><p id='errorCode'></p></div></div></div>`
      );
      $(`#errorDetails`).html(`The page you are looking for '${pageID}' can not be found.`);
      $(`#errorCode`).html(
        `${error.status}: ${error.statusText}  <br/><br/> <a href="" style="color: inherit;">Return Home</a>`
      );
    })
    .always(function () {
      //Add the active class to anchor tags with the same pageID as an href
      $(`a`).each(function () {
        if ($(this).attr(`href`) == undefined) return;
        let aHref = $(this).attr(`href`).replace(`#`, ``);
        if (aHref == pageID) {
          $(this).addClass(`active`);
        } else {
          $(this).removeClass(`active`);
        }
      });
    });
}

// USER HANDLING =========================================

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user

    uid = user.uid;
    $(".displayName").html(user.displayName);
    $("#displayNameInput").val(user.displayName);
    $("#status").html("signed in");
    $("#nav-accountTab").css("display", "block");
    $("#nav-signInTab").css("display", "none");
  } else {
    $("#status").html("not signed in");
    $("#nav-accountTab").css("display", "none");
    $("#nav-signInTab").css("display", "block");
  }
});

export function signUserUp(displayName, email, password) {
  if (displayName.length > 30) return;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      firestoreDatabase.addUserToCollection(auth.currentUser);
      updateProfile(auth.currentUser, {
        displayName: `${displayName}`,
      })
        .then(() => {
          $(".displayName").html(auth.currentUser.displayName);
          // Profile updated!
          // ...
        })
        .catch((error) => {
          // An error occurred
          // ...
        });
      const user = userCredential.user;
      window.location.hash = "";
    })
    .catch((error) => {
      $("#signUp-statusText").html(error.message);
      console.error("Authentication error:", error.code, error.message);
    });
}

export function signUserIn(siEmail, siPassword) {
  signInWithEmailAndPassword(auth, siEmail, siPassword)
    .then((userCredential) => {
      // Signed in
      window.location.hash = "";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      $("#signIn-statusText").html(errorCode);
    });
}

export async function sendResetPasswordEmail(email) {
  return await sendPasswordResetEmail(getAuth(), email)
    .then(() => {
      // Password reset email sent!
      return "<p>Password reset email sent</p>";
    })
    .catch((error) => {
      return error.message;
    });
}

export async function googlePopup() {
  const provider = new GoogleAuthProvider();
  window.sessionStorage.setItem("pending", 1);
  if (true) {
    signInWithPopup(auth, provider)
      .then((result) => {
        firestoreDatabase.addUserToCollection(result.user);
        window.location.hash = "";
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    signInWithRedirect(auth, provider);
  }
}

export async function reauthenticate(credentials) {
  const auth = getAuth();
  const user = auth.currentUser;
  return await reauthenticateWithCredential(user, credentials)
    .then(() => {
      // User re-authenticated.
      return true;
    })
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function updateUserPassword(newPassword) {
  return await updatePassword(getAuth().currentUser, newPassword)
    .then(() => {
      return "success";
    })
    .catch((error) => {
      return error;
    });
}

export async function updateUserEmail(newEmail) {
  return await updateEmail(getAuth().currentUser, newEmail)
    .then(() => {
      return "success";
    })
    .catch((error) => {
      return error;
    });
}

export function updateUserDisplayName(displayName, responseElement) {
  updateProfile(auth.currentUser, {
    displayName: sanitizeHtmlFunc(displayName),
  })
    .then((data) => {
      $(responseElement).html("Display Name Updated!");
      alertManager.generateModalAlert({
        icon: "check",
        header: `Your display name is now`,
        subHeader: `'${auth.currentUser.displayName}'`,
      });

      $(".displayName").html(auth.currentUser.displayName);
      $("#displayNameInput").val(auth.currentUser.displayName);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode, errorMessage);
      $(responseElement).html(`${errorCode} ${errorMessage}`);
    });
}

export function signUserOut() {
  signOut(auth)
    .then(() => {
      console.log("signout!");
      changeRoute("home");
    })
    .catch((error) => {
      console.log("Error" + error);
    });
}

export function deleteCurrentUser() {
  firestoreDatabase.deleteUserFromCollection(getAuth().currentUser.uid);
  deleteUser(getAuth().currentUser)
    .then(() => {
      // User deleted.
      alertManager.generateModalAlert({ header: "Your account is now deleted." });
      window.location.hash = "";
    })
    .catch((error) => {
      // An error ocurred
      alertManager.generateModalAlert({
        header: `An error occurred while deleting your account.`,
        bodyText: `${error.message}`,
      });
    });
}

// HELPER FUNCTIONS =====================

var sanitizeHtmlParams = { allowedTags: [], allowedAttributes: {} };
export function sanitizeHtmlFunc(input) {
  return sanitizeHtml(input, sanitizeHtmlParams);
}

export function checkRequired(id) {
  let allAreFilled = true;
  let reason = "valid";
  document
    .getElementById(id)
    .querySelectorAll("[required]")
    .forEach(function (i) {
      if (!allAreFilled) return;
      if (i.type === "radio") {
        let radioValueCheck = false;
        document
          .getElementById("myForm")
          .querySelectorAll(`[name=${i.name}]`)
          .forEach(function (r) {
            if (r.checked) radioValueCheck = true;
          });
        allAreFilled = radioValueCheck;
        if (!allAreFilled) reason = "Complete radio selection.";
        return;
      }
      if (i.type === "email" || i.id.toString().includes("email")) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        allAreFilled = emailRegex.test(i.value);
        if (!allAreFilled) reason = "Please enter a valid email.";
      }
      if (!i.value) {
        allAreFilled = false;
        if (!allAreFilled) reason = "Please complete all required boxes.";
        return;
      }
    });
  return [allAreFilled, reason];
}
