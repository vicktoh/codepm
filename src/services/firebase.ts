import { initializeApp } from "firebase/app";
import { getAuth } from "@firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCNEr5XdMDlaGQg8nYjwaK4kljNWKVQmxo",
  authDomain: "codepm-dev.firebaseapp.com",
  projectId: "codepm-dev",
  storageBucket: "codepm-dev.appspot.com",
  messagingSenderId: "650076752654",
  appId: "1:650076752654:web:c5cae87918a6339a6aa55f",
  measurementId: "G-DS046811KP",
};
// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const firebaseAuth = getAuth(firebaseApp);
