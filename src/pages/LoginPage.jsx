// ==========================================
// HOSTLY — Página de Login
// ==========================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, obtenerEmpleado } from "../firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login(email, password);
      const empleado = await obtenerEmpleado(user.uid);

      if (!empleado) {
        setError("Empleado no encontrado.");
        return;
      }

      switch (empleado.rol) {
        case "recepcionista":
          navigate("/");
          break;

        case "contador":
          navigate("/reportes");
          break;

        case "vigilante":
          navigate("/accesos");
          break;

        case "servicio":
          navigate("/servicio");
          break;

        default:
          navigate("/");
      }

    } catch (error) {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      backgroundImage:
        "radial-gradient(ellipse at 30% 20%, rgba(212,168,67,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(212,168,67,0.04) 0%, transparent 50%)"
    }}>
      {/* Grid decorativo */}
      <div style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        backgroundImage:
          "repeating-linear-gradient(90deg,rgba(255,255,255,0.02) 0,rgba(255,255,255,0.02) 1px,transparent 1px,transparent 80px),repeating-linear-gradient(180deg,rgba(255,255,255,0.02) 0,rgba(255,255,255,0.02) 1px,transparent 1px,transparent 80px)"
      }} />

      <div style={{
        background: "var(--bg2)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "40px 44px",
        width: 400,
        position: "relative",
        zIndex: 1
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48,
            height: 48,
            background: "var(--gold)",
            borderRadius: 12,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Syne',sans-serif",
            fontSize: 22,
            fontWeight: 800,
            color: "#0A0A0A",
            marginBottom: 12
          }}>
            H
          </div>

          <div style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 24,
            fontWeight: 800,
            color: "var(--white)"
          }}>
            Hostly
          </div>

          <div style={{
            fontSize: 12,
            color: "var(--muted)",
            marginTop: 4
          }}>
            Ingresa con tus credenciales
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="tu@hotel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(231,76,60,0.1)",
              border: "1px solid rgba(231,76,60,0.25)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 12,
              color: "var(--red)",
              marginBottom: 14
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-gold"
            style={{
              width: "100%",
              padding: "11px",
              fontSize: 13,
              marginTop: 4
            }}
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Ingresar al sistema →"}
          </button>
        </form>

        <div style={{
          textAlign: "center",
          marginTop: 20,
          fontSize: 11,
          color: "var(--muted)"
        }}>
          ¿Sin acceso? Contacta al administrador del hotel.
        </div>
      </div>
    </div>
  );
}