import { useHabitaciones } from "../hooks/useHabitaciones.jsx";
import { actualizarHabitacion } from "../firebase/firestore";
import { useToast } from "../hooks/useToast.jsx";

export default function ServicioPage() {
  const { habitaciones, loading } = useHabitaciones();
  const { toast, ToastContainer } = useToast();

  const enLimpieza  = habitaciones.filter(h => h.estado === "limpieza");
  const disponibles = habitaciones.filter(h => h.estado === "disponible");
  const ocupadas    = habitaciones.filter(h => h.estado === "ocupada");

  const marcarLista = async (hab) => {
    await actualizarHabitacion(hab.id, { estado: "disponible", huesped: null });
    toast(`Hab. ${hab.numero} marcada como disponible ✓`);
  };

  const HabCard = ({ hab, accion, badge }) => (
    <div style={{
      background:"var(--bg4)", border:"1px solid rgba(255,255,255,0.05)",
      borderRadius:10, padding:"12px 16px", marginBottom:8,
      display:"flex", alignItems:"center", justifyContent:"space-between"
    }}>
      <div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color: accion ? "var(--amber)" : "var(--red)" }}>
          Hab. {hab.numero}
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:400, color:"var(--muted)", marginLeft:8 }}>{hab.tipo}</span>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:"var(--muted2)", marginLeft:6 }}>Piso {hab.piso}</span>
        </div>
        {hab.huesped && <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>Huésped: {hab.huesped}</div>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {badge}
        {accion && <button className="btn btn-gold btn-sm" onClick={() => marcarLista(hab)}>Lista ✓</button>}
      </div>
    </div>
  );

  return (
    <div>
      <ToastContainer />
      <div className="notif notif-gold" style={{ marginBottom:18 }}>
        <span className="notif-icon">🧹</span>
        <div>
          <div className="notif-title">Vista de Personal de Limpieza</div>
          <div className="notif-text">Aquí puedes ver el estado de todas las habitaciones. Marca como "Lista" cuando termines la limpieza para liberar disponibilidad en tiempo real.</div>
        </div>
      </div>

      {/* Resumen */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        <div className="stat-card">
          <div className="stat-lbl">En limpieza</div>
          <div className="stat-val" style={{ color:"var(--amber)" }}>{enLimpieza.length}</div>
          <div className="stat-sub">Pendientes hoy</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Disponibles</div>
          <div className="stat-val" style={{ color:"var(--green)" }}>{disponibles.length}</div>
          <div className="stat-sub">Listas para ocupar</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Ocupadas</div>
          <div className="stat-val" style={{ color:"var(--red)" }}>{ocupadas.length}</div>
          <div className="stat-sub">No tocar</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* En limpieza */}
        <div>
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title" style={{ color:"var(--amber)" }}>⬡ En limpieza ({enLimpieza.length})</div>
            </div>
            <div className="panel-body">
              {loading ? <div style={{ color:"var(--muted)", fontSize:12 }}>Cargando...</div>
               : enLimpieza.length === 0 ? (
                <div style={{ textAlign:"center", padding:20, color:"var(--muted)", fontSize:12 }}>
                  <div style={{ fontSize:24, marginBottom:8, opacity:0.4 }}>✅</div>
                  Todo limpio — sin pendientes
                </div>
              ) : enLimpieza.map(h => (
                <HabCard key={h.id} hab={h} accion={true} badge={<span className="badge b-amber">Limpieza</span>} />
              ))}
            </div>
          </div>

          {/* Ocupadas */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title" style={{ color:"var(--red)" }}>◉ Ocupadas — no molestar</div>
            </div>
            <div className="panel-body">
              {ocupadas.length === 0
                ? <div style={{ textAlign:"center", padding:16, color:"var(--muted)", fontSize:12 }}>No hay habitaciones ocupadas.</div>
                : ocupadas.map(h => (
                  <HabCard key={h.id} hab={h} accion={false} badge={<span className="badge b-red">Ocupada</span>} />
                ))
              }
            </div>
          </div>
        </div>

        {/* Disponibles por piso */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title" style={{ color:"var(--green)" }}>◎ Disponibles ({disponibles.length})</div>
          </div>
          <div className="panel-body">
            {disponibles.length === 0 ? (
              <div style={{ textAlign:"center", padding:16, color:"var(--muted)", fontSize:12 }}>Sin habitaciones disponibles.</div>
            ) : (
              [1,2,3,4,5].map(piso => {
                const pisoHabs = disponibles.filter(h => h.piso === piso);
                if (!pisoHabs.length) return null;
                return (
                  <div key={piso} style={{ marginBottom:16 }}>
                    <div style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8, paddingBottom:4, borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      Piso {piso} — {pisoHabs.length} libre{pisoHabs.length !== 1 ? "s" : ""}
                    </div>
                    <div className="rooms-grid" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))", gap:8 }}>
                      {pisoHabs.map(h => (
                        <div key={h.id} className="room-cell disponible" style={{ padding:"12px 6px" }}>
                          <div className="room-num">{h.numero}</div>
                          <div className="room-type" style={{ fontSize:9 }}>{h.tipo}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
