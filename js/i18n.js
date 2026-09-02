import {
  APP_CONFIG,
  LANGUAGES
} from "../data/config.js";

import {
  TRANSLATIONS as UI_TRANSLATIONS
} from "../data/translations.js";

import {
  TRANSLATIONS as EXCEL_TRANSLATIONS
} from "./translations.js";


/*
 * De actieve taal.
 *
 * In config.js worden mogelijk hoofdletters gebruikt:
 * NL, EN, DE, ES en FR.
 *
 * In de nieuwe Excelvertalingen worden kleine letters gebruikt:
 * nl, en, de, es en fr.
 *
 * Daarom bewaren we de taal intern altijd met kleine letters.
 */
let activeLanguage = normalizeLanguage(
  APP_CONFIG.defaultLanguage
);


/**
 * Zet een taalcode om naar kleine letters.
 *
 * Voorbeelden:
 * NL wordt nl
 * EN wordt en
 * fr blijft fr
 */
function normalizeLanguage(language) {
  return String(language || "nl").toLowerCase();
}


/**
 * Zoek een taalobject in een vertaalbestand.
 *
 * Deze functie ondersteunt zowel:
 *
 * TRANSLATIONS.NL
 *
 * als:
 *
 * TRANSLATIONS.nl
 */
function getLanguageTranslations(
  translations,
  language
) {
  const lowerCaseLanguage =
    normalizeLanguage(language);

  const upperCaseLanguage =
    lowerCaseLanguage.toUpperCase();

  return (
    translations[lowerCaseLanguage]
    || translations[upperCaseLanguage]
    || {}
  );
}


/**
 * Maakt het taalkeuzemenu bovenaan de pagina.
 *
 * De talen komen uit data/config.js.
 */
export function initializeLanguageSelector(
  onChange
) {
  const selector =
    document.querySelector("#language");

  if (!selector) {
    console.warn(
      "Taalkeuzemenu met id 'language' niet gevonden."
    );

    return;
  }

  selector.innerHTML = LANGUAGES
    .map((language) => {
      const languageCode =
        normalizeLanguage(language.code);

      return `
        <option value="${languageCode}">
          ${language.label}
        </option>
      `;
    })
    .join("");

  selector.value = activeLanguage;

  selector.addEventListener(
    "change",
    () => {
      activeLanguage =
        normalizeLanguage(selector.value);

      applyTranslations();

      if (typeof onChange === "function") {
        onChange(activeLanguage);
      }
    }
  );
}


/**
 * Vertaalt één sleutel.
 *
 * De zoekvolgorde is:
 *
 * 1. Interfacevertaling in de gekozen taal
 * 2. Excelvertaling in de gekozen taal
 * 3. Nederlandse interfacevertaling
 * 4. Nederlandse Excelvertaling
 * 5. De sleutel zelf
 *
 * Hierdoor blijven bestaande sleutels zoals app_title werken,
 * terwijl ook Excelcodes zoals code001 beschikbaar zijn.
 */
export function translate(key) {
  const uiCurrent =
    getLanguageTranslations(
      UI_TRANSLATIONS,
      activeLanguage
    );

  const excelCurrent =
    getLanguageTranslations(
      EXCEL_TRANSLATIONS,
      activeLanguage
    );

  const uiDutch =
    getLanguageTranslations(
      UI_TRANSLATIONS,
      "nl"
    );

  const excelDutch =
    getLanguageTranslations(
      EXCEL_TRANSLATIONS,
      "nl"
    );

  return (
    uiCurrent[key]
    || excelCurrent[key]
    || uiDutch[key]
    || excelDutch[key]
    || key
  );
}


/**
 * Vertaalt alle HTML-elementen met:
 *
 * data-i18n="vertalingssleutel"
 *
 * Voorbeeld:
 *
 * <h1 data-i18n="app_title"></h1>
 */
export function applyTranslations(
  root = document
) {
  root
    .querySelectorAll("[data-i18n]")
    .forEach((element) => {
      const translationKey =
        element.dataset.i18n;

      element.textContent =
        translate(translationKey);
    });


  /*
   * Ondersteuning voor vertaalde placeholders.
   *
   * Voorbeeld:
   *
   * <input
   *   data-i18n-placeholder="company_name"
   * >
   */
  root
    .querySelectorAll(
      "[data-i18n-placeholder]"
    )
    .forEach((element) => {
      const translationKey =
        element.dataset.i18nPlaceholder;

      element.placeholder =
        translate(translationKey);
    });


  /*
   * Ondersteuning voor vertaalde schermtips.
   *
   * Voorbeeld:
   *
   * <button
   *   data-i18n-title="save"
   * >
   */
  root
    .querySelectorAll(
      "[data-i18n-title]"
    )
    .forEach((element) => {
      const translationKey =
        element.dataset.i18nTitle;

      element.title =
        translate(translationKey);
    });


  /*
   * Vertel de browser welke taal actief is.
   */
  document.documentElement.lang =
    activeLanguage;
}


/**
 * Geeft de momenteel gekozen taal terug.
 *
 * Voorbeeld:
 *
 * const language = getLanguage();
 */
export function getLanguage() {
  return activeLanguage;
}


/**
 * Verandert de taal vanuit JavaScript.
 *
 * Voorbeeld:
 *
 * setLanguage("en");
 */
export function setLanguage(language) {
  const normalizedLanguage =
    normalizeLanguage(language);

  const uiLanguage =
    getLanguageTranslations(
      UI_TRANSLATIONS,
      normalizedLanguage
    );

  const excelLanguage =
    getLanguageTranslations(
      EXCEL_TRANSLATIONS,
      normalizedLanguage
    );

  const languageExists =
    Object.keys(uiLanguage).length > 0
    || Object.keys(excelLanguage).length > 0;

  if (!languageExists) {
    console.warn(
      `Taal '${language}' is niet beschikbaar.`
    );

    return;
  }

  activeLanguage =
    normalizedLanguage;

  const selector =
    document.querySelector("#language");

  if (selector) {
    selector.value =
      normalizedLanguage;
  }

  applyTranslations();
}