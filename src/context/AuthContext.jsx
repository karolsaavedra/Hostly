import { createContext, useContext, useEffect, useState } from "react";
import { escucharSesion, obtenerEmpleado, logout } from "../firebase/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = escucharSesion(async (user) => {
      if (user) {
        const datos = await obtenerEmpleado(user.uid);
        setUsuario(datos);
      } else {
        setUsuario(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);