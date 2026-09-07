import { APP_CONFIG } from "../data/config.js";
import { COUNTRIES, WEATHER_STATIONS } from "../data/reference-data.js";
import { ENERGY_CARRIERS } from "../data/energy-factors.js";
import { initializeLanguageSelector, applyTranslations, translate, getLanguage, setLanguage } from "./i18n.js";
import { calculateResult, energyEmission, electricityEmission, numberValue } from "./calculations.js";
import { validate } from "./validation.js";
import { createCropRow, createEnergyRow, createElectricityRow, formatNumber } from "./ui.js";
import { saveToBrowser, loadFromBrowser, clearBrowserStorage } from "./storage.js";
import { generatePDFReport } from "./pdf-export.js";



let currentStep = 0;
const stepKeys = ["step_general", "step_crops", "step_energy", "step_electricity", "step_other", "step_result"];

function initialize() {
  initializeLanguageSelector(renderNavigation);
  populateCountries();
  updateWeatherStations();
  addCropRow({ location: "Locatie 1" });
  addEnergyRow();
  addElectricityRow();
  bindEvents();
  renderNavigation();
  applyTranslations();
  showStep(0);
  calculateAndRender();
}

function bindEvents() {
  document.querySelector("#country").addEventListener("change", updateWeatherStations);
  document.querySelector("#add-crop").addEventListener("click", () => addCropRow());
  document.querySelector("#add-energy").addEventListener("click", () => addEnergyRow());
  document.querySelector("#add-electricity").addEventListener("click", () => addElectricityRow());
  document.querySelector("#calculate").addEventListener("click", () => { calculateAndRender(); showStep(5); });
  document.querySelector("#print").addEventListener("click", () => window.print());
  document.querySelector("#save").addEventListener("click", saveCurrentData);
  document.querySelector("#load").addEventListener("click", loadCurrentData);
  document.querySelector("#export-pdf").addEventListener("click", exportPDFReport);
  document.querySelector("#reset").addEventListener("click", resetApplication);

  document.addEventListener("click", event => {
    if (event.target.matches("[data-next]")) showStep(Number(event.target.dataset.next));
    if (event.target.matches("[data-previous]")) showStep(Number(event.target.dataset.previous));
    if (event.target.matches(".delete-row")) {
      event.target.closest("tr").remove();
      calculateAndRender();
    }
  });

  document.addEventListener("change", event => {
    if (event.target.matches(".energy-carrier")) updateEnergyDefaults(event.target.closest("tr"));
    if (event.target.matches(".electricity-renewable")) updateElectricityFactor(event.target.closest("tr"));
    calculateAndRender();
  });
  document.addEventListener("input", calculateAndRender);
}

function renderNavigation() {
  const navigation = document.querySelector("#step-navigation");
  navigation.innerHTML = stepKeys.map((key, index) =>
    `<button data-step-button="${index}" class="${index === currentStep ? "active" : ""}">${index + 1}. ${translate(key)}</button>`
  ).join("");
  navigation.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => showStep(Number(button.dataset.stepButton)));
  });
}

