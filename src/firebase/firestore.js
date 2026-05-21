// ==========================================
// HOSTLY — Servicios de Firestore (tiempo real)
// Cada función maneja una colección de la BD
// ==========================================

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  limit,
} from "firebase/firestore";
import { db } from "./config";

// ─── RESERVAS ──────────────────────────────────────────
export const suscribirReservas = (callback) => {
  const q = query(
    collection(db, "reservas"),
    orderBy("creadaEn", "desc")
  );

  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    callback(data);
  });
};

export const crearReserva = async (datos) => {
  return await addDoc(collection(db, "reservas"), {
    ...datos,
    estado: "pendiente",
    creadaEn: serverTimestamp(),
  });
};

export const actualizarReserva = async (id, datos) => {
  return await updateDoc(doc(db, "reservas", id), datos);
};

export const eliminarReserva = async (id) => {
  return await deleteDoc(doc(db, "reservas", id));
};

// ─── HABITACIONES ──────────────────────────────────────
export const suscribirHabitaciones = (callback) => {
  const q = query(
    collection(db, "habitaciones"),
    orderBy("numero")
  );

  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    callback(data);
  });
};

export const actualizarHabitacion = async (id, datos) => {
  return await updateDoc(doc(db, "habitaciones", id), datos);
};

// ─── CLIENTES ──────────────────────────────────────────
export const suscribirClientes = (callback) => {
  const q = query(
    collection(db, "clientes"),
    orderBy("nombre")
  );

  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    callback(data);
  });
};

export const crearCliente = async (datos) => {
  return await addDoc(collection(db, "clientes"), {
    ...datos,
    creadoEn: serverTimestamp(),
    visitas: 0,
  });
};

export const actualizarCliente = async (id, datos) => {
  return await updateDoc(doc(db, "clientes", id), datos);
};

// ─── ACCESOS (Vigilante) ───────────────────────────────
export const registrarAcceso = async (datos) => {
  return await addDoc(collection(db, "accesos"), {
    ...datos,
    hora: serverTimestamp(),
  });
};

export const suscribirAccesos = (callback) => {
  const q = query(
    collection(db, "accesos"),
    orderBy("hora", "desc")
  );

  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    callback(data);
  });
};

// ─── INGRESOS (Contador) ───────────────────────────────
export const suscribirIngresos = (callback) => {
  const q = query(
    collection(db, "ingresos"),
    orderBy("fecha", "desc")
  );

  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    callback(data);
  });
};

export const registrarIngreso = async (datos) => {
  return await addDoc(collection(db, "ingresos"), {
    ...datos,
    fecha: serverTimestamp(),
  });
};

// ─── HISTORIAL DE ESTANCIAS ────────────────────────────
export const registrarHistorial = async (datos) => {
  return await addDoc(collection(db, "historial_estancias"), {
    ...datos,
    creadoEn: serverTimestamp(),
  });
};

