import { httpsCallable, getFunctions } from "firebase/functions";
import { EmailPayLoad, Notification } from "../types/Notification";
import { UserRole } from "../types/Profile";
import { firebaseApp } from "./firebase";

const functions = getFunctions(firebaseApp);

export const setUserRole = httpsCallable<
  { userId: string; role: UserRole },
  { status: "success" | "failed"; message?: string }
>(functions, "setRole");
export const sendEmailNotification = httpsCallable<
  EmailPayLoad,
  { status: "success" | "failed"; message?: string }
>(functions, "sendEmailNotification");
export const sendNotificationToGroup = httpsCallable<
  { group: UserRole; data: Notification },
  { status: "success" | "failed"; message?: string }
>(functions, "sendNotificationToGroup");
export const disableUser = httpsCallable<
  { userId: string },
  { status: "success" | "failed"; message?: string }
>(functions, "disableUser");
export const enableUser = httpsCallable<
  { userId: string },
  { status: "success" | "failed"; message?: string }
>(functions, "enableUser");
export const serverTimestamp = httpsCallable<
  { userId?: string },
  { status: "success" | "failed"; timestamp: number }
>(functions, "serverTimestamp");