function showStep(step) {
  currentStep = step;
  document.querySelectorAll(".step").forEach(section => {
    section.classList.toggle("active", Number(section.dataset.step) === step);
  });
  renderNavigation();
  if (step === 5) calculateAndRender();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function populateCountries() {
  document.querySelector("#country").innerHTML = COUNTRIES.map(country => `<option>${country}</option>`).join("");
}

function updateWeatherStations() {
  const country = document.querySelector("#country").value;
  const stations = WEATHER_STATIONS[country] || [];
  document.querySelector("#station").innerHTML = stations.map(station => `<option>${station}</option>`).join("");
}

function addCropRow(data) { document.querySelector("#crop-rows").appendChild(createCropRow(data)); }
function addEnergyRow(data) { document.querySelector("#energy-rows").appendChild(createEnergyRow(data)); }
function addElectricityRow(data) { document.querySelector("#electricity-rows").appendChild(createElectricityRow(data)); }

function updateEnergyDefaults(row) {
  const carrier = row.querySelector(".energy-carrier").value;
  const data = ENERGY_CARRIERS[carrier];
  row.querySelector(".energy-unit").value = data.unit;
  row.querySelector(".energy-factor").value = data.factor;
}

function updateElectricityFactor(row) {
  const renewable = row.querySelector(".electricity-renewable").value === "Ja";
  row.querySelector(".electricity-factor").value = renewable ? APP_CONFIG.renewableElectricityFactor : APP_CONFIG.defaultElectricityFactor;
}

function collectData() {
  return {
    metadata: { version: APP_CONFIG.version, language: getLanguage(), savedAt: new Date().toISOString() },
    fields: {
      company: value("company"), address: value("address"), city: value("city"), country: value("country"), year: value("year"), station: value("station"),
      wkkGas: value("wkk-gas"), wkkProduction: value("wkk-production"), thermalEfficiency: value("thermal-efficiency"),
      ownGreen: value("own-green"), soldGreen: value("sold-green"), soldWkk: value("sold-wkk"),
      externalCo2: value("external-co2"), climateElectricity: value("climate-electricity"), heatPump: value("heat-pump"), cop: value("cop"), heatSold: value("heat-sold"), norm: value("norm")
    },
    crops: rows("#crop-rows tr", row => ({
      location: rowValue(row, ".crop-location"), crop: rowValue(row, ".crop-name"), area: rowValue(row, ".crop-area"),
      startYear: rowValue(row, ".crop-start-year"), startWeek: rowValue(row, ".crop-start-week"), endYear: rowValue(row, ".crop-end-year"), endWeek: rowValue(row, ".crop-end-week"), production: rowValue(row, ".crop-production")
    })),
    energy: rows("#energy-rows tr", row => ({
      location: rowValue(row, ".energy-location"), carrier: rowValue(row, ".energy-carrier"), quantity: rowValue(row, ".energy-quantity"), unit: rowValue(row, ".energy-unit"), factor: rowValue(row, ".energy-factor")
    })),
    electricity: rows("#electricity-rows tr", row => ({
      supplier: rowValue(row, ".electricity-supplier"), quantity: rowValue(row, ".electricity-quantity"), renewable: rowValue(row, ".electricity-renewable"), factor: rowValue(row, ".electricity-factor")
    }))
  };
}

function calculateAndRender() {
  const data = collectData();
  document.querySelectorAll("#energy-rows tr").forEach(row => {
    row.querySelector(".energy-emission").textContent = formatNumber(energyEmission(rowValue(row, ".energy-quantity"), rowValue(row, ".energy-factor")));
  });
  document.querySelectorAll("#electricity-rows tr").forEach(row => {
    row.querySelector(".electricity-emission").textContent = formatNumber(electricityEmission(rowValue(row, ".electricity-quantity"), rowValue(row, ".electricity-factor")));
  });

  const result = calculateResult(data);
  const messages = validate(data);
  renderMessages(messages);
  renderResult(result, numberValue(data.fields.norm), messages.some(message => message.type === "error"));
}

function renderMessages(messages) {
  if (messages.length === 0) messages = [{ type: "success", text: "no_errors" }];
  document.querySelector("#validation").innerHTML = `<ul class="message-list">${messages.map(message => {
    const text = message.text.includes("_") ? translate(message.text) : message.text.replace(/([0-9]+\. )([a-z_]+)/, (_, prefix, key) => prefix + translate(key));
    return `<li class="message-${message.type}">${text}</li>`;
  }).join("")}</ul>`;
}

function renderResult(result, norm, hasErrors) {
  document.querySelector("#result-kpis").innerHTML = `
    ${kpi(result.area, "m2", "total_area", 0)}
    ${kpi(result.total, "kg CO2-eq", "total_emission", 0)}
    ${kpi(result.perM2, "kg CO2-eq/m2", "emission_per_m2", 2)}
    ${kpi(result.ownElectricityUse, "kWh", "own_electricity_use", 0)}`;

  const complies = result.perM2 <= norm;
  const statusClass = hasErrors ? "warning" : (complies ? "success" : "danger");
  const statusText = hasErrors ? translate("incomplete") : translate(complies ? "complies" : "does_not_comply");
  document.querySelector("#conclusion").innerHTML = `<div class="status ${statusClass}">${statusText}</div>`;

  document.querySelector("#result-breakdown").innerHTML = `
    ${resultRow("Invoer energiestromen excl. elektra", result.energy, "kg CO2-eq")}
    ${resultRow("aardgas voor WKK", result.wkk, "kg CO2-eq")}
    ${resultRow("Invoer elektra", result.electricity, "kg CO2-eq")}
    ${resultRow("totale broeikasgasemissie", result.total, "kg CO2-eq")}
    ${resultRow("Demonstratienorm", norm, "kg CO2-eq/m2")}`;
}

function kpi(value, unit, labelKey, decimals) {
  return `<div class="kpi"><strong>${formatNumber(value, decimals)}</strong>${unit}<div>${translate(labelKey)}</div></div>`;
}
function resultRow(label, value, unit) { return `<tr><td>${label}</td><td class="numeric">${formatNumber(value)} ${unit}</td></tr>`; }
function value(id) { return document.querySelector(`#${id}`)?.value || ""; }
function rowValue(row, selector) { return row.querySelector(selector)?.value || ""; }
function rows(selector, mapper) { return [...document.querySelectorAll(selector)].map(mapper); }

function saveCurrentData() {
  saveToBrowser(collectData());
  setStatus(translate("saved"));
}
function loadCurrentData() {
  const data = loadFromBrowser();
  if (!data) return setStatus("Geen lokaal dossier gevonden.");
  applyData(data);
  setStatus(translate("loaded"));
}
function applyData(data) {
  setLanguage(data.metadata?.language || APP_CONFIG.defaultLanguage);
  Object.entries(data.fields || {}).forEach(([key, fieldValue]) => {
    const id = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    const element = document.querySelector(`#${id}`);
    if (element) element.value = fieldValue;
  });
  updateWeatherStations();
  replaceRows("#crop-rows", data.crops, addCropRow);
  replaceRows("#energy-rows", data.energy, addEnergyRow);
  replaceRows("#electricity-rows", data.electricity, addElectricityRow);
  calculateAndRender();
}
function replaceRows(selector, data, addFunction) {
  document.querySelector(selector).innerHTML = "";
  (data || []).forEach(addFunction);
}
function resetApplication() {
  if (!window.confirm("Alle ingevoerde gegevens wissen?")) return;
  clearBrowserStorage();
  window.location.reload();
}
function setStatus(message) { document.querySelector("#status-message").textContent = message; }

function exportPDFReport() {
  const data = collectData();
  const result = calculateResult(data);
  const norm = numberValue(data.fields.norm);
  generatePDFReport(data, result, norm);
}

initialize();
