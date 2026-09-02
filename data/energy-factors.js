/* Emissiecoëfficiënten uit de aangeleverde Excelversie.
   Beheer dit bestand los van calculations.js.

   factor = kg CO2-eq per opgegeven eenheid
   source = herkomst voor beheer en audit
*/
export const ENERGY_CARRIERS = {
  "aardgas":                    { unit: "m3", factor: 2.134, source: "Excel: kengetallen" },
  "groen gas":                  { unit: "m3", factor: 0.723, source: "Excel: kengetallen" },
  "energie/warmte in kWh":      { unit: "kWh", factor: 0.4, source: "Excel: kengetallen" },
  "diesel":                     { unit: "liter", factor: 3.468, source: "Excel: kengetallen" },
  "aardwarmte":                 { unit: "GJ", factor: 8.928909952606636, source: "Excel: kengetallen" },
  "warmte van derden":          { unit: "GJ", factor: 91.3519887660172, source: "Excel: kengetallen" },
  "erkende restwarmte":         { unit: "GJ", factor: 16.122510000000002, source: "Excel: kengetallen" },
  "Hout: shreds":               { unit: "kg vers", factor: 0.054, source: "Excel: kengetallen" },
  "houtchips":                  { unit: "kg vers", factor: 0.062, source: "Excel: kengetallen" },
  "Houtpellets (droge reststroom)":     { unit: "kg vers", factor: 0.035, source: "Excel: kengetallen" },
  "Houtpellets (vers hout)":    { unit: "kg vers", factor: 0.556, source: "Excel: kengetallen" },
  "Hout: blokken":              { unit: "kg vers", factor: 0.077, source: "Excel: kengetallen" },
  "Hout (factuur meldt energie GJ)":    { unit: "GJ", factor: 2.8421052631578947, source: "Excel: kengetallen" },
  "petroleum (liter)":          { unit: "liter", factor: 2.4792, source: "Excel: kengetallen" },
  "biomassa":                   { unit: "kWh", factor: 0.071, source: "Excel: kengetallen" },
  "stookolie":                  { unit: "liter", factor: 3.762, source: "Excel: kengetallen" },
  "steenkool (anthraciet)":     { unit: "kg", factor: 2.88, source: "Excel: kengetallen" },
  "Propaan (l)":                { unit: "liter", factor: 1.7254, source: "Excel: kengetallen" },
  "Waterstof (H2) grijs (kg)":  { unit: "kg", factor: 12.516, source: "Excel: kengetallen" },
  "Waterstof (H2) groen (m3)":  { unit: "m3", factor: 0.097956, source: "Excel: kengetallen" }
};
