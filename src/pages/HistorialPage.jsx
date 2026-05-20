import { useState, useEffect, useMemo } from "react";
import { suscribirHistorial } from "../firebase/firestore";

const fmtMoney = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(n || 0);

const fmtFecha = (ts) =>
  ts?.toDate?.()?.toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  }) || "—";

export default function HistorialPage() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading]     = useState(true);

  // Filtros
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtroHab,        setFiltroHab]        = useState("");
  const [filtroHuesped,    setFiltroHuesped]    = useState("");
  const [filtroMetodo,     setFiltroMetodo]     = useState("");
  const [filtroUsuario,    setFiltroUsuario]    = useState("");

  useEffect(() => {
    const unsub = suscribirHistorial((data) => {
      setHistorial(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtrado = useMemo(() => {
    return historial.filter((e) => {
      if (filtroHab && !e.habitacion?.toLowerCase().includes(filtroHab.toLowerCase())) return false;
      if (filtroHuesped && !e.nombre?.toLowerCase().includes(filtroHuesped.toLowerCase())) return false;
      if (filtroMetodo && e.metodoPago !== filtroMetodo) return false;
      if (filtroUsuario && !e.checkoutPor?.toLowerCase().includes(filtroUsuario.toLowerCase())) return false;
      if (filtroFechaDesde && e.fechaCheckout < filtroFechaDesde) return false;
      if (filtroFechaHasta && e.fechaCheckout > filtroFechaHasta) return false;
      return true;
    });
  }, [historial, filtroHab, filtroHuesped, filtroMetodo, filtroUsuario, filtroFechaDesde, filtroFechaHasta]);

  const totalFiltrado = filtrado.reduce((s, e) => s + (Number(e.valorPagado) || 0), 0);

  const exportarCSV = () => {
    const cabecera = [
      "Huésped", "Documento", "Habitación", "Tipo", "Piso",
      "Check-in", "Check-out", "Noches", "Precio/noche",
      "Total", "Método pago", "Check-in por", "Check-out por",
      "Estado hab.", "Observaciones",
    ].join(",");

    const filas = filtrado.map((e) => [
      `"${e.nombre || ""}"`,
      `"${e.documento || ""}"`,
      `"${e.habitacion || ""}"`,
      `"${e.tipoHabitacion || ""}"`,
      e.piso || "",
      `"${e.fechaCheckin || ""}"`,
      `"${e.fechaCheckout || ""}"`,
      e.noches || 0,
      e.precioNoche || 0,
      e.valorPagado || 0,
      `"${e.metodoPago || ""}"`,
      `"${e.checkinPor || ""}"`,
      `"${e.checkoutPor || ""}"`,
      `"${e.estadoFinalHabitacion || ""}"`,
      `"${(e.observaciones || "").replace(/"/g, "'")}"`,
    ].join(","));

    const csv = [cabecera, ...filas].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `historial_estancias_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const limpiarFiltros = () => {
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
    setFiltroHab("");
    setFiltroHuesped("");
    setFiltroMetodo("");
    setFiltroUsuario("");
  };

  const metodos = [...new Set(historial.map((e) => e.metodoPago).filter(Boolean))];

  return (
    <>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-lbl">Total estancias</div>
          <div className="stat-val">{historial.length}</div>
          <div className="stat-sub">Historial completo</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Estancias filtradas</div>
          <div className="stat-val">{filtrado.length}</div>
          <div className="stat-sub">Con filtros actuales</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Total cobrado (filtrado)</div>
          <div className="stat-val gold">{fmtMoney(totalFiltrado)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Promedio por estancia</div>
          <div className="stat-val">
            {filtrado.length ? fmtMoney(totalFiltrado / filtrado.length) : "—"}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">
          <div className="panel-title">Filtros</div>
          <button className="btn btn-ghost btn-sm" onClick={limpiarFiltros}>Limpiar</button>
        </div>
        <div className="panel-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Checkout desde</label>
              <input
                className="form-input"
                type="date"
                value={filtroFechaDesde}
                onChange={(e) => setFiltroFechaDesde(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Checkout hasta</label>
              <input
                className="form-input"
                type="date"
                value={filtroFechaHasta}
                onChange={(e) => setFiltroFechaHasta(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Método de pago</label>
              <select
                className="form-input form-select"
                value={filtroMetodo}
                onChange={(e) => setFiltroMetodo(e.target.value)}
              >
                <option value="">Todos</option>
                {metodos.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Habitación</label>
              <input
                className="form-input"
                placeholder="Ej. 101"
                value={filtroHab}
                onChange={(e) => setFiltroHab(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Huésped</label>
              <input
                className="form-input"
                placeholder="Nombre del huésped"
                value={filtroHuesped}
                onChange={(e) => setFiltroHuesped(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Usuario que registró</label>
              <input
                className="form-input"
                placeholder="Email del usuario"
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            Historial de estancias ({filtrado.length})
          </div>
          <button className="btn btn-ghost btn-sm" onClick={exportarCSV}>
            ↓ Exportar CSV
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>Cargando historial...</div>
        ) : filtrado.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>📋</div>
            Sin estancias registradas
            {(filtroHab || filtroHuesped || filtroMetodo || filtroUsuario || filtroFechaDesde || filtroFechaHasta)
              ? " con los filtros seleccionados." : "."}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Huésped</th>
                <th>Hab.</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Noches</th>
                <th>Cobrado</th>
                <th>Método</th>
                <th>Estado hab.</th>
                <th>Registró</th>
              </tr>
            </thead>
            <tbody>
              {filtrado.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{e.nombre}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{e.documento}</div>
                  </td>
                  <td>
                    <span className="room-tag">{e.habitacion}</span>
                    {e.tipoHabitacion && <div style={{ fontSize: 10, color: "var(--muted)" }}>{e.tipoHabitacion}</div>}
                  </td>
                  <td style={{ fontSize: 11, color: "var(--muted)" }}>{e.fechaCheckin}</td>
                  <td style={{ fontSize: 11, color: "var(--muted)" }}>{e.fechaCheckout}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>
                    {e.noches != null ? `${e.noches}n` : "—"}
                  </td>
                  <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "var(--gold)", fontSize: 13 }}>
                    {fmtMoney(e.valorPagado)}
                  </td>
                  <td><span className="badge b-gray">{e.metodoPago || "—"}</span></td>
                  <td>
                    {e.estadoFinalHabitacion && (
                      <span className={`badge ${
                        e.estadoFinalHabitacion === "disponible" ? "b-green"
                        : e.estadoFinalHabitacion === "limpieza" ? "b-amber"
                        : "b-red"
                      }`}>
                        {e.estadoFinalHabitacion}
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: 10, color: "var(--muted)" }}>
                    {e.checkoutPor || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
