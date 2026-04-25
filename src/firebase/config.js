// ⚠️ REEMPLAZA con tu configuración de Firebase Console
// Pasos: console.firebase.google.com → Proyecto → Config de app web

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
   apiKey: "AIzaSyCurtYO0HvNXXLL5BqZ_yx3-AyZfepzGBY",
  authDomain: "hostly-9e4fc.firebaseapp.com",
  projectId: "hostly-9e4fc",
  storageBucket: "hostly-9e4fc.firebasestorage.app",
  messagingSenderId: "867372364502",
  appId: "1:867372364502:web:dfc1fc59b7b7ee50578f77",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
