import { useState, useEffect } from "react";
import {
  suscribirPagosEmpleados,
  registrarPagoEmpleado,
  actualizarPagoEmpleadoConAuditoria,
} from "../firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast.jsx";
import { toDateSafe, isSameMonth, formatCOP } from "../utils/dateMoney";
import { exportCsv } from "../utils/exportCsv";

// ── Constantes de módulo ──────────────────────────────────
const fmtFecha = (ts) =>
  toDateSafe(ts)?.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) || "—";

const CONCEPTOS = ["Salario mensual", "Quincena", "Bono / incentivo", "Horas extras", "Liquidación", "Anticipo", "Otro"];
const METODOS   = ["Transferencia", "Efectivo", "Nequi / Daviplata", "Cheque"];
const FORM_V    = { nombreEmpleado: "", concepto: "Salario mensual", monto: "", metodo: "Transferencia", observacion: "" };

// ── Función pura de módulo ────────────────────────────────
const bloquearEnter = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    e.stopPropagation();
  }
};

// ── Definido FUERA de PagosEmpleadosPage ──────────────────
function CamposPagoForm({ f, sf }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">Nombre del empleado</label>
        <input
          className="form-input"
          required
          autoComplete="off"
          placeholder="Nombre completo"
          value={f.nombreEmpleado}
          onChange={(e) => sf((prev) => ({ ...prev, nombreEmpleado: e.target.value }))}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Concepto</label>
          <select
            className="form-input form-select"
            value={f.concepto}
            onChange={(e) => sf((prev) => ({ ...prev, concepto: e.target.value }))}
          >
            {CONCEPTOS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Monto (COP)</label>
          <input
            className="form-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ej. 1200000"
            value={f.monto}
            onKeyDown={bloquearEnter}
            onChange={(e) => {
              const limpio = e.target.value.replace(/\D/g, "");
              sf((prev) => ({ ...prev, monto: limpio }));
            }}
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Método de pago</label>
        <select
          className="form-input form-select"
          value={f.metodo}
          onChange={(e) => sf((prev) => ({ ...prev, metodo: e.target.value }))}
        >
          {METODOS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Observaciones (período, etc.)</label>
        <textarea
          className="form-input"
          rows="2"
          placeholder="Ej. Mayo 2025, primera quincena"
          style={{ resize: "none" }}
          value={f.observacion}
          onChange={(e) => sf((prev) => ({ ...prev, observacion: e.target.value }))}
        />
      </div>
    </>
  );
}

// ── Componente principal ──────────────────────────────────
export default function PagosEmpleadosPage() {
  const [pagos, setPagos]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const { usuario }                 = useAuth();
  const { toast, ToastContainer }   = useToast();
  const [form, setForm]             = useState(FORM_V);
  const [formEdit, setFormEdit]     = useState(FORM_V);

  useEffect(() => {
    const unsub = suscribirPagosEmpleados((data) => { setPagos(data); setLoading(false); });
    return () => unsub();
  }, []);

  const totalMes  = pagos.filter((p) => isSameMonth(p.fecha)).reduce((s, p) => s + (Number(p.monto) || 0), 0);
  const totalAcum = pagos.reduce((s, p) => s + (Number(p.monto) || 0), 0);

  const handleCrear = async (ev) => {
    ev.preventDefault();
    if (!form.monto || Number(form.monto) <= 0) { toast("El monto debe ser un número positivo"); return; }
    await registrarPagoEmpleado({ ...form, monto: Number(form.monto), registradoPor: usuario?.email || "sistema" });
    toast(`Pago de ${formatCOP(Number(form.monto))} registrado para ${form.nombreEmpleado} ✓`);
    setModalCrear(false);
    setForm(FORM_V);
  };

  const abrirEditar = (pago) => {
    setFormEdit({
      nombreEmpleado: pago.nombreEmpleado || "",
      concepto:       pago.concepto       || "Salario mensual",
      monto:          String(pago.monto   || ""),
      metodo:         pago.metodo         || "Transferencia",
      observacion:    pago.observacion    || "",
    });
    setModalEditar(pago);
  };

  const handleEditar = async (ev) => {
    ev.preventDefault();
    if (!formEdit.monto || Number(formEdit.monto) <= 0) { toast("El monto debe ser un número positivo"); return; }
    await actualizarPagoEmpleadoConAuditoria(
      modalEditar.id,
      { ...formEdit, monto: Number(formEdit.monto) },
      { nombreEmpleado: modalEditar.nombreEmpleado, monto: modalEditar.monto, concepto: modalEditar.concepto },
      usuario
    );
    toast("Pago actualizado ✓");
    setModalEditar(null);
  };

  const handleExportarCSV = () => {
    const ok = exportCsv({
      filename: `pagos_empleados_${new Date().toISOString().slice(0, 10)}.csv`,
      columns: [
        { label: "Fecha",          key: "fecha",       transform: (v) => toDateSafe(v)?.toLocaleDateString("es-CO") || "—" },
        { label: "Empleado",       key: "nombreEmpleado" },
        { label: "Concepto",       key: "concepto" },
        { label: "Método de pago", key: "metodo" },
        { label: "Monto COP",      key: "monto" },
        { label: "Observaciones",  key: "observacion" },
        { label: "Registrado por", key: "registradoPor" },
      ],
      rows: pagos,
    });
    if (!ok) toast("No hay pagos para exportar");
  };

  return (
    <>
      <ToastContainer />

      {modalCrear && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalCrear(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Registrar Pago a Empleado</div>
              <button type="button" className="modal-close" onClick={() => setModalCrear(false)}>✕</button>
            </div>
            <form
              onSubmit={handleCrear}
              onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
            >
              <div className="modal-body">
                <CamposPagoForm f={form} sf={setForm} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setModalCrear(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold btn-sm">Registrar pago</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalEditar && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalEditar(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Editar Pago</div>
              <button type="button" className="modal-close" onClick={() => setModalEditar(null)}>✕</button>
            </div>
            <form
              onSubmit={handleEditar}
              onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
            >
              <div className="modal-body">
                <CamposPagoForm f={formEdit} sf={setFormEdit} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setModalEditar(null)}>Cancelar</button>
                <button type="submit" className="btn btn-gold btn-sm">Guardar cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-lbl">Pagos del mes</div>
          <div className="stat-val" style={{ color: "var(--blue)" }}>{formatCOP(totalMes)}</div>
          <div className="stat-sub">{pagos.filter((p) => isSameMonth(p.fecha)).length} registros</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Total acumulado</div>
          <div className="stat-val">{formatCOP(totalAcum)}</div>
          <div className="stat-sub">{pagos.length} registros</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Empleados pagados (mes)</div>
          <div className="stat-val">
            {new Set(pagos.filter((p) => isSameMonth(p.fecha)).map((p) => p.nombreEmpleado)).size}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Pagos a empleados</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={handleExportarCSV}>↓ CSV</button>
            <button className="btn btn-gold btn-sm" onClick={() => setModalCrear(true)}>+ Registrar pago</button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>Cargando pagos...</div>
        ) : pagos.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>👥</div>
            No hay pagos registrados.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Fecha</th><th>Empleado</th><th>Concepto</th><th>Método</th><th>Monto</th><th></th></tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>{fmtFecha(p.fecha)}</td>
                  <td style={{ fontWeight: 500 }}>{p.nombreEmpleado}</td>
                  <td>
                    <div>{p.concepto}</div>
                    {p.observacion && <div style={{ fontSize: 10, color: "var(--muted)" }}>{p.observacion}</div>}
                    {p.actualizadoEn && <div style={{ fontSize: 9, color: "var(--muted)" }}>✏ editado</div>}
                  </td>
                  <td><span className="badge b-gray">{p.metodo}</span></td>
                  <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "var(--blue)", fontSize: 14 }}>{formatCOP(p.monto)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(p)}>Editar</button>
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
