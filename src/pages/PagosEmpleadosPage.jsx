import { useState, useEffect } from "react";
import { suscribirPagosEmpleados, registrarPagoEmpleado } from "../firebase/firestore";
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

const isSameMonth = (ts) => {
  if (!ts?.toDate) return false;
  const d = ts.toDate();
  const n = new Date();
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
};

export default function PagosEmpleadosPage() {
  const [pagos, setPagos]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const { usuario }           = useAuth();
  const { toast, ToastContainer } = useToast();

  const [form, setForm] = useState({
    nombreEmpleado: "",
    concepto:       "Salario mensual",
    monto:          "",
    metodo:         "Transferencia",
    observacion:    "",
  });

  useEffect(() => {
    const unsub = suscribirPagosEmpleados((data) => {
      setPagos(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const totalMes  = pagos.filter((p) => isSameMonth(p.fecha)).reduce((s, p) => s + (Number(p.monto) || 0), 0);
  const totalAcum = pagos.reduce((s, p) => s + (Number(p.monto) || 0), 0);

  const handleCrear = async (ev) => {
    ev.preventDefault();
    try {
      await registrarPagoEmpleado({
        ...form,
        monto:         Number(form.monto),
        registradoPor: usuario?.email || "sistema",
      });
      toast(`Pago de ${fmtMoney(Number(form.monto))} registrado para ${form.nombreEmpleado} ✓`);
      setModal(false);
      setForm({ nombreEmpleado: "", concepto: "Salario mensual", monto: "", metodo: "Transferencia", observacion: "" });
    } catch (err) {
      console.error(err);
      toast("Error al registrar pago");
    }
  };

  return (
    <>
      <ToastContainer />

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Registrar Pago a Empleado</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCrear}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre del empleado</label>
                  <input
                    className="form-input"
                    required
                    placeholder="Nombre completo"
                    value={form.nombreEmpleado}
                    onChange={(e) => setForm({ ...form, nombreEmpleado: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Concepto</label>
                    <select
                      className="form-input form-select"
                      value={form.concepto}
                      onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                    >
                      <option>Salario mensual</option>
                      <option>Quincena</option>
                      <option>Bono / incentivo</option>
                      <option>Horas extras</option>
                      <option>Liquidación</option>
                      <option>Anticipo</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monto (COP)</label>
                    <input
                      className="form-input"
                      type="number"
                      required
                      min="1"
                      placeholder="1200000"
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
                    <option>Transferencia</option>
                    <option>Efectivo</option>
                    <option>Nequi / Daviplata</option>
                    <option>Cheque</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Observaciones</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    placeholder="Periodo, notas..."
                    style={{ resize: "none" }}
                    value={form.observacion}
                    onChange={(e) => setForm({ ...form, observacion: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold btn-sm">Registrar pago</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-lbl">Pagos del mes</div>
          <div className="stat-val" style={{ color: "var(--blue)" }}>{fmtMoney(totalMes)}</div>
          <div className="stat-sub">{pagos.filter((p) => isSameMonth(p.fecha)).length} registros</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Total acumulado</div>
          <div className="stat-val">{fmtMoney(totalAcum)}</div>
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
          <button className="btn btn-gold btn-sm" onClick={() => setModal(true)}>+ Registrar pago</button>
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
              <tr>
                <th>Fecha</th>
                <th>Empleado</th>
                <th>Concepto</th>
                <th>Método</th>
                <th>Registrado por</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>{fmtFecha(p.fecha)}</td>
                  <td style={{ fontWeight: 500 }}>{p.nombreEmpleado}</td>
                  <td>
                    <div>{p.concepto}</div>
                    {p.observacion && <div style={{ fontSize: 10, color: "var(--muted)" }}>{p.observacion}</div>}
                  </td>
                  <td><span className="badge b-gray">{p.metodo}</span></td>
                  <td style={{ fontSize: 11, color: "var(--muted)" }}>{p.registradoPor || "—"}</td>
                  <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "var(--blue)", fontSize: 14 }}>
                    {fmtMoney(p.monto)}
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
