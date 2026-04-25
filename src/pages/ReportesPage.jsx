import { useHabitaciones } from "../hooks/useHabitaciones.jsx";
import { useReservas } from "../hooks/useReservas.jsx";

export default function ReportesPage() {
  const { habitaciones } = useHabitaciones();
  const { reservas } = useReservas();

  const occ = habitaciones.filter(h => h.estado === "ocupada").length;
  const pct = habitaciones.length ? Math.round(occ / habitaciones.length * 100) : 0;
  const totalRes = reservas.length;
  const completadas = reservas.filter(r => r.estado === "checkout").length;

  const tipoStats = habitaciones.reduce((acc, h) => {
    const tipo = h.tipo || "Otro";
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});
  const totalHabs = habitaciones.length || 1;

  const semanas = [
    { sem:"Sem 1 (1–7 Abr)", occ:78, ing:"$4.2M" },
    { sem:"Sem 2 (8–14 Abr)", occ:85, ing:"$5.1M" },
    { sem:"Sem 3 (15–21 Abr)", occ:pct, ing:"$6.3M" },
    { sem:"Sem 4 (22–30 Abr)", occ:null, ing:null },
  ];

  return (
    <div>
      {/* Resumen top */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        <div className="stat-card"><div className="stat-lbl">Ocupación actual</div><div className="stat-val gold">{pct}%</div><div className="prog"><div className="prog-fill" style={{ width:`${pct}%` }} /></div></div>
        <div className="stat-card"><div className="stat-lbl">Ingresos del mes</div><div className="stat-val gold">$15.6M</div><div className="stat-change up">↑ 18% vs anterior</div></div>
        <div className="stat-card"><div className="stat-lbl">Reservas totales</div><div className="stat-val">{totalRes}</div><div className="stat-sub">{completadas} completadas</div></div>
        <div className="stat-card"><div className="stat-lbl">Promedio noches</div><div className="stat-val">3.1</div><div className="stat-change up">↑ Meta: 80% ✓</div></div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:16 }}>
        <div>
          {/* Ocupación por semana */}
          <div className="panel" style={{ marginBottom:16 }}>
            <div className="panel-header">
              <div className="panel-title">Ocupación — Abril 2025</div>
              <button className="btn btn-ghost btn-sm">Exportar PDF</button>
            </div>
            <div className="panel-body">
              {semanas.map(s => (
                <div key={s.sem} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.03)", fontSize:13 }}>
                  <span style={{ color:"var(--muted)" }}>{s.sem}</span>
                  <div style={{ textAlign:"right" }}>
                    {s.occ != null ? (
                      <>
                        <div style={{ fontSize:11, color:"var(--muted)", marginBottom:2 }}>{s.occ}% ocupación</div>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"var(--gold)", fontSize:14 }}>{s.ing}</div>
                      </>
                    ) : (
                      <span style={{ color:"var(--muted2)", fontSize:12 }}>Pendiente</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tipos de habitación */}
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Habitaciones por tipo</div></div>
            <div className="panel-body">
              {Object.entries(tipoStats).map(([tipo, cant], i) => {
                const colors = ["var(--gold)","var(--blue)","var(--green)","var(--amber)","var(--red)"];
                const pctTipo = Math.round(cant / totalHabs * 100);
                return (
                  <div key={tipo} style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, marginBottom:5 }}>
                      <span>{tipo}</span>
                      <span style={{ fontWeight:600, color:colors[i % colors.length] }}>{pctTipo}%</span>
                    </div>
                    <div className="prog"><div className="prog-fill" style={{ width:`${pctTipo}%`, background:colors[i % colors.length] }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resumen lateral */}
        <div>
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Resumen financiero</div></div>
            <div className="panel-body">
              <div className="stat-card" style={{ marginBottom:10 }}>
                <div className="stat-lbl">Ingresos del mes</div>
                <div className="stat-val" style={{ fontSize:20, color:"var(--gold)" }}>$15.6M</div>
                <div className="stat-change up">↑ 18% vs mes anterior</div>
              </div>
              <div className="stat-card" style={{ marginBottom:10 }}>
                <div className="stat-lbl">Reservas completadas</div>
                <div className="stat-val" style={{ fontSize:20 }}>{completadas}</div>
                <div className="stat-sub">Promedio 3.1 noches</div>
              </div>
              <div className="stat-card" style={{ marginBottom:10 }}>
                <div className="stat-lbl">Tasa de ocupación</div>
                <div className="stat-val" style={{ fontSize:20, color:"var(--gold)" }}>{pct}%</div>
                <div className="stat-change up">Meta: 80% {pct >= 80 ? "✓" : "..."}</div>
              </div>
              <div className="stat-card">
                <div className="stat-lbl">Total habitaciones</div>
                <div className="stat-val" style={{ fontSize:20 }}>{habitaciones.length}</div>
                <div className="stat-sub">{occ} ocupadas ahora</div>
              </div>
            </div>
          </div>

          {/* Estado reservas */}
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Estado de reservas</div></div>
            <div className="panel-body">
              {[
                { lbl:"Confirmadas", e:"confirmada", cls:"b-green" },
                { lbl:"Pendientes",  e:"pendiente",  cls:"b-amber" },
                { lbl:"En estancia", e:"checkin",    cls:"b-blue" },
                { lbl:"Completadas", e:"checkout",   cls:"b-gray" },
              ].map(s => {
                const cnt = reservas.filter(r => r.estado === s.e).length;
                return (
                  <div key={s.e} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.03)", fontSize:12.5 }}>
                    <span style={{ color:"var(--muted)" }}>{s.lbl}</span>
                    <span className={`badge ${s.cls}`}>{cnt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
