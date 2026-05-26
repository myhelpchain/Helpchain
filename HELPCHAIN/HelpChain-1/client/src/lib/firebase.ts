import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDsX6V3HFl59fGzu36BIm8djOiL_ElWGqc",
  authDomain: "myhelpchain123.firebaseapp.com",
  projectId: "myhelpchain123",
  storageBucket: "myhelpchain123.firebasestorage.app",
  messagingSenderId: "156041153638",
  appId: "1:156041153638:web:5a0e7f2acbbf6641e031a7",
  measurementId: "G-XRPBTFW344",
};

let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error("[Firebase] Initialization failed:", error);
}

export { auth, db, storage };
export default app;
