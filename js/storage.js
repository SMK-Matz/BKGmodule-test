import { APP_CONFIG } from "../data/config.js";

export function saveToBrowser(data) {
  localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(data));
}

export function loadFromBrowser() {
  const value = localStorage.getItem(APP_CONFIG.storageKey);
  return value ? JSON.parse(value) : null;
}

export function clearBrowserStorage() {
  localStorage.removeItem(APP_CONFIG.storageKey);
}

export function exportJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bkg-demo-dossier.json";
  link.click();
  URL.revokeObjectURL(url);
}

export function importJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try { resolve(JSON.parse(reader.result)); }
      catch (error) { reject(error); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
