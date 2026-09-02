import { CROPS } from "../data/reference-data.js";
import { ENERGY_CARRIERS } from "../data/energy-factors.js";
import { APP_CONFIG } from "../data/config.js";
import { translate } from "./i18n.js";

export function createCropRow(data = {}) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input class="crop-location" value="${escapeHtml(data.location || "")}"></td>
    <td><select class="crop-name">
      <option value="">${translate("choose_crop")}</option>
      ${CROPS.map(crop => `<option ${data.crop === crop ? "selected" : ""}>${crop}</option>`).join("")}
    </select></td>
    <td><input class="crop-area" type="number" min="0" value="${data.area || ""}"><small>m2</small></td>
    <td><div class="period"><input class="crop-start-year" type="number" value="${data.startYear || 2025}"><input class="crop-start-week" type="number" min="1" max="53" value="${data.startWeek || 1}"></div></td>
    <td><div class="period"><input class="crop-end-year" type="number" value="${data.endYear || 2025}"><input class="crop-end-week" type="number" min="1" max="53" value="${data.endWeek || 52}"></div></td>
    <td><input class="crop-production" type="number" min="0" step="0.1" value="${data.production || ""}"><small>kg/m2</small></td>
    <td><button class="button danger delete-row" title="${translate("delete")}">x</button></td>`;
  return row;
}

export function createEnergyRow(data = {}) {
  const selected = data.carrier || "aardgas";
  const defaults = ENERGY_CARRIERS[selected];
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input class="energy-location" value="${escapeHtml(data.location || "")}"></td>
    <td><select class="energy-carrier">${Object.keys(ENERGY_CARRIERS).map(name => `<option ${name === selected ? "selected" : ""}>${name}</option>`).join("")}</select></td>
    <td><input class="energy-quantity" type="number" min="0" value="${data.quantity || ""}"></td>
    <td><input class="energy-unit" value="${data.unit || defaults.unit}"></td>
    <td><input class="energy-factor" type="number" min="0" step="0.000001" value="${data.factor ?? defaults.factor}"></td>
    <td class="energy-emission numeric">0</td>
    <td><button class="button danger delete-row" title="${translate("delete")}">x</button></td>`;
  return row;
}

export function createElectricityRow(data = {}) {
  const renewable = data.renewable === "Ja";
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input class="electricity-supplier" value="${escapeHtml(data.supplier || "")}"></td>
    <td><input class="electricity-quantity" type="number" min="0" value="${data.quantity || ""}"><small>kWh</small></td>
    <td><select class="electricity-renewable"><option ${!renewable ? "selected" : ""}>Nee</option><option ${renewable ? "selected" : ""}>Ja</option></select></td>
    <td><input class="electricity-factor" type="number" min="0" step="0.01" value="${data.factor ?? (renewable ? APP_CONFIG.renewableElectricityFactor : APP_CONFIG.defaultElectricityFactor)}"></td>
    <td class="electricity-emission numeric">0</td>
    <td><button class="button danger delete-row" title="${translate("delete")}">x</button></td>`;
  return row;
}

export function formatNumber(value, decimals = 1) {
  return new Intl.NumberFormat("nl-NL", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}
