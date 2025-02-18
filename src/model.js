import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  reload,
  reauthenticateWithCredential,
  deleteUser,
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

var sanitizeHtmlParams = { allowedTags: [], allowedAttributes: {} };

document.addEventListener("DOMContentLoaded", async function (event) {
  if (window.sessionStorage.getItem("pending")) {
    window.sessionStorage.removeItem("pending");

    getRedirectResult(auth)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;

        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
        window.location.hash = "";
      })
      .catch((error) => {
        alert(error);
        console.log(error);
      });
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    // console.log(user);

    uid = user.uid;
    $(".displayName").html(getUserDisplayName());
    $("#displayNameInput").val(getUserDisplayName());
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
  // console.log(`${firstName}, ${lastName}, ${email}, ${password}`);
  if (displayName.length > 30) return;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      firestoreDatabase.addUserToCollection(auth.currentUser.uid, displayName, email);
      updateProfile(auth.currentUser, {
        displayName: `${displayName}`,
      })
        .then(() => {
          $(".displayName").html(getUserDisplayName());
          // Profile updated!
          // ...
        })
        .catch((error) => {
          // An error occurred
          // ...
        });
      const user = userCredential.user;
      console.log(user, "userCreated");
      window.location.hash = "";
    })
    .catch((error) => {
      console.log(error);
      $("#signUp-statusText").html(error.message);
      console.error("Authentication error:", error.code, error.message);
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

export function updateUserDisplayName(displayName, responseElement) {
  updateProfile(auth.currentUser, {
    displayName: sanitizeHtmlFunc(displayName),
  })
    .then((data) => {
      console.log("Updated user successfully:", auth.currentUser.displayName);
      $(responseElement).html("Display Name Updated!");
      alertManager.generateModalAlert({
        icon: "check",
        header: `Your display name is now`,
        subHeader: `'${auth.currentUser.displayName}'`,
      });

      $(".displayName").html(auth.currentUser.displayName);
      $("#displayNameInput").val(auth.currentUser.displayName);
    })
    .then(() => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        reload(user).then(() => {
          console.log("User information reloaded:", auth.currentUser);
        });
        // User information has been reloaded successfully
      } catch (error) {
        // Handle errors, such as network issues or user not found
        console.error("Error reloading user information:", error);
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode, errorMessage);
      $(responseElement).html(`${errorCode} ${errorMessage}`);
    });
}

export function signUserIn(siEmail, siPassword) {
  signInWithEmailAndPassword(auth, siEmail, siPassword)
    .then((userCredential) => {
      // Signed in
      // console.log(userCredential);
      window.location.hash = "";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      $("#signIn-statusText").html(errorCode);
    });
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
        console.log(i);

        allAreFilled = false;
        if (!allAreFilled) reason = "Please complete all required boxes.";
        return;
      }
    });
  return [allAreFilled, reason];
}

export function getUserAuth() {
  const auth = getAuth();
  return auth;
}

export function getCurrentUser() {
  const auth = getAuth();
  const user = auth.currentUser;
  // if (user !== null) {
  //   // The user object has basic properties such as display name, email, etc.
  //   const displayName = user.displayName;
  //   const email = user.email;
  //   const photoURL = user.photoURL;
  //   const emailVerified = user.emailVerified;

  //   // The user's ID, unique to the Firebase project. Do NOT use
  //   // this value to authenticate with your backend server, if
  //   // you have one. Use User.getToken() instead.
  //   const uid = user.uid;
  // }
  return user;
}

export function getUserDisplayName() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user !== null) {
    // The user object has basic properties such as display name, email, etc.
    const displayName = user.displayName;
    const email = user.email;
    const photoURL = user.photoURL;
    const emailVerified = user.emailVerified;

    return displayName;
  }
  return "anonymous";
}

export function changeRoute(e) {
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

export async function googlePopup() {
  const provider = new GoogleAuthProvider();
  window.sessionStorage.setItem("pending", 1);
  if (true) {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
        window.location.hash = "";
      })
      .catch((error) => {
        alert(error);
      });
  } else {
    signInWithRedirect(auth, provider);
  }
}

export function deleteCurrentUser() {
  const user = auth.currentUser;
  console.log(user.providerId);

  deleteUser(user)
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

// export function reauthenticate(credentials) {
//   const auth = getAuth();
//   const user = auth.currentUser;
//   reauthenticateWithCredential(user, credentials)
//     .then(() => {
//       // User re-authenticated.
//     })
//     .catch((error) => {
//       // An error ocurred
//       // ...
//     });
// }

export function sanitizeHtmlFunc(input) {
  return sanitizeHtml(input, sanitizeHtmlParams);
}
