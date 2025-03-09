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
      case "auto":
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
          setTheme("dark", false);
        } else {
          setTheme("light", false);
        }
        break;
      default:
        cookieManager.clearCookie("themePreference");
    }
  } else {
    setTheme("auto");
  }
}

export function setTheme(theme) {
  switch (theme) {
    case "light":
      browserTheme = "light";
      $("html").addClass("theme-light");
      $("html").removeClass("theme-dark");
      break;
    case "dark":
      browserTheme = "dark";
      $("html").removeClass("theme-light");
      $("html").addClass("theme-dark");
      break;
    default:
      browserTheme = "auto";
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        $("html").removeClass("theme-light");
        $("html").addClass("theme-dark");
      } else {
        $("html").addClass("theme-light");
        $("html").removeClass("theme-dark");
      }
      break;
  }
}
