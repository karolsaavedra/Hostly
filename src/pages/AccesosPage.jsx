import { useState, useEffect } from "react";
import { suscribirAccesos, registrarAcceso } from "../firebase/firestore";
import { useToast } from "../hooks/useToast.jsx";

const TIPOS = { Entrada:"b-green", Salida:"b-gray", Intento:"b-red", Visita:"b-blue" };

export default function AccesosPage() {
  const [accesos, setAccesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState({ nombre:"", habitacion:"", tipo:"Entrada", estado:"ok", observacion:"" });

  useEffect(() => {
    const unsub = suscribirAccesos(data => { setAccesos(data); setLoading(false); });
    return () => unsub();
  }, []);

  const alertas = accesos.filter(a => a.estado === "alerta");
  const hoy = new Date().toLocaleDateString("es-CO");
  const accesosHoy = accesos.filter(a => {
    const f = a.hora?.toDate?.()?.toLocaleDateString("es-CO");
    return f === hoy;
  });

  const handleRegistrar = async (e) => {
    e.preventDefault();
    await registrarAcceso(form);
    toast(`Acceso registrado — ${form.nombre} (${form.tipo}) ✓`);
    setModal(false);
    setForm({ nombre:"", habitacion:"", tipo:"Entrada", estado:"ok", observacion:"" });
  };

  const fmtHora = (ts) => ts?.toDate?.()?.toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" }) || "—";
  const fmtFecha = (ts) => ts?.toDate?.()?.toLocaleDateString("es-CO", { day:"2-digit", month:"short" }) || "—";

  return (
    <>
      <ToastContainer />

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Registrar Acceso</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRegistrar}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre / Identificación</label>
                  <input className="form-input" required placeholder="Nombre de la persona" value={form.nombre} onChange={e => setForm({...form, nombre:e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Habitación</label>
                    <input className="form-input" placeholder="Ej. 101 (opcional)" value={form.habitacion} onChange={e => setForm({...form, habitacion:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipo</label>
                    <select className="form-input form-select" value={form.tipo} onChange={e => setForm({...form, tipo:e.target.value})}>
                      <option>Entrada</option>
                      <option>Salida</option>
                      <option>Visita</option>
                      <option>Intento</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-input form-select" value={form.estado} onChange={e => setForm({...form, estado:e.target.value})}>
                    <option value="ok">OK — Autorizado</option>
                    <option value="alerta">Alerta — Revisar</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Observación</label>
                  <textarea className="form-input" rows="2" placeholder="Notas adicionales..." style={{ resize:"none" }} value={form.observacion} onChange={e => setForm({...form, observacion:e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold btn-sm">Registrar acceso</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alertas activas */}
      {alertas.length > 0 && (
        <div className="notif notif-red" style={{ marginBottom:18 }}>
          <span className="notif-icon">⚠️</span>
          <div>
            <div className="notif-title" style={{ color:"var(--red)" }}>{alertas.length} alerta{alertas.length > 1 ? "s" : ""} de acceso registrada{alertas.length > 1 ? "s" : ""}</div>
            <div className="notif-text">Revisa los registros marcados como alerta. Verifica cámaras si es necesario.</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        <div className="stat-card"><div className="stat-lbl">Accesos hoy</div><div className="stat-val">{accesosHoy.length}</div><div className="stat-sub">Movimientos</div></div>
        <div className="stat-card"><div className="stat-lbl">Entradas</div><div className="stat-val" style={{ color:"var(--green)" }}>{accesosHoy.filter(a=>a.tipo==="Entrada").length}</div></div>
        <div className="stat-card"><div className="stat-lbl">Salidas</div><div className="stat-val" style={{ color:"var(--muted)" }}>{accesosHoy.filter(a=>a.tipo==="Salida").length}</div></div>
        <div className="stat-card"><div className="stat-lbl">Alertas</div><div className="stat-val" style={{ color:"var(--red)" }}>{alertas.length}</div><div className="stat-sub">Requieren revisión</div></div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Registro de accesos</div>
          <button className="btn btn-gold btn-sm" onClick={() => setModal(true)}>+ Registrar acceso</button>
        </div>

        {loading ? (
          <div style={{ padding:24, textAlign:"center", color:"var(--muted)" }}>Cargando accesos...</div>
        ) : accesos.length === 0 ? (
          <div style={{ padding:32, textAlign:"center", color:"var(--muted)", fontSize:13 }}>
            <div style={{ fontSize:28, marginBottom:8, opacity:0.4 }}>🛡️</div>
            No hay accesos registrados aún.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Hora</th><th>Fecha</th><th>Persona</th><th>Hab.</th><th>Tipo</th><th>Estado</th><th>Obs.</th></tr>
            </thead>
            <tbody>
              {accesos.map(a => (
                <tr key={a.id} style={{ background: a.estado === "alerta" ? "rgba(231,76,60,0.04)" : "transparent" }}>
                  <td style={{ fontFamily:"monospace", fontWeight:700, color:"var(--gold)", fontSize:13 }}>{fmtHora(a.hora)}</td>
                  <td style={{ fontSize:11, color:"var(--muted)" }}>{fmtFecha(a.hora)}</td>
                  <td style={{ fontWeight:500 }}>{a.nombre}</td>
                  <td>{a.habitacion ? <span className="room-tag">{a.habitacion}</span> : <span style={{ color:"var(--muted2)" }}>—</span>}</td>
                  <td><span className={`badge ${TIPOS[a.tipo] || "b-gray"}`}>{a.tipo}</span></td>
                  <td>
                    {a.estado === "ok"
                      ? <span className="badge b-green">✓ OK</span>
                      : <span className="badge b-red">⚠ Alerta</span>
                    }
                  </td>
                  <td style={{ fontSize:11, color:"var(--muted)", maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {a.observacion || "—"}
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
