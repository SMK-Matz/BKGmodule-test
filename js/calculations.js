import { ENERGY_CARRIERS } from "../data/energy-factors.js";

export function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

export function energyEmission(quantity, factor) {
  return numberValue(quantity) * numberValue(factor);
}

export function electricityEmission(kWh, gramsPerKWh) {
  return numberValue(kWh) * numberValue(gramsPerKWh) / 1000;
}

export function uniqueCultivationArea(crops) {
  // Demo-aanname: per locatie telt het grootste ingevoerde areaal één keer.
  // Vervang dit later door formele allocatielogica uit de rekenspecificatie.
  const areaPerLocation = {};
  for (const crop of crops) {
    const location = crop.location || "_zonder_locatie";
    areaPerLocation[location] = Math.max(
      areaPerLocation[location] || 0,
      numberValue(crop.area)
    );
  }
  return Object.values(areaPerLocation).reduce((sum, area) => sum + area, 0);
}

export function electricityBalance(input) {
  return input.purchased
    + input.ownRenewableProduction
    + input.wkkProduction
    - input.renewableExport
    - input.nonRenewableExport;
}

export function calculateResult(data) {
  const energy = data.energy.reduce((sum, row) =>
    sum + energyEmission(row.quantity, row.factor), 0);

  const electricity = data.electricity.reduce((sum, row) =>
    sum + electricityEmission(row.quantity, row.factor), 0);

  const wkkGas = numberValue(data.fields.wkkGas);
  const wkk = wkkGas * ENERGY_CARRIERS.aardgas.factor;
  const area = uniqueCultivationArea(data.crops);
  const total = energy + electricity + wkk;
  const perM2 = area > 0 ? total / area : 0;

  const ownElectricityUse = electricityBalance({
    purchased: data.electricity.reduce((sum, row) => sum + numberValue(row.quantity), 0),
    ownRenewableProduction: numberValue(data.fields.ownGreen),
    wkkProduction: numberValue(data.fields.wkkProduction),
    renewableExport: numberValue(data.fields.soldGreen),
    nonRenewableExport: numberValue(data.fields.soldWkk)
  });

  return { energy, electricity, wkk, total, area, perM2, ownElectricityUse };
}
