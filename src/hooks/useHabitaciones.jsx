// Hook para suscribirse a habitaciones en tiempo real
import { useEffect, useState } from "react";
import { suscribirHabitaciones } from "../firebase/firestore";

export const useHabitaciones = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = suscribirHabitaciones((data) => {
      setHabitaciones(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { habitaciones, loading };
};
