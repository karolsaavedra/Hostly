import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./config";

export const login = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const logout = () => signOut(auth);

export const crearEmpleado = async (email, password, rol, nombre, area) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "empleados", cred.user.uid), {
    nombre,
    email,
    rol,
    area,
    creadoEn: new Date(),
  });

  return cred.user;
};

export const obtenerEmpleado = async (uid) => {
  const snap = await getDoc(doc(db, "empleados", uid));
  return snap.exists() ? snap.data() : null;
};

export const escucharSesion = (callback) => {
  return onAuthStateChanged(auth, callback);
};