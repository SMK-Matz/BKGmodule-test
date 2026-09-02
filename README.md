# BKG-rekenmodule bedekte teelten — demonstratieversie

Deze repository bevat een modulaire, offline werking demonstratietool voor de BKG-rekenmodule bedekte teelten. Het is bedoeld voor kennismaking en demonstratie. GLK valt buiten de scope.

**Opmerking:** Dit is een functionele demonstratie en geen officieel certificeringsinstrument. Test berekeningen altijd parallel met de officiële Excel voordat rekenlogica productief wordt gebruikt.

---

## Gebruik via GitHub Pages (aanbevolen)

Deze demo werkt in elke moderne browser, volledig offline. Geen installatie nodig.

1. Open de live versie: [https://yourusername.github.io/bkg-demo/](https://yourusername.github.io/bkg-demo/) (pas dit URL aan naar jouw repository)
2. Of download de repository als ZIP en open `index.html` direct in je browser.

**Ondersteunde talen:** Nederlands (NL), Engels (EN), Duits (DE), Frans (FR), Spaans (ES)  
Taalkeuze werkt direct in de keuzelijst bovenaan het formulier.

---

## Lokale ontwikkeling (zonder Live Server)

1. Clone deze repository of download als ZIP.
2. Open `index.html` rechtstreeks in je browser.
3. De demo werkt volledig offline — geen server nodig.

**Voor Visual Studio Code gebruikers (optioneel):**
- Open de hele projectmap in VS Code.
- Rechtsklik op `index.html` → "Open with Live Server" (als je Live Server extension hebt).
- Browser opent op `http://127.0.0.1:5500`.

---

## Bestandsstructuur

```
bkg-demo/
├── index.html                    # HTML-structuur en formulier
├── css/
│   └── main.css                  # Volledige opmaak en styling
├── data/
│   ├── config.js                 # Taalinstellingen, versie, opslagsleutel
│   ├── energy-factors.js         # Energiedragers en emissiecoëfficiënten
│   ├── reference-data.js         # Gewassen, landen, weerstations
│   └── translations.js           # Alle schermteksten in NL/EN/DE/FR/ES
├── js/
│   ├── app.js                    # Applicatie-initialize en stap-navigatie
│   ├── calculations.js           # Emissieberekeningen
│   ├── i18n.js                   # Meertalige vertalingslogica
│   ├── storage.js                # LocalStorage en JSON import/export
│   ├── ui.js                     # Dynamische tabelrijen en formattering
│   ├── translations.js           # (legacy/verouderd — niet gebruiken)
│   └── validation.js             # Invoervalidatie en foutmeldingen
├── README.md                     # Dit bestand
└── docs/
    └── ONDERHOUD.md              # Onderhoudsafspraken en test-checklist
```

---

## Meertaligheid

Alle schermteksten staan in **`data/translations.js`** met sleutels voor vijf talen:

```javascript
EN: {
  company_name: "Company name",
  step_general: "General input",
  next: "Next",
  // ... meer sleutels
}
```

De talen zijn georganiseerd als:
- **35 sleutels** (Excel-geverifieerd): exact overgenomen uit het originele Excelblad `taal&tekst` (KNMI/ECA&D bron).
- **48 sleutels** (eigen vertaling): demo-specifieke UI-teksten (knoppen, hulpteksten) die niet in de Excel voorkomen.

### Vertalingen bijwerken

1. **Excel-sleutels updaten:** Zoek de Nederlandse tekst in het Excelblad `taal&tekst` en kopieer de exacte vertalingen in `data/translations.js`.
2. **Nieuwe demo-sleutels:** Voeg handmatig toe of zoekvergelijkbare Excel-teksten die je als basis kunt gebruiken.

De applicatie valt automatisch terug op Nederlands als een vertaling ontbreekt.

---

## Factoren en instellingen wijzigen

### Energiedragers en emissiecoëfficiënten

Wijzig alleen in **`data/energy-factors.js`**. De berekeningscode hoeft niet aangepast te worden.

```javascript
"aardgas": {
  unit: "m3",
  factor: 2.134,
  source: "Excel: kengetallen"
}
```

### Algemene configuratie

Wijzig in **`data/config.js`**:

```javascript
export const APP_CONFIG = {
  version: "demo-2.0",
  defaultLanguage: "NL",
  defaultElectricityFactor: 382.47,
  defaultNorm: 20
};
```

---

## Gegevens en beperkingen

### Wat werkt in deze demo

✓ Invoer van bedrijfsgegevens, gewassen, energiedragers, elektriciteit  
✓ Invoervalidatie en foutmeldingen  
✓ Eenvoudige emissieberekeningen (energieverbruik × emissiecoëfficiënt)  
✓ Meertalige interface (NL/EN/DE/FR/ES)  
✓ Lokale opslag en JSON import/export  
✓ Afdrukken naar PDF (via browser-functie)

### Wat nog niet is geïmplementeerd

✗ Volledige normberekening op basis van gewas, teeltperiode en weergegevens (Delta-T, warmtebehoefte per week)  
✗ Automatische WKK-allocatie (80% warmte, 20% boiler) voor warme teelten  
✗ Weerstationgegevens (dagelijkse/wekelijkse temperaturen) — data zit wel in de originele Excel  
✗ Teelttype-specifieke correctiefactoren  

Deze onderdelen vereisen een Python-script om weergegevens uit de Excel naar een statisch JSON-bestand te exporteren. Dit staat op de planning.

---

## Onderhoud en testen

Zie **`docs/ONDERHOUD.md`** voor:
- Onderhoudsafspraken (versiebeheer, bronvermeldingen)
- Jaarlijkse update-checklist
- Minimale testverzameling

---

## Problemen of vragen?

Dit is een demonstratieversie. Voor formele certificering of productiegebruik moet je de officiële BKG-rekenmodule Excel gebruiken.

Voor vragen over:
- **Vertalingen:** Controleer `data/translations.js`
- **Berekeningen:** Zie `js/calculations.js`
- **Validatie:** Zie `js/validation.js`

---

**Versie:** demo-2.0  
**Talen:** NL, EN, DE, FR, ES  
**Laatst bijgewerkt:** 2026-09-02  
**Status:** Functionele demonstratie — niet geschikt voor certificering
