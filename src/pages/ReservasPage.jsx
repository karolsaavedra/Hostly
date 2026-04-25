import { useState } from "react";
import { useReservas } from "../hooks/useReservas.jsx";
import { useHabitaciones } from "../hooks/useHabitaciones.jsx";
import {
  crearReserva,
  actualizarReserva,
  eliminarReserva,
  actualizarHabitacion,
  crearCliente
} from "../firebase/firestore";
import { useToast } from "../hooks/useToast.jsx";

const initials = (n) =>
  n?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";

const badgeClass = {
  confirmada: "b-green",
  pendiente: "b-amber",
  checkin: "b-blue",
  checkout: "b-gray",
};

const badgeLabel = {
  confirmada: "Confirmada",
  pendiente: "Pendiente",
  checkin: "En estancia",
  checkout: "Check-out",
};

export default function ReservasPage() {
  const { reservas, loading } = useReservas();
  const { habitaciones } = useHabitaciones();
  const { toast, ToastContainer } = useToast();

  const [modal, setModal] = useState(false);
  const [filtro, setFiltro] = useState("todas");

  const [form, setForm] = useState({
    nombre: "",
    documento: "",
    email: "",
    habitacion: "",
    checkin: "",
    checkout: "",
    huespedes: "2",
  });

  const disponibles = habitaciones.filter(
    (h) => h.estado === "disponible"
  );

  const handleCrear = async (e) => {
    e.preventDefault();

    try {
      // 1. Crear reserva
      await crearReserva({
        ...form,
        estado: "confirmada",
      });

      // 2. Buscar habitación seleccionada
      const habitacionSeleccionada = habitaciones.find(
        (h) => h.numero === form.habitacion
      );

      // 3. Cambiar estado de habitación a reservada
      if (habitacionSeleccionada) {
        await actualizarHabitacion(habitacionSeleccionada.id, {
          estado: "reservada",
        });
      }

      // 4. Crear cliente
      await crearCliente({
        nombre: form.nombre,
        documento: form.documento,
        email: form.email,
        habitacion: form.habitacion,
      });

      toast(`Reserva creada para ${form.nombre} ✓`);

      // 5. Cerrar modal y resetear form
      setModal(false);

      setForm({
        nombre: "",
        documento: "",
        email: "",
        habitacion: "",
        checkin: "",
        checkout: "",
        huespedes: "2",
      });

    } catch (error) {
      console.error(error);
      toast("Error al crear reserva");
    }
  };

  const filtradas = reservas.filter(
    (r) => filtro === "todas" || r.estado === filtro
  );

  return (
    <>
      <ToastContainer />

      {modal && (
        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setModal(false)
          }
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                Nueva Reserva
              </div>

              <button
                className="modal-close"
                onClick={() => setModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrear}>
              <div className="modal-body">

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Nombre completo
                    </label>

                    <input
                      className="form-input"
                      required
                      placeholder="Ej. María García"
                      value={form.nombre}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          nombre: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Documento
                    </label>

                    <input
                      className="form-input"
                      required
                      placeholder="CC / Pasaporte"
                      value={form.documento}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          documento: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Check-in
                    </label>

                    <input
                      className="form-input"
                      type="date"
                      required
                      value={form.checkin}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          checkin: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Check-out
                    </label>

                    <input
                      className="form-input"
                      type="date"
                      required
                      value={form.checkout}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          checkout: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Habitación
                    </label>

                    <select
                      className="form-input form-select"
                      required
                      value={form.habitacion}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          habitacion: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        Seleccionar...
                      </option>

                      {disponibles.map((h) => (
                        <option
                          key={h.id}
                          value={h.numero}
                        >
                          {h.numero} – {h.tipo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Huéspedes
                    </label>

                    <select
                      className="form-input form-select"
                      value={form.huespedes}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          huespedes: e.target.value,
                        })
                      }
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <option
                          key={n}
                          value={n}
                        >
                          {n} persona{n > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Email
                  </label>

                  <input
                    className="form-input"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setModal(false)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-gold btn-sm"
                >
                  Confirmar reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            Todas las reservas
          </div>

          <button
            className="btn btn-gold btn-sm"
            onClick={() => setModal(true)}
          >
            + Nueva
          </button>
        </div>

        <div style={{ padding: "12px 20px" }}>
          <div className="chip-row">
            {[
              "todas",
              "confirmada",
              "pendiente",
              "checkin",
              "checkout",
            ].map((f) => (
              <div
                key={f}
                className={`chip ${
                  filtro === f ? "active" : ""
                }`}
                onClick={() => setFiltro(f)}
              >
                {f === "todas"
                  ? "Todas"
                  : badgeLabel[f] || f}
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            Cargando...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Huésped</th>
                <th>Hab.</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {filtradas.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div className="av">
                        {initials(r.nombre)}
                      </div>

                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {r.nombre}
                        </div>

                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--muted)",
                          }}
                        >
                          {r.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="room-tag">
                      {r.habitacion}
                    </span>
                  </td>

                  <td
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                    }}
                  >
                    {r.checkin}
                  </td>

                  <td
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                    }}
                  >
                    {r.checkout}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        badgeClass[r.estado] || "b-gray"
                      }`}
                    >
                      {badgeLabel[r.estado] || r.estado}
                    </span>
                  </td>

                  <td
                    style={{
                      display: "flex",
                      gap: 6,
                    }}
                  >
                    {(r.estado === "confirmada" ||
                      r.estado === "pendiente") && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={async () => {
                          await actualizarReserva(r.id, {
                            estado: "checkin",
                          });

                          toast("Check-in realizado ✓");
                        }}
                      >
                        Check-in
                      </button>
                    )}

                    <button
                      className="btn btn-sm"
                      style={{
                        background:
                          "rgba(231,76,60,0.1)",
                        color: "var(--red)",
                        border:
                          "1px solid rgba(231,76,60,0.2)",
                        borderRadius: 8,
                      }}
                      onClick={async () => {
                        await eliminarReserva(r.id);
                        toast("Reserva eliminada");
                      }}
                    >
                      ✕
                    </button>
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