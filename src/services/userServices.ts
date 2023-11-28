import { httpsCallable, getFunctions } from "firebase/functions";
import { EmailPayLoad, Notification } from "../types/Notification";
import { UserRole } from "../types/Profile";
import { RequisitionStatsData } from "../types/Requisition";
import { firebaseApp } from "./firebase";
import { requisitionCategories, TimeFilter } from "./requisitionAnalytics";

const functions = getFunctions(firebaseApp);

export const setUserRole = httpsCallable<
  { userId: string; role: UserRole },
  { status: "success" | "failed"; message?: string }
>(functions, "setRole");
export const sendEmailNotification = httpsCallable<
  EmailPayLoad,
  { status: "success" | "failed"; message?: string }
>(functions, "sendEmailNotification");
export const deleteNotifications = httpsCallable<
  void,
  { status: "success" | "failed"; message?: string }
>(functions, "deleteNotifications");
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
export const requisitionStats = httpsCallable<
  { filter?: string; facets?: string[]; timeframe?: TimeFilter },
  RequisitionStatsData
>(functions, "requisitionStats");
