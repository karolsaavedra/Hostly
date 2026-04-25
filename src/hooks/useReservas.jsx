// Hook para suscribirse a reservas en tiempo real
import { useEffect, useState } from "react";
import { suscribirReservas } from "../firebase/firestore";

export const useReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = suscribirReservas((data) => {
      setReservas(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { reservas, loading };
};