export const suscribirHistorial = (callback) => {
  const q = query(
    collection(db, "historial_estancias"),
    orderBy("creadoEn", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── EGRESOS ───────────────────────────────────────────
export const registrarEgreso = async (datos) => {
  return await addDoc(collection(db, "egresos"), {
    ...datos,
    fecha: serverTimestamp(),
  });
};

export const suscribirEgresos = (callback) => {
  const q = query(
    collection(db, "egresos"),
    orderBy("fecha", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── PAGOS A EMPLEADOS ─────────────────────────────────
export const registrarPagoEmpleado = async (datos) => {
  return await addDoc(collection(db, "pagos_empleados"), {
    ...datos,
    fecha: serverTimestamp(),
  });
};

export const suscribirPagosEmpleados = (callback) => {
  const q = query(
    collection(db, "pagos_empleados"),
    orderBy("fecha", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── ACTUALIZAR INGRESO ────────────────────────────────
export const actualizarIngreso = async (id, datos) => {
  return await updateDoc(doc(db, "ingresos", id), {
    ...datos,
    actualizadoEn: serverTimestamp(),
  });
};

// ─── ACTUALIZAR EGRESO ─────────────────────────────────
export const actualizarEgreso = async (id, datos) => {
  return await updateDoc(doc(db, "egresos", id), {
    ...datos,
    actualizadoEn: serverTimestamp(),
  });
};

// ─── ACTUALIZAR PAGO EMPLEADO ──────────────────────────
export const actualizarPagoEmpleado = async (id, datos) => {
  return await updateDoc(doc(db, "pagos_empleados", id), {
    ...datos,
    actualizadoEn: serverTimestamp(),
  });
};

// ─── AUDITORÍA ─────────────────────────────────────────
export const registrarAuditoria = async (datos) => {
  return await addDoc(collection(db, "auditoria"), {
    ...datos,
    fecha: serverTimestamp(),
  });
};

export const suscribirAuditoria = (callback, maxItems = 200) => {
  const q = query(
    collection(db, "auditoria"),
    orderBy("fecha", "desc"),
    limit(maxItems)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// Wrappers con auditoría automática
export const actualizarIngresoConAuditoria = async (id, datosNuevos, datosAnteriores, usuario) => {
  await actualizarIngreso(id, { ...datosNuevos, actualizadoPor: usuario?.email || "sistema" });
  await registrarAuditoria({
    entidad: "ingresos",
    entidadId: id,
    accion: "actualizar",
    antes: datosAnteriores,
    despues: datosNuevos,
    usuarioEmail: usuario?.email || "sistema",
    usuarioRol: usuario?.rol || "—",
    descripcion: `Ingreso editado — ${datosNuevos.descripcion || id}`,
  });
};

export const actualizarEgresoConAuditoria = async (id, datosNuevos, datosAnteriores, usuario) => {
  await actualizarEgreso(id, { ...datosNuevos, actualizadoPor: usuario?.email || "sistema" });
  await registrarAuditoria({
    entidad: "egresos",
    entidadId: id,
    accion: "actualizar",
    antes: datosAnteriores,
    despues: datosNuevos,
    usuarioEmail: usuario?.email || "sistema",
    usuarioRol: usuario?.rol || "—",
    descripcion: `Egreso editado — ${datosNuevos.concepto || id}`,
  });
};

export const actualizarPagoEmpleadoConAuditoria = async (id, datosNuevos, datosAnteriores, usuario) => {
  await actualizarPagoEmpleado(id, { ...datosNuevos, actualizadoPor: usuario?.email || "sistema" });
  await registrarAuditoria({
    entidad: "pagos_empleados",
    entidadId: id,
    accion: "actualizar",
    antes: datosAnteriores,
    despues: datosNuevos,
    usuarioEmail: usuario?.email || "sistema",
    usuarioRol: usuario?.rol || "—",
    descripcion: `Pago editado — ${datosNuevos.nombreEmpleado || id}`,
  });
};

// ─── COMPROBANTES INTERNOS ─────────────────────────────
export const crearComprobante = async (datos) => {
  return await addDoc(collection(db, "comprobantes"), {
    ...datos,
    estado: "confirmado",
    creadoEn: serverTimestamp(),
  });
};

export const suscribirComprobantes = (callback) => {
  const q = query(
    collection(db, "comprobantes"),
    orderBy("creadoEn", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const anularComprobante = async (id, motivo, usuario) => {
  await updateDoc(doc(db, "comprobantes", id), {
    estado: "anulado",
    motivoAnulacion: motivo,
    anuladoPor: usuario?.email || "sistema",
    anuladoEn: serverTimestamp(),
  });
  await registrarAuditoria({
    entidad: "comprobantes",
    entidadId: id,
    accion: "eliminar-logico",
    antes: { estado: "confirmado" },
    despues: { estado: "anulado", motivo },
    usuarioEmail: usuario?.email || "sistema",
    usuarioRol: usuario?.rol || "—",
    descripcion: `Comprobante anulado — ${motivo}`,
  });
};

// ─── CAJAS DIARIAS ─────────────────────────────────────
export const crearCajaDiaria = async (datos) => {
  return await addDoc(collection(db, "cajas_diarias"), {
    ...datos,
    creadoEn: serverTimestamp(),
  });
};

export const actualizarCajaDiaria = async (id, datos) => {
  return await updateDoc(doc(db, "cajas_diarias", id), {
    ...datos,
    actualizadoEn: serverTimestamp(),
  });
};

export const suscribirCajasDiarias = (callback) => {
  const q = query(
    collection(db, "cajas_diarias"),
    orderBy("creadoEn", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── NOVEDADES ─────────────────────────────────────────
export const registrarNovedad = async (datos) => {
  return await addDoc(collection(db, "novedades"), {
    ...datos,
    estado: "abierta",
    fecha: serverTimestamp(),
  });
};

export const actualizarNovedad = async (id, datos) => {
  return await updateDoc(doc(db, "novedades", id), datos);
};

export const suscribirNovedades = (callback) => {
  const q = query(
    collection(db, "novedades"),
    orderBy("fecha", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── SEMILLA: crear automáticamente 100 habitaciones ───
export const seedHabitaciones = async () => {
  const habitaciones = [];

  for (let piso = 1; piso <= 5; piso++) {
    for (let num = 1; num <= 20; num++) {
      const numero = `${piso}${String(num).padStart(2, "0")}`;

      habitaciones.push({
        numero,
        tipo:
          num <= 5
            ? "Suite"
            : num <= 10
            ? "Doble"
            : num <= 15
            ? "Estándar"
            : "Simple",

        piso,
        estado: "disponible",

        precio:
          num <= 5
            ? 450000
            : num <= 10
            ? 300000
            : num <= 15
            ? 220000
            : 180000,
      });
    }
  }

  for (const hab of habitaciones) {
    await setDoc(
      doc(db, "habitaciones", `hab-${hab.numero}`),
      hab
    );
  }

  console.log("✅ 100 habitaciones creadas en Firestore");
};
