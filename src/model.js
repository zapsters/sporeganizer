import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from "firebase/auth";

import { initListenersByPage } from "./index.js";

import * as $ from "jquery";
import { app, db, provider } from "./firebaseConfig";
let uid = "";
const auth = getAuth(app);
const currentHost = window.location.host;

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user

    uid = user.uid;
    $(".displayName").html(getUserDisplayName());
    $("#status").html("signed in");
    $("#nav-accountTab").css("display", "block");
    $("#nav-signInTab").css("display", "none");
    $("#displayNameInput").val(getUserDisplayName());
  } else {
    $("#status").html("not signed in");
    $("#nav-accountTab").css("display", "none");
    $("#nav-signInTab").css("display", "block");
  }
});

export function signUserUp(displayName, email, password) {
  // console.log(`${firstName}, ${lastName}, ${email}, ${password}`);
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
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

export function signUserIn(siEmail, siPassword) {
  signInWithEmailAndPassword(auth, siEmail, siPassword)
    .then((userCredential) => {
      // Signed in
      return userCredential.user.getIdToken(); // 🔥 Get the ID token
    })
    .then((idToken) => {
      // 🔥 Send the token to your backend for verification

      return fetch(`http://${currentHost}/auth/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
    })
    .then((res) => res.json())
    .then((data) => {
      console.log("Authenticated successfully:", data);
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

export function googlePopup() {
  const provider = new GoogleAuthProvider();
  signInWithRedirect(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // IdP data available using getAdditionalUserInfo(result)
      console.log(user);
      console.log(result);
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
}
