import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDskmKZortCiX01uhco8qYMwZBiPTA3IbY",
  authDomain: "daresnicheck.firebaseapp.com",
  projectId: "daresnicheck",
  storageBucket: "daresnicheck.firebasestorage.app",
  messagingSenderId: "299906541346",
  appId: "1:299906541346:web:aa3d96738cf0074f9a277b",
  measurementId: "G-JN9JBQHZDB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
