import {
  collection,
  doc,
  arrayUnion,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { Log, LogFormType, LogState } from "../types/Log";
import { Period, Request } from "../types/Permission";
import { db } from "./firebase";

export const listenOnLogs = (
  userId: string,
  callback: (logs: LogState) => void,
) => {
  const logRef = collection(db, `users/${userId}/logs`);
  const q = query(logRef, orderBy("timeStamp", "desc"), limit(400));
  return onSnapshot(q, (snapshot) => {
    const logs: Log[] = [];
    const logMap: Record<string, Log> = {};
    snapshot.forEach((snap) => {
      const log = snap.data() as Log;
      logs.push(log);
      logMap[snap.id] = log;
    });
    callback({ logs, logMap });
  });
};

export const newLogDay = (userId: string, logformvalue: LogFormType) => {
  const newLog: Log = {
    dateString: logformvalue.date,
    timeStamp: new Date(logformvalue.date).getTime(),
    dateUpdated: Timestamp.now(),
    activity: [logformvalue.title],
    userId,
  };
  const logRef = doc(db, `users/${userId}/logs/${logformvalue.date}`);
  return setDoc(logRef, newLog);
};

export const updateLogActivity = (
  userId: string,
  dateString: string,
  activity: string | string[],
) => {
  const logRef = doc(db, `users/${userId}/logs/${dateString}`);
  if (typeof activity === "string") {
    return updateDoc(logRef, { activity: arrayUnion(activity) });
  }
  return updateDoc(logRef, { activity });
};

export const removeLogActivity = (
  userId: string,
  dateString: string,
  activity: string,
) => {
  const logRef = doc(db, `users/${userId}/logs/${dateString}`);

  return updateDoc(logRef, { activity: arrayRemove(activity) });
};

export const removeLog = (userId: string, dateString: string) => {
  const logRef = doc(db, `users/${userId}/logs/${dateString}`);
  return deleteDoc(logRef);
};

export const makeRequest = (
  userId: string,
  period: Period,
  type: Request["type"],
) => {
  const requestRef = doc(collection(db, `permissionRequests`));
  const { startDate, endDate } = period;
  const newRequest: Request = {
    userId,
    startDate,
    endDate,
    status: "pending",
    type,
  };
  return setDoc(requestRef, newRequest);
};
