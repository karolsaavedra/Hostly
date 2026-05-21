// ─────────────────────────────────────────────────────────
//  src/utils/exportCsv.js
//  Exportador CSV reutilizable para Hostly
//  Separador: ; (punto y coma) — compatible con Excel Colombia
//  BOM UTF-8 incluido para tildes y ñ
// ─────────────────────────────────────────────────────────

/**
 * Escapa un valor para CSV: envuelve en comillas dobles y
 * duplica las comillas dobles internas.
 */
const escapar = (val) => {
  if (val == null || val === undefined) return '""';
  const s = String(val).replace(/"/g, '""');
  return `"${s}"`;
};

/**
 * Exporta un array de objetos a un archivo CSV.
 *
 * @param {object} opciones
 * @param {string}   opciones.filename   - Nombre del archivo (ej. "ingresos.csv")
 * @param {Array}    opciones.columns    - [{ label, key, transform? }]
 * @param {Array}    opciones.rows       - Array de objetos con los datos
 * @returns {boolean} true si se exportó, false si no había datos
 */
export const exportCsv = ({ filename, columns, rows }) => {
  if (!rows || rows.length === 0) return false;

  const cabecera = columns.map((c) => escapar(c.label)).join(";");

  const cuerpo = rows.map((row) =>
    columns
      .map((col) => {
        const valor = col.transform
          ? col.transform(row[col.key], row)
          : row[col.key];
        return escapar(valor);
      })
      .join(";")
  );

  const csv = [cabecera, ...cuerpo].join("\r\n");

  // BOM UTF-8 para que Excel en Colombia abra correctamente
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href     = url;
  a.download = filename || "exportacion.csv";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return true;
};
