import { useState, useEffect } from "react";
import { suscribirEgresos, registrarEgreso } from "../firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast.jsx";

const fmtMoney = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(n || 0);

const fmtFecha = (ts) =>
  ts?.toDate?.()?.toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  }) || "—";

const isSameDay = (ts) => {
  if (!ts?.toDate) return false;
  return ts.toDate().toDateString() === new Date().toDateString();
};

const isSameMonth = (ts) => {
  if (!ts?.toDate) return false;
  const d = ts.toDate();
  const n = new Date();
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
};

const CATEGORIAS = [
  "Servicios públicos",
  "Mantenimiento",
  "Suministros / limpieza",
  "Alimentación / cocina",
  "Tecnología",
  "Marketing",
  "Alquiler / arrendamiento",
  "Transporte",
  "Otros",
];

export default function EgresosPage() {
  const [egresos, setEgresos]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const { usuario }             = useAuth();
  const { toast, ToastContainer } = useToast();

  const [form, setForm] = useState({
    concepto:    "",
    categoria:   "Otros",
    monto:       "",
    metodo:      "Efectivo",
    observacion: "",
  });

  useEffect(() => {
    const unsub = suscribirEgresos((data) => {
      setEgresos(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const totalHoy  = egresos.filter((e) => isSameDay(e.fecha)).reduce((s, e) => s + (Number(e.monto) || 0), 0);
  const totalMes  = egresos.filter((e) => isSameMonth(e.fecha)).reduce((s, e) => s + (Number(e.monto) || 0), 0);
  const totalAcum = egresos.reduce((s, e) => s + (Number(e.monto) || 0), 0);

  const handleCrear = async (ev) => {
    ev.preventDefault();
    try {
      await registrarEgreso({
        ...form,
        monto:         Number(form.monto),
        registradoPor: usuario?.email || "sistema",
      });
      toast(`Egreso de ${fmtMoney(Number(form.monto))} registrado ✓`);
      setModal(false);
      setForm({ concepto: "", categoria: "Otros", monto: "", metodo: "Efectivo", observacion: "" });
    } catch (err) {
      console.error(err);
      toast("Error al registrar egreso");
    }
  };

  return (
    <>
      <ToastContainer />

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Registrar Egreso</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCrear}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Concepto</label>
                  <input
                    className="form-input"
                    required
                    placeholder="Ej. Pago de agua y luz"
                    value={form.concepto}
                    onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Categoría</label>
                    <select
                      className="form-input form-select"
                      value={form.categoria}
                      onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    >
                      {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monto (COP)</label>
                    <input
                      className="form-input"
                      type="number"
                      required
                      min="1"
                      placeholder="150000"
                      value={form.monto}
                      onChange={(e) => setForm({ ...form, monto: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Método de pago</label>
                  <select
                    className="form-input form-select"
                    value={form.metodo}
                    onChange={(e) => setForm({ ...form, metodo: e.target.value })}
                  >
                    <option>Efectivo</option>
                    <option>Tarjeta débito</option>
                    <option>Tarjeta crédito</option>
                    <option>Transferencia</option>
                    <option>Nequi / Daviplata</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Observaciones</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    placeholder="Notas adicionales..."
                    style={{ resize: "none" }}
                    value={form.observacion}
                    onChange={(e) => setForm({ ...form, observacion: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold btn-sm">Registrar egreso</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-lbl">Egresos hoy</div>
          <div className="stat-val" style={{ color: "var(--red)" }}>{fmtMoney(totalHoy)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Egresos del mes</div>
          <div className="stat-val" style={{ color: "var(--red)" }}>{fmtMoney(totalMes)}</div>
          <div className="stat-sub">{egresos.filter((e) => isSameMonth(e.fecha)).length} registros</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Total acumulado</div>
          <div className="stat-val">{fmtMoney(totalAcum)}</div>
          <div className="stat-sub">{egresos.length} registros</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Registro de egresos</div>
          <button className="btn btn-gold btn-sm" onClick={() => setModal(true)}>+ Registrar</button>
        </div>

        {loading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>Cargando egresos...</div>
        ) : egresos.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>📤</div>
            No hay egresos registrados.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Categoría</th>
                <th>Método</th>
                <th>Registrado por</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {egresos.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>{fmtFecha(e.fecha)}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{e.concepto}</div>
                    {e.observacion && <div style={{ fontSize: 10, color: "var(--muted)" }}>{e.observacion}</div>}
                  </td>
                  <td><span className="badge b-gray">{e.categoria}</span></td>
                  <td><span className="badge b-gray">{e.metodo}</span></td>
                  <td style={{ fontSize: 11, color: "var(--muted)" }}>{e.registradoPor || "—"}</td>
                  <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "var(--red)", fontSize: 14 }}>
                    {fmtMoney(e.monto)}
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
