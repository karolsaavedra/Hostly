import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { suscribirAuditoria } from "../firebase/firestore";
import { toDateSafe, inDateRange } from "../utils/dateMoney";
import { exportCsv } from "../utils/exportCsv";
import { useToast } from "../hooks/useToast.jsx";

const fmtFecha = (ts) =>
  toDateSafe(ts)?.toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }) || "—";

const COLORES_ACCION = {
  crear:          "b-green",
  actualizar:     "b-blue",
  cancelar:       "b-amber",
  "eliminar-logico": "b-red",
};

const ENTIDADES_CONTADOR = ["ingresos", "egresos", "pagos_empleados", "comprobantes"];

export default function AuditoriaPage() {
  const { usuario, rol } = useAuth();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [detalle, setDetalle]     = useState(null); // registro a ver en modal
  const { toast, ToastContainer } = useToast();

  const [filtroEntidad, setFiltroEntidad] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroDesde,   setFiltroDesde]   = useState("");
  const [filtroHasta,   setFiltroHasta]   = useState("");

  useEffect(() => {
    const unsub = suscribirAuditoria((data) => {
      setRegistros(data);
      setLoading(false);
    }, 500);
    return () => unsub();
  }, []);

  // El contador solo ve entidades financieras
  const registrosFiltrados = registros
    .filter((r) => rol === "contador" ? ENTIDADES_CONTADOR.includes(r.entidad) : true)
    .filter((r) => !filtroEntidad || r.entidad === filtroEntidad)
    .filter((r) => !filtroUsuario || r.usuarioEmail?.toLowerCase().includes(filtroUsuario.toLowerCase()))
    .filter((r) => !filtroDesde && !filtroHasta ? true : inDateRange(r.fecha, filtroDesde, filtroHasta));

  const entidades = [...new Set(registros.map((r) => r.entidad).filter(Boolean))];

  const handleExportar = () => {
    const ok = exportCsv({
      filename: `auditoria_${new Date().toISOString().slice(0,10)}.csv`,
      columns: [
        { label: "Fecha",     key: "fecha",       transform: (v) => toDateSafe(v)?.toLocaleString("es-CO") || "—" },
        { label: "Usuario",   key: "usuarioEmail" },
        { label: "Rol",       key: "usuarioRol" },
        { label: "Entidad",   key: "entidad" },
        { label: "ID",        key: "entidadId" },
        { label: "Acción",    key: "accion" },
        { label: "Descripción", key: "descripcion" },
      ],
      rows: registrosFiltrados,
    });
    if (!ok) toast("No hay registros para exportar");
  };

  return (
    <>
      <ToastContainer />

      {/* Modal detalle */}
      {detalle && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDetalle(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="modal-title">Detalle de auditoría</div>
              <button className="modal-close" onClick={() => setDetalle(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12, fontSize: 12 }}>
                {[
                  ["Entidad",  detalle.entidad],
                  ["Acción",   detalle.accion],
                  ["Usuario",  detalle.usuarioEmail],
                  ["Rol",      detalle.usuarioRol],
                  ["Fecha",    fmtFecha(detalle.fecha)],
                  ["ID",       detalle.entidadId],
                ].map(([k,v]) => (
                  <div key={k} style={{ background: "var(--bg4)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ color: "var(--muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontWeight: 500, wordBreak: "break-all" }}>{v || "—"}</div>
                  </div>
                ))}
              </div>

              {detalle.descripcion && (
                <div style={{ background: "rgba(212,168,67,0.06)", border: "1px solid rgba(212,168,67,0.15)", borderRadius: 8, padding: "10px 14px", fontSize: 12, marginBottom: 12 }}>
                  {detalle.descripcion}
                </div>
              )}

              {(detalle.antes || detalle.despues) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {detalle.antes && (
                    <div>
                      <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>Antes</div>
                      <pre style={{ background: "var(--bg4)", borderRadius: 8, padding: 12, fontSize: 10, color: "var(--red)", border: "1px solid rgba(231,76,60,0.15)", overflow: "auto", maxHeight: 200 }}>
                        {JSON.stringify(detalle.antes, null, 2)}
                      </pre>
                    </div>
                  )}
                  {detalle.despues && (
                    <div>
                      <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>Después</div>
                      <pre style={{ background: "var(--bg4)", borderRadius: 8, padding: 12, fontSize: 10, color: "var(--green)", border: "1px solid rgba(46,204,113,0.15)", overflow: "auto", maxHeight: 200 }}>
                        {JSON.stringify(detalle.despues, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => setDetalle(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-lbl">Total registros</div>
          <div className="stat-val">{registros.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Filtrados</div>
          <div className="stat-val">{registrosFiltrados.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Ediciones</div>
          <div className="stat-val" style={{ color: "var(--blue)" }}>
            {registros.filter((r) => r.accion === "actualizar").length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Anulaciones</div>
          <div className="stat-val" style={{ color: "var(--red)" }}>
            {registros.filter((r) => r.accion === "eliminar-logico").length}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">
          <div className="panel-title">Filtros</div>
          <button className="btn btn-ghost btn-sm" onClick={() => { setFiltroEntidad(""); setFiltroUsuario(""); setFiltroDesde(""); setFiltroHasta(""); }}>
            Limpiar
          </button>
        </div>
        <div className="panel-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Entidad</label>
              <select className="form-input form-select" value={filtroEntidad} onChange={(e) => setFiltroEntidad(e.target.value)}>
                <option value="">Todas</option>
                {entidades.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input className="form-input" placeholder="Email del usuario" value={filtroUsuario} onChange={(e) => setFiltroUsuario(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Desde</label>
              <input className="form-input" type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Hasta</label>
              <input className="form-input" type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            {rol === "contador" ? "Auditoría financiera" : "Historial de cambios"} ({registrosFiltrados.length})
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleExportar}>↓ CSV</button>
        </div>

        {loading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>Cargando auditoría...</div>
        ) : registrosFiltrados.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>📋</div>
            Sin registros de auditoría{filtroEntidad ? ` para "${filtroEntidad}"` : ""}.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Fecha</th><th>Usuario</th><th>Entidad</th><th>Acción</th><th>Descripción</th><th></th></tr>
            </thead>
            <tbody>
              {registrosFiltrados.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", whiteSpace: "nowrap" }}>{fmtFecha(r.fecha)}</td>
                  <td style={{ fontSize: 12 }}>{r.usuarioEmail || "—"}</td>
                  <td><span className="badge b-gray">{r.entidad}</span></td>
                  <td>
                    <span className={`badge ${COLORES_ACCION[r.accion] || "b-gray"}`}>{r.accion}</span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--muted)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.descripcion || "—"}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDetalle(r)}>Ver →</button>
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
