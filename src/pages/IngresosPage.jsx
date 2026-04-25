import { useState, useEffect } from "react";
import { suscribirIngresos, registrarIngreso } from "../firebase/firestore";
import { useToast } from "../hooks/useToast.jsx";

export default function IngresosPage() {
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState({ descripcion:"", habitacion:"", monto:"", metodo:"Efectivo" });

  useEffect(() => {
    const unsub = suscribirIngresos(data => { setIngresos(data); setLoading(false); });
    return () => unsub();
  }, []);

  const total = ingresos.reduce((s, i) => s + (Number(i.monto) || 0), 0);
  const hoy = new Date().toLocaleDateString("es-CO");
  const totalHoy = ingresos.filter(i => {
    const f = i.fecha?.toDate?.()?.toLocaleDateString("es-CO");
    return f === hoy;
  }).reduce((s, i) => s + (Number(i.monto) || 0), 0);

  const handleCrear = async (e) => {
    e.preventDefault();
    await registrarIngreso({ ...form, monto: Number(form.monto) });
    toast(`Ingreso de $${Number(form.monto).toLocaleString()} registrado ✓`);
    setModal(false);
    setForm({ descripcion:"", habitacion:"", monto:"", metodo:"Efectivo" });
  };

  const fmtFecha = (ts) => ts?.toDate?.()?.toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric" }) || "—";
  const fmtMoneda = (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;

  return (
    <>
      <ToastContainer />

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Registrar Ingreso</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCrear}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <input className="form-input" required placeholder="Ej. Check-in Carlos Mendoza" value={form.descripcion} onChange={e => setForm({...form, descripcion:e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Habitación</label>
                    <input className="form-input" placeholder="Ej. 101" value={form.habitacion} onChange={e => setForm({...form, habitacion:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monto (COP)</label>
                    <input className="form-input" type="number" required placeholder="250000" value={form.monto} onChange={e => setForm({...form, monto:e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Método de pago</label>
                  <select className="form-input form-select" value={form.metodo} onChange={e => setForm({...form, metodo:e.target.value})}>
                    <option>Efectivo</option>
                    <option>Tarjeta débito</option>
                    <option>Tarjeta crédito</option>
                    <option>Transferencia</option>
                    <option>Nequi / Daviplata</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold btn-sm">Registrar ingreso</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        <div className="stat-card">
          <div className="stat-lbl">Total hoy</div>
          <div className="stat-val gold">{fmtMoneda(totalHoy)}</div>
          <div className="stat-change up">↑ Registrado</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Total registros</div>
          <div className="stat-val">{ingresos.length}</div>
          <div className="stat-sub">transacciones</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Total acumulado</div>
          <div className="stat-val gold">{fmtMoneda(total)}</div>
          <div className="stat-sub">Todos los registros</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Registro de ingresos</div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost btn-sm">Exportar CSV</button>
            <button className="btn btn-gold btn-sm" onClick={() => setModal(true)}>+ Registrar</button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding:24, textAlign:"center", color:"var(--muted)" }}>Cargando ingresos...</div>
        ) : ingresos.length === 0 ? (
          <div style={{ padding:32, textAlign:"center", color:"var(--muted)", fontSize:13 }}>
            <div style={{ fontSize:28, marginBottom:8, opacity:0.4 }}>💰</div>
            No hay ingresos registrados aún.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Fecha</th><th>Descripción</th><th>Hab.</th><th>Método</th><th>Monto</th></tr>
            </thead>
            <tbody>
              {ingresos.map(i => (
                <tr key={i.id}>
                  <td style={{ fontSize:11, color:"var(--muted)", fontFamily:"monospace" }}>{fmtFecha(i.fecha)}</td>
                  <td>{i.descripcion}</td>
                  <td>{i.habitacion ? <span className="room-tag">{i.habitacion}</span> : <span style={{ color:"var(--muted2)" }}>—</span>}</td>
                  <td><span className="badge b-gray">{i.metodo}</span></td>
                  <td>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:"var(--gold)", fontSize:15 }}>
                      {fmtMoneda(i.monto)}
                    </span>
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
