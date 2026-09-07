import { electricityBalance, numberValue } from "./calculations.js";

export function validate(data) {
  const messages = [];
  const error = text => messages.push({ type: "error", text });
  const warning = text => messages.push({ type: "warning", text });

  if (!data.fields.company.trim()) error("missing_company");
  if (!data.fields.city.trim()) error("missing_city");

  data.crops.forEach((crop, index) => {
    const prefix = `${index + 1}. `;
    if (!crop.crop) error(prefix + "missing_crop");
    if (numberValue(crop.area) === 0) error(prefix + "missing_area");
    if (numberValue(crop.startWeek) > numberValue(crop.endWeek)) {
      error(prefix + "invalid_period");
    }
  });

  const balance = electricityBalance({
    purchased: data.electricity.reduce((sum, row) => sum + numberValue(row.quantity), 0),
    ownRenewableProduction: numberValue(data.fields.ownGreen),
    wkkProduction: numberValue(data.fields.wkkProduction),
    renewableExport: numberValue(data.fields.soldGreen),
    nonRenewableExport: numberValue(data.fields.soldWkk)
  });

  if (balance < 0) error("electricity_negative");
  if (numberValue(data.fields.wkkGas) > 0 && numberValue(data.fields.wkkProduction) === 0) {
    warning("WKK: Stroom productie WKK(s) ontbreekt.");
  }
  if (numberValue(data.fields.heatPump) > numberValue(data.fields.climateElectricity)) {
    warning("Waarvan voor warmtepomp(en) is groter dan Gebruik elektra voor klimaatbeheersing.");
  }

  return messages;
}
