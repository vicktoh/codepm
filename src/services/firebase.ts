import { initializeApp } from "firebase/app";
import { getAuth } from "@firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { APP_ENV } from "../constants";
const firebaseConfig = {
  apiKey: "AIzaSyCNEr5XdMDlaGQg8nYjwaK4kljNWKVQmxo",
  authDomain: "codepm-dev.firebaseapp.com",
  projectId: "codepm-dev",
  storageBucket: "codepm-dev.appspot.com",
  messagingSenderId: "650076752654",
  appId: "1:650076752654:web:c5cae87918a6339a6aa55f",
  measurementId: "G-DS046811KP",
};

const firebaseProdConfig = {
  apiKey: "AIzaSyBIdiVgruUUn4mY9N28MKk1SDaWm3Tmyoc",
  authDomain: "code-pm-prod.firebaseapp.com",
  databaseURL:
    "https://code-pm-prod-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "code-pm-prod",
  storageBucket: "code-pm-prod.appspot.com",
  messagingSenderId: "636314215520",
  appId: "1:636314215520:web:5281d066c12769bb408f05",
  measurementId: "G-E708VHJKN3",
};
// Initialize Firebase
const credentials =
  process.env.REACT_APP_APP_ENV === "prod"
    ? firebaseProdConfig
    : firebaseConfig;
export const firebaseApp = initializeApp(credentials);

// console.log(credentials, process.env.REACT_APP_APP_ENV);
export const db = getFirestore(firebaseApp);
export const firebaseAuth = getAuth(firebaseApp);

export async function getFirestorDoc<T>(path: string) {
  const docRef = doc(db, path);
  const data = await getDoc(docRef);
  return data.data() as T;
}
