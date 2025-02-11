import * as $ from "jquery";
import * as cookieManager from "./cookieManager.min.js";

export var browserTheme = "";

export function checkDarkModePreference() {
  if (cookieManager.checkCookie("themePreference")) {
    switch (cookieManager.getCookie("themePreference")) {
      case "dark":
        setTheme("dark");
        break;
      case "light":
        setTheme("light");
        break;
      default:
        cookieManager.clearCookie("themePreference");
    }
  } else {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }
}

export function setTheme(theme) {
  switch (theme) {
    case "light":
      browserTheme = "light";
      $("#appearanceSelect span").html("Light Mode");
      $("html").addClass("theme-light");
      $("html").removeClass("theme-dark");
      break;
    case "dark":
      browserTheme = "dark";
      $("#appearanceSelect span").html("Dark Mode");
      $("html").removeClass("theme-dark");
      $("html").addClass("theme-dark");
      break;
    default:
      console.log("unkown theme: ", data);
      break;
  }
}
