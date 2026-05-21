// ─────────────────────────────────────────────────────────
//  src/utils/dateMoney.js
//  Utilidades de fecha y moneda para Hostly
// ─────────────────────────────────────────────────────────

/** Convierte cualquier valor a Date de forma segura. */
export const toDateSafe = (valor) => {
  if (!valor) return null;
  if (valor?.toDate)                          return valor.toDate(); // Firestore Timestamp
  if (valor instanceof Date)                  return isNaN(valor.getTime()) ? null : valor;
  if (typeof valor === "string" || typeof valor === "number") {
    const d = new Date(valor);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

/** True si el valor cae en el mismo día que `date` (default: hoy). */
export const isSameDay = (valor, date = new Date()) => {
  const d = toDateSafe(valor);
  if (!d) return false;
  return d.toDateString() === date.toDateString();
};

/** True si el valor cae en el mismo mes/año que `date` (default: hoy). */
export const isSameMonth = (valor, date = new Date()) => {
  const d = toDateSafe(valor);
  if (!d) return false;
  return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
};

/**
 * True si el valor está dentro del rango [start, end].
 * start y end son strings "YYYY-MM-DD" o Date (pueden ser null para sin límite).
 */
export const inDateRange = (valor, start, end) => {
  const d = toDateSafe(valor);
  if (!d) return false;
  if (start) {
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    if (d < s) return false;
  }
  if (end) {
    const e = new Date(end);
    e.setHours(23, 59, 59, 999);
    if (d > e) return false;
  }
  return true;
};

/** Formatea un número como moneda COP. */
export const formatCOP = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor || 0);

/** Suma el campo `key` de un array de objetos (convierte a Number). */
export const sumBy = (array, key) =>
  (array || []).reduce((acc, item) => acc + (Number(item[key]) || 0), 0);

/** Promedio del campo `key` de un array. Devuelve 0 si vacío. */
export const avgBy = (array, key) => {
  if (!array?.length) return 0;
  return sumBy(array, key) / array.length;
};

/** Formatea un Timestamp de Firestore a fecha local legible. */
export const fmtFechaTS = (ts, opts = {}) => {
  const d = toDateSafe(ts);
  if (!d) return "—";
  return d.toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    ...opts,
  });
};

/** Devuelve "YYYY-MM" del mes actual, útil para prefijos. */
export const currentYYYYMM = () => {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
};
