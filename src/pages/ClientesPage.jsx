import { useState, useEffect } from "react";
import { suscribirClientes, crearCliente } from "../firebase/firestore";
import { useToast } from "../hooks/useToast.jsx";

const initials = (n) => n?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "??";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [buscar, setBuscar] = useState("");
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState({ nombre:"", documento:"", email:"", telefono:"", tipoDoc:"CC" });

  useEffect(() => {
    const unsub = suscribirClientes(data => { setClientes(data); setLoading(false); });
    return () => unsub();
  }, []);

  const filtrados = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
    c.documento?.includes(buscar) ||
    c.email?.toLowerCase().includes(buscar.toLowerCase())
  );

  const handleCrear = async (e) => {
    e.preventDefault();
    await crearCliente(form);
    toast(`Cliente ${form.nombre} registrado ✓`);
    setModal(false);
    setForm({ nombre:"", documento:"", email:"", telefono:"", tipoDoc:"CC" });
  };

  return (
    <>
      <ToastContainer />

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Registrar Huésped</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCrear}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre completo</label>
                  <input className="form-input" required placeholder="Nombre y apellidos" value={form.nombre} onChange={e => setForm({...form, nombre:e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipo documento</label>
                    <select className="form-input form-select" value={form.tipoDoc} onChange={e => setForm({...form, tipoDoc:e.target.value})}>
                      <option>CC</option><option>Pasaporte</option><option>CE</option><option>NIT</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Número</label>
                    <input className="form-input" required placeholder="1234567890" value={form.documento} onChange={e => setForm({...form, documento:e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input className="form-input" placeholder="310 000 0000" value={form.telefono} onChange={e => setForm({...form, telefono:e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold btn-sm">Registrar cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Registro de huéspedes ({clientes.length})</div>
          <button className="btn btn-gold btn-sm" onClick={() => setModal(true)}>+ Registrar</button>
        </div>
        <div style={{ padding:"12px 20px" }}>
          <input
            className="form-input"
            type="text"
            placeholder="Buscar por nombre, documento o email..."
            style={{ maxWidth:360 }}
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
          />
        </div>
        {loading ? (
          <div style={{ padding:24, textAlign:"center", color:"var(--muted)" }}>Cargando clientes...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding:32, textAlign:"center", color:"var(--muted)", fontSize:13 }}>
            <div style={{ fontSize:28, marginBottom:8, opacity:0.4 }}>👥</div>
            {buscar ? "No se encontraron resultados." : "Aún no hay clientes registrados."}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Nombre</th><th>Documento</th><th>Email</th><th>Teléfono</th><th>Estancias</th><th>Registrado</th></tr>
            </thead>
            <tbody>
              {filtrados.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div className="av">{initials(c.nombre)}</div>
                      <div>
                        <div style={{ fontWeight:500 }}>{c.nombre}</div>
                        <div style={{ fontSize:10, color:"var(--muted)" }}>{c.tipoDoc || "CC"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize:11, color:"var(--muted)", fontFamily:"monospace" }}>{c.documento}</td>
                  <td style={{ fontSize:12 }}>{c.email || "—"}</td>
                  <td style={{ fontSize:12 }}>{c.telefono || "—"}</td>
                  <td><span className="badge b-blue">{c.visitas || 0} visitas</span></td>
                  <td style={{ fontSize:11, color:"var(--muted)" }}>
                    {c.creadoEn?.toDate?.().toLocaleDateString("es-CO") || "—"}
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
