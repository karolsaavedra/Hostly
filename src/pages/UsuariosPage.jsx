import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { crearEmpleado } from "../firebase/auth";
import { useToast } from "../hooks/useToast.jsx";

const ROLES = ["recepcionista", "contador", "servicio", "vigilante", "admin"];
const COLORES_ROL = {
  admin: "#9B59B6", recepcionista: "#D4A843",
  servicio: "#2ECC71", contador: "#3498DB", vigilante: "#E74C3C",
};

export default function UsuariosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [creando, setCreando]     = useState(false);
  const { toast, ToastContainer } = useToast();

  const [form, setForm] = useState({
    nombre: "", email: "", password: "", rol: "recepcionista", area: "",
  });

  useEffect(() => {
    const q = query(collection(db, "empleados"), orderBy("creadoEn", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setEmpleados(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleCrear = async (ev) => {
    ev.preventDefault();
    setCreando(true);
    try {
      await crearEmpleado(form.email, form.password, form.rol, form.nombre, form.area);
      toast(`Empleado ${form.nombre} creado con rol ${form.rol} ✓`);
      setModal(false);
      setForm({ nombre: "", email: "", password: "", rol: "recepcionista", area: "" });
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        toast("Ese correo ya está registrado");
      } else if (err.code === "auth/weak-password") {
        toast("La contraseña debe tener al menos 6 caracteres");
      } else {
        toast("Error al crear empleado: " + err.message);
      }
    } finally {
      setCreando(false);
    }
  };

  return (
    <>
      <ToastContainer />

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Crear Empleado</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCrear}>
              <div className="modal-body">
                <div className="notif" style={{ background: "rgba(212,168,67,0.06)", border: "1px solid rgba(212,168,67,0.15)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "var(--muted)" }}>
                  Se creará una cuenta en Firebase Authentication y un perfil de empleado.
                  El empleado puede iniciar sesión con el email y contraseña registrados.
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nombre completo</label>
                    <input className="form-input" required placeholder="Ej. Juan Pérez" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rol</label>
                    <select className="form-input form-select" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" required placeholder="empleado@hotel.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Contraseña</label>
                    <input className="form-input" type="password" required minLength={6} placeholder="Mín. 6 caracteres" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Área / Turno</label>
                    <input className="form-input" placeholder="Ej. Recepción mañana" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold btn-sm" disabled={creando}>
                  {creando ? "Creando..." : "Crear empleado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
        {ROLES.map((rol) => (
          <div className="stat-card" key={rol}>
            <div className="stat-lbl" style={{ color: COLORES_ROL[rol] }}>{rol}</div>
            <div className="stat-val">{empleados.filter((e) => e.rol === rol).length}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Empleados del sistema ({empleados.length})</div>
          <button className="btn btn-gold btn-sm" onClick={() => setModal(true)}>+ Crear empleado</button>
        </div>

        {loading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>Cargando...</div>
        ) : empleados.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>👥</div>
            No hay empleados registrados.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Área</th><th>Creado</th></tr>
            </thead>
            <tbody>
              {empleados.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 500 }}>{e.nombre || "—"}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.email}</td>
                  <td>
                    <span className="badge" style={{
                      background: `${COLORES_ROL[e.rol] || "#6B6660"}18`,
                      color: COLORES_ROL[e.rol] || "#6B6660",
                      border: `1px solid ${COLORES_ROL[e.rol] || "#6B6660"}33`,
                      padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                    }}>
                      {e.rol}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.area || "—"}</td>
                  <td style={{ fontSize: 11, color: "var(--muted)" }}>
                    {e.creadoEn?.toDate?.()?.toLocaleDateString("es-CO") || "—"}
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
