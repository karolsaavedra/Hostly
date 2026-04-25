import { useNavigate } from "react-router-dom";
import { useHabitaciones } from "../hooks/useHabitaciones.jsx";
import { useReservas } from "../hooks/useReservas.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { actualizarHabitacion, actualizarReserva } from "../firebase/firestore";

const initials = (name) => name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "??";
const badgeClass = { confirmada: "b-green", pendiente: "b-amber", checkin: "b-blue", checkout: "b-gray", ocupada: "b-red", disponible: "b-green", limpieza: "b-amber", reservada: "b-blue" };
const badgeLabel = { confirmada: "Confirmada", pendiente: "Pendiente", checkin: "En estancia", checkout: "Check-out", ocupada: "Ocupada", disponible: "Disponible", limpieza: "Limpieza", reservada: "Reservada" };

export default function DashboardPage() {
  const { habitaciones } = useHabitaciones();
  const { reservas } = useReservas();
  const { toast, ToastContainer } = useToast();
  const navigate = useNavigate();

  const occ = habitaciones.filter((h) => h.estado === "ocupada").length;
  const avail = habitaciones.filter((h) => h.estado === "disponible").length;
  const pct = habitaciones.length ? Math.round((occ / habitaciones.length) * 100) : 0;

  const doCheckin = async (res) => {
    await actualizarReserva(res.id, { estado: "checkin" });
    const hab = habitaciones.find((h) => h.numero === res.habitacion);
    if (hab) await actualizarHabitacion(hab.id, { estado: "ocupada", huesped: res.nombre });
    toast(`Check-in completado para ${res.nombre} ✓`);
  };

  return (
    <>
      <ToastContainer />

      {/* HERO */}
      <div style={{
        borderRadius: 16, background: "var(--bg3)", border: "1px solid rgba(255,255,255,0.06)",
        padding: "36px 40px", marginBottom: 20, position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(212,168,67,0.07) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>
            <div style={{ width: 20, height: 1, background: "var(--gold)" }} />Bienvenido al sistema
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 34, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", color: "var(--white)", marginBottom: 6 }}>
            El hotel del<br /><span style={{ color: "var(--gold)" }}>futuro digital</span><br />está aquí.
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, maxWidth: 380, marginBottom: 20 }}>
            Hostly centraliza reservas, huéspedes y habitaciones en un solo panel en tiempo real.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-gold" onClick={() => navigate("/reservas")}>Nueva reserva →</button>
            <button className="btn btn-outline" onClick={() => navigate("/habitaciones")}>Ver habitaciones</button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-end", zIndex: 1 }}>
          {[{ num: `${pct}%`, lbl: "Ocupación" }, { num: avail, lbl: "Disponibles" }, { num: "$1.3M", lbl: "Ingresos hoy" }].map((s) => (
            <div key={s.lbl} style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: "var(--gold)", lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-lbl">Ocupación</div><div className="stat-val gold">{pct}%</div><div className="prog"><div className="prog-fill" style={{ width: `${pct}%` }} /></div></div>
        <div className="stat-card"><div className="stat-lbl">Disponibles</div><div className="stat-val">{avail}</div><div className="stat-sub">De {habitaciones.length} total</div></div>
        <div className="stat-card"><div className="stat-lbl">Ingresos mes</div><div className="stat-val gold">$15.6M</div><div className="stat-change up">↑ 18%</div></div>
        <div className="stat-card"><div className="stat-lbl">Check-outs hoy</div><div className="stat-val">2</div><div className="stat-change down">2 pendientes</div></div>
      </div>

      {/* GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div>
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Reservas recientes</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/reservas")}>Ver todas →</button>
            </div>
            <table className="data-table">
              <thead><tr><th>Huésped</th><th>Hab.</th><th>Check-in</th><th>Check-out</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {reservas.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div className="av">{initials(r.nombre)}</div>{r.nombre}</div></td>
                    <td><span className="room-tag">{r.habitacion}</span></td>
                    <td style={{ fontSize: 11, color: "var(--muted)" }}>{r.checkin}</td>
                    <td style={{ fontSize: 11, color: "var(--muted)" }}>{r.checkout}</td>
                    <td><span className={`badge ${badgeClass[r.estado] || "b-gray"}`}>{badgeLabel[r.estado] || r.estado}</span></td>
                    <td>
                      {(r.estado === "confirmada" || r.estado === "pendiente") && (
                        <button className="btn btn-ghost btn-sm" onClick={() => doCheckin(r)}>CI</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Mapa rápido</div></div>
            <div className="panel-body">
              <div className="rooms-grid">
                {habitaciones.slice(0, 12).map((h) => (
                  <div key={h.id} className={`room-cell ${h.estado}`} onClick={() => navigate("/habitaciones")}>
                    <div className="room-num">{h.numero}</div>
                    <div className="room-type">{h.tipo?.split(" ")[0]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
