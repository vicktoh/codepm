import { httpsCallable, getFunctions } from "firebase/functions";
import { UserRole } from "../types/Profile";
import { firebaseApp } from "./firebase";

const functions = getFunctions(firebaseApp);

export const setUserRole = httpsCallable<
  { userId: string; role: UserRole },
  { status: "success" | "failed"; message?: string }
>(functions, "setRole");
