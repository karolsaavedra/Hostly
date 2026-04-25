import { useReservas } from "../hooks/useReservas.jsx";
import { useHabitaciones } from "../hooks/useHabitaciones.jsx";
import { actualizarReserva, actualizarHabitacion } from "../firebase/firestore";
import { useToast } from "../hooks/useToast.jsx";

const initials = (n) => n?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "??";

export default function CheckoutPage() {
  const { reservas } = useReservas();
  const { habitaciones } = useHabitaciones();
  const { toast, ToastContainer } = useToast();
  const enEstancia = reservas.filter((r) => r.estado === "checkin");

  const doCheckout = async (res) => {
    await actualizarReserva(res.id, { estado: "checkout" });
    const hab = habitaciones.find((h) => h.numero === res.habitacion);
    if (hab) await actualizarHabitacion(hab.id, { estado: "limpieza", huesped: null });
    toast(`Check-out completado — Hab. ${res.habitacion} en limpieza`);
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <ToastContainer />
      <div className="notif notif-red">
        <span className="notif-icon">🚪</span>
        <div><div className="notif-title">Proceso de Check-out</div><div className="notif-text">Registra la salida del huésped, genera la factura y la habitación pasará automáticamente a estado de limpieza.</div></div>
      </div>
      <div className="panel">
        <div className="panel-header"><div className="panel-title">Huéspedes en estancia ({enEstancia.length})</div></div>
        <div className="panel-body">
          {enEstancia.length === 0 ? (
            <div style={{ textAlign:"center", padding:24, color:"var(--muted)", fontSize:13 }}>No hay huéspedes activos. Realiza un check-in primero.</div>
          ) : enEstancia.map((r) => (
            <div key={r.id} style={{ background:"var(--bg4)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:10, padding:"14px 16px", marginBottom:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div className="av" style={{ width:38, height:38, fontSize:13 }}>{initials(r.nombre)}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, color:"var(--white)" }}>{r.nombre}</div>
                  <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>Hab. {r.habitacion} · Salida: {r.checkout}</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <button className="btn btn-outline btn-sm">Factura</button>
                <button className="btn btn-gold btn-sm" onClick={() => doCheckout(r)}>Check-out</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
