/**
 * PDF Export functionality for BKG demo
 * 
 * Generates a formatted, printer-friendly HTML representation of the form data
 * and calculation results, then triggers browser print-to-PDF dialog.
 * 
 * No external libraries needed — uses native browser printing.
 */

export function generatePDFReport(data, result, norm) {
  // Build HTML report
  const html = buildReportHTML(data, result, norm);
  
  // Open in new window for printing
  const printWindow = window.open("", "_blank");
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Trigger print dialog after content loads
  printWindow.onload = () => {
    printWindow.print();
  };
}

function buildReportHTML(data, result, norm) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("nl-NL", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });
  
  const complies = result.perM2 <= norm;
  const statusColor = complies ? "#278457" : "#a63333";
  const statusText = complies ? "VOLDOET AAN DE NORM" : "VOLDOET NIET AAN DE NORM";
  
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <title>BKG Rapportage</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.5;
      color: #20303a;
      background: white;
      padding: 40px;
    }
    @media print {
      body { padding: 20px; }
      .page-break { page-break-after: always; }
    }
    
    .header {
      border-bottom: 3px solid #0483a1;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 24px;
      color: #073b5c;
      margin-bottom: 5px;
    }
    .header p {
      color: #657986;
      font-size: 13px;
    }
    
    .meta-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      background: #f2f8fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 30px;
      font-size: 13px;
    }
    .meta-info div {
      display: flex;
      justify-content: space-between;
    }
    .meta-info strong {
      color: #073b5c;
    }
    
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      font-size: 16px;
      color: #073b5c;
      border-bottom: 2px solid #0483a1;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .section h3 {
      font-size: 13px;
      color: #073b5c;
      margin-top: 15px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 13px;
    }
    th {
      background: #073b5c;
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #dce6eb;
    }
    tr:nth-child(even) {
      background: #f9fbfc;
    }
    
    .kpi-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 12px;
      margin: 15px 0;
    }
    .kpi-box {
      background: #f2f8fa;
      border-left: 5px solid #0483a1;
      padding: 12px;
      border-radius: 4px;
      font-size: 13px;
    }
    .kpi-value {
      font-size: 20px;
      font-weight: bold;
      color: #073b5c;
      margin-bottom: 3px;
    }
    .kpi-unit {
      font-size: 11px;
      color: #657986;
    }
    .kpi-label {
      font-size: 12px;
      color: #073b5c;
      margin-top: 5px;
    }
    
    .status-box {
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      font-weight: 600;
      text-align: center;
      font-size: 16px;
    }
    .status-complies {
      background: #e3f6eb;
      color: #17613b;
      border: 2px solid #278457;
    }
    .status-exceeds {
      background: #fde3e3;
      color: #8b2424;
      border: 2px solid #a63333;
    }
    
    .data-row {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 20px;
      margin-bottom: 10px;
      font-size: 13px;
    }
    .data-label {
      font-weight: 600;
      color: #073b5c;
    }
    .data-value {
      color: #20303a;
    }
    
    .disclaimer {
      background: #fff3d6;
      border-left: 4px solid #f39224;
      padding: 10px;
      margin: 20px 0;
      font-size: 12px;
      color: #805a00;
      border-radius: 4px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #cbd9e1;
      font-size: 11px;
      color: #657986;
      text-align: right;
    }
    
    .empty-row {
      color: #657986;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Rekenmodule broeikasgasemissie bedekte teelten</h1>
    <p>Demonstratietool — Rapportage gegenereerd ${dateStr}</p>
  </div>
  
  <div class="section">
    <h2>Bedrijfsgegevens</h2>
    <div class="meta-info">
      <div><strong>Bedrijfsnaam:</strong> <span>${escapeHtml(data.fields.company || "—")}</span></div>
      <div><strong>Adres:</strong> <span>${escapeHtml(data.fields.address || "—")}</span></div>
      <div><strong>Plaats:</strong> <span>${escapeHtml(data.fields.city || "—")}</span></div>
      <div><strong>Land:</strong> <span>${escapeHtml(data.fields.country || "—")}</span></div>
      <div><strong>Rekenjaar:</strong> <span>${data.fields.year || "—"}</span></div>
      <div><strong>Weerstation:</strong> <span>${escapeHtml(data.fields.station || "—")}</span></div>
    </div>
  </div>
  
  <div class="section">
    <h2>Resultaten</h2>
    <div class="kpi-grid">
      <div class="kpi-box">
        <div class="kpi-value">${formatNumber(result.area, 0)}</div>
        <div class="kpi-unit">m²</div>
        <div class="kpi-label">Totaal teeltoppervlak</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-value">${formatNumber(result.total, 0)}</div>
        <div class="kpi-unit">kg CO₂-eq</div>
        <div class="kpi-label">Totale emissie</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-value">${formatNumber(result.perM2, 2)}</div>
        <div class="kpi-unit">kg CO₂-eq/m²</div>
        <div class="kpi-label">Emissie per m²</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-value">${formatNumber(result.ownElectricityUse, 0)}</div>
        <div class="kpi-unit">kWh</div>
        <div class="kpi-label">Eigen elektriciteitsgebruik</div>
      </div>
    </div>
    
    <div class="status-box ${complies ? "status-complies" : "status-exceeds"}">
      ${statusText}
    </div>
    
    <div class="disclaimer">
      <strong>Disclaimer:</strong> Dit is een functionele demonstratie en geen officieel certificeringsinstrument. Voor formele certificering dient u de officiële BKG-rekenmodule te gebruiken.
    </div>
  </div>
  
  <div class="section">
    <h2>Berekeningsdetails</h2>
    <table>
      <tr>
        <th>Onderdeel</th>
        <th style="text-align: right;">Waarde</th>
      </tr>
      <tr>
        <td>Energiestromen (excl. elektra)</td>
        <td style="text-align: right;">${formatNumber(result.energy, 0)} kg CO₂-eq</td>
      </tr>
      <tr>
        <td>Aardgas voor WKK</td>
        <td style="text-align: right;">${formatNumber(result.wkk, 0)} kg CO₂-eq</td>
      </tr>
      <tr>
        <td>Elektra</td>
        <td style="text-align: right;">${formatNumber(result.electricity, 0)} kg CO₂-eq</td>
      </tr>
      <tr style="font-weight: bold; background: #f2f8fa;">
        <td>Totale broeikasgasemissie</td>
        <td style="text-align: right;">${formatNumber(result.total, 0)} kg CO₂-eq</td>
      </tr>
      <tr>
        <td>Demonstratienorm</td>
        <td style="text-align: right;">${formatNumber(norm, 2)} kg CO₂-eq/m²</td>
      </tr>
    </table>
  </div>
  
  ${buildCropsSection(data.crops)}
  ${buildEnergySection(data.energy)}
  ${buildElectricitySection(data.electricity)}
  ${buildWKKSection(data.fields)}
  ${buildOtherDataSection(data.fields)}
  
  <div class="footer">
    <p>BKG Rekenmodule Demonstratietool v2.0 | Gegenereerd: ${dateStr}</p>
  </div>
</body>
</html>
  `;
}

function buildCropsSection(crops) {
  if (!crops || crops.length === 0) {
    return '<div class="section"><h2>Gewassen</h2><p class="empty-row">Geen gewassen ingevoerd</p></div>';
  }
  
  let html = '<div class="section"><h2>Gewassen en teeltperioden</h2><table>';
  html += '<tr><th>Locatie</th><th>Gewas</th><th>Areaal (m²)</th><th>Teeltperiode</th><th>Productie</th></tr>';
  
  for (const crop of crops) {
    const period = crop.startWeek && crop.endWeek 
      ? `Week ${crop.startWeek}–${crop.endWeek}` 
      : '—';
    html += `<tr>
      <td>${escapeHtml(crop.location || "—")}</td>
      <td>${escapeHtml(crop.crop || "—")}</td>
      <td style="text-align: right;">${formatNumber(crop.area, 0)}</td>
      <td>${period}</td>
      <td style="text-align: right;">${crop.production ? formatNumber(crop.production, 2) + " kg/m²" : "—"}</td>
    </tr>`;
  }
  
  html += '</table></div>';
  return html;
}

function buildEnergySection(energy) {
  if (!energy || energy.length === 0) {
    return '<div class="section"><h2>Energiestromen</h2><p class="empty-row">Geen energiegegevens ingevoerd</p></div>';
  }
  
  let html = '<div class="section"><h2>Energiestromen (excl. elektra)</h2><table>';
  html += '<tr><th>Locatie</th><th>Energiebron</th><th>Hoeveelheid</th><th>Emissie</th></tr>';
  
  for (const row of energy) {
    const emission = (parseFloat(row.quantity) || 0) * (parseFloat(row.factor) || 0);
    html += `<tr>
      <td>${escapeHtml(row.location || "—")}</td>
      <td>${escapeHtml(row.carrier || "—")}</td>
      <td style="text-align: right;">${formatNumber(row.quantity, 2)} ${escapeHtml(row.unit || "")}</td>
      <td style="text-align: right;">${formatNumber(emission, 2)} kg CO₂-eq</td>
    </tr>`;
  }
  
  html += '</table></div>';
  return html;
}

function buildElectricitySection(electricity) {
  if (!electricity || electricity.length === 0) {
    return '<div class="section"><h2>Elektra</h2><p class="empty-row">Geen elektriciteitsgegevens ingevoerd</p></div>';
  }
  
  let html = '<div class="section"><h2>Elektra</h2><table>';
  html += '<tr><th>Leverancier</th><th>Hoeveelheid (kWh)</th><th>Type</th><th>Emissie</th></tr>';
  
  for (const row of electricity) {
    const emission = (parseFloat(row.quantity) || 0) * (parseFloat(row.factor) || 0) / 1000;
    const type = row.renewable === "Ja" ? "Duurzaam" : "Regulier";
    html += `<tr>
      <td>${escapeHtml(row.supplier || "—")}</td>
      <td style="text-align: right;">${formatNumber(row.quantity, 0)}</td>
      <td>${type}</td>
      <td style="text-align: right;">${formatNumber(emission, 2)} kg CO₂-eq</td>
    </tr>`;
  }
  
  html += '</table></div>';
  return html;
}

function buildWKKSection(fields) {
  const hasWKK = fields.wkkGas || fields.wkkProduction || fields.thermalEfficiency;
  
  if (!hasWKK) {
    return '';
  }
  
  return `
    <div class="section">
      <h2>WKK-gegevens</h2>
      <div class="data-row">
        <div class="data-label">Aardgas voor WKK:</div>
        <div class="data-value">${fields.wkkGas || "—"} m³</div>
      </div>
      <div class="data-row">
        <div class="data-label">Stroom productie WKK:</div>
        <div class="data-value">${fields.wkkProduction || "—"} kWh</div>
      </div>
      <div class="data-row">
        <div class="data-label">Thermisch rendement:</div>
        <div class="data-value">${fields.thermalEfficiency ? formatNumber(fields.thermalEfficiency, 2) : "—"}</div>
      </div>
    </div>
  `;
}

function buildOtherDataSection(fields) {
  const hasOther = fields.externalCo2 || fields.climateElectricity || fields.heatPump || fields.heatSold;
  
  if (!hasOther) {
    return '';
  }
  
  let html = '<div class="section"><h2>Overige gegevens</h2>';
  
  if (fields.externalCo2) {
    html += `<div class="data-row"><div class="data-label">Externe CO₂-aanvoer:</div><div class="data-value">${fields.externalCo2} ton/jaar</div></div>`;
  }
  if (fields.climateElectricity) {
    html += `<div class="data-row"><div class="data-label">Elektra voor klimaatbeheersing:</div><div class="data-value">${fields.climateElectricity} kWh</div></div>`;
  }
  if (fields.heatPump) {
    html += `<div class="data-row"><div class="data-label">Elektra voor warmtepomp:</div><div class="data-value">${fields.heatPump} kWh</div></div>`;
  }
  if (fields.heatSold) {
    html += `<div class="data-row"><div class="data-label">Warmtelevering aan derden:</div><div class="data-value">${fields.heatSold} GJ</div></div>`;
  }
  
  html += '</div>';
  return html;
}

function formatNumber(value, decimals = 1) {
  const num = parseFloat(value);
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("nl-NL", { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  }).format(num);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
