import { useState } from "react";
import { useHabitaciones } from "../hooks/useHabitaciones.jsx";
import { actualizarHabitacion } from "../firebase/firestore";
import { useToast } from "../hooks/useToast.jsx";

const ESTADOS = ["ocupada","disponible","limpieza","reservada"];
const ESTADO_LABEL = { ocupada:"Ocupada", disponible:"Disponible", limpieza:"Limpieza", reservada:"Reservada" };
const BADGE = { ocupada:"b-red", disponible:"b-green", limpieza:"b-amber", reservada:"b-blue" };

export default function HabitacionesPage() {
  const { habitaciones, loading } = useHabitaciones();
  const { toast, ToastContainer } = useToast();
  const [selected, setSelected] = useState(null);
  const [filtro, setFiltro] = useState("todas");

  const counts = ESTADOS.reduce((acc, e) => ({ ...acc, [e]: habitaciones.filter(h => h.estado === e).length }), {});
  const filtradas = filtro === "todas" ? habitaciones : habitaciones.filter(h => h.estado === filtro);

  const cambiarEstado = async (hab, nuevoEstado) => {
    await actualizarHabitacion(hab.id, { estado: nuevoEstado, ...(nuevoEstado === "disponible" ? { huesped: null } : {}) });
    toast(`Hab. ${hab.numero} → ${ESTADO_LABEL[nuevoEstado]} ✓`);
    setSelected(null);
  };

  return (
    <>
      <ToastContainer />

      {/* Modal detalle */}
      {selected && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Habitación {selected.numero} — {selected.tipo}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div className={`room-cell ${selected.estado}`} style={{ display:"inline-block", width:100, padding:"18px 12px" }}>
                  <div className="room-num" style={{ fontSize:24 }}>{selected.numero}</div>
                  <div className="room-type">{selected.tipo}</div>
                </div>
              </div>
              {[
                ["Estado actual", <span className={`badge ${BADGE[selected.estado]}`}>{ESTADO_LABEL[selected.estado]}</span>],
                ["Tipo", selected.tipo],
                ["Piso", `Piso ${selected.piso}`],
                ["Precio/noche", `$${(selected.precio/1000).toFixed(0)}K COP`],
                selected.huesped && ["Huésped", selected.huesped],
              ].filter(Boolean).map(([k, v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:13 }}>
                  <span style={{ color:"var(--muted)" }}>{k}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:18 }}>
                <div style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Cambiar estado</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {ESTADOS.filter(e => e !== selected.estado).map(e => (
                    <button key={e} className={`btn btn-sm badge ${BADGE[e]}`} style={{ cursor:"pointer", fontWeight:600 }} onClick={() => cambiarEstado(selected, e)}>
                      → {ESTADO_LABEL[e]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        {[
          { lbl:"Ocupadas",   val:counts.ocupada,    color:"var(--red)",   e:"ocupada" },
          { lbl:"Disponibles",val:counts.disponible, color:"var(--green)", e:"disponible" },
          { lbl:"En limpieza",val:counts.limpieza,   color:"var(--amber)", e:"limpieza" },
          { lbl:"Reservadas", val:counts.reservada,  color:"var(--blue)",  e:"reservada" },
        ].map(s => (
          <div key={s.lbl} className="stat-card" style={{ cursor:"pointer" }} onClick={() => setFiltro(filtro === s.e ? "todas" : s.e)}>
            <div className="stat-lbl">{s.lbl}</div>
            <div className="stat-val" style={{ color: s.color }}>{s.val || 0}</div>
            <div className="stat-sub">De {habitaciones.length} total</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Mapa de habitaciones</div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {[{c:"rgba(231,76,60,0.5)",l:"Ocupada"},{c:"rgba(46,204,113,0.5)",l:"Libre"},{c:"rgba(243,156,18,0.5)",l:"Limpieza"},{c:"rgba(52,152,219,0.5)",l:"Reservada"}].map(x=>(
                <div key={x.l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:"var(--muted)" }}>
                  <div style={{ width:8,height:8,borderRadius:2,background:x.c }} />{x.l}
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setFiltro("todas")}>Ver todas</button>
          </div>
        </div>
        <div className="panel-body">
          {loading ? <div style={{ textAlign:"center", padding:24, color:"var(--muted)" }}>Cargando habitaciones...</div> : (
            <>
              {[1,2,3].map(piso => {
                const pisoHabs = filtradas.filter(h => h.piso === piso);
                if (!pisoHabs.length) return null;
                return (
                  <div key={piso} style={{ marginBottom:20 }}>
                    <div style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10, paddingBottom:6, borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      Piso {piso}
                    </div>
                    <div className="rooms-grid" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(88px,1fr))", gap:10 }}>
                      {pisoHabs.map(h => (
                        <div key={h.id} className={`room-cell ${h.estado}`} onClick={() => setSelected(h)} style={{ padding:"14px 8px" }}>
                          <div className="room-num" style={{ fontSize:17 }}>{h.numero}</div>
                          <div className="room-type">{h.tipo?.split(" ")[0]}</div>
                          {h.huesped && <div style={{ fontSize:8, marginTop:4, opacity:0.6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{h.huesped}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}
