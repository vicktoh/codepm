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
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { link } from "fs";
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
      if (typeof log.dateUpdated !== "number")
        log.dateUpdated = (log.dateUpdated as Timestamp).toMillis();
      logs.push(log);
      logMap[snap.id] = log;
    });
    callback({ logs, logMap });
  });
};

export const fetchUserLogs = async (userId: string) => {
  const logRef = collection(db, `users/${userId}/logs`);
  const q = query(logRef, orderBy("timeStamp", "desc"), limit(400));
  const snapshot = await getDocs(q);
  const logMap: Record<string, Log> = {};
  snapshot.forEach((snap) => {
    const log = snap.data() as Log;
    logMap[snap.id] = log;
  });
  return logMap;
};

export const fetchLogs = async (userId: string, startDate: string) => {
  const logRef = collection(db, `users/${userId}/logs`);
  const timeStamp = new Date(startDate).getTime();
  const q = query(logRef, where("timeStamp", ">=", timeStamp), limit(500));
  const snapshot = await getDocs(q);
  const logs: Log[] = [];
  snapshot.forEach((snap) => {
    const log = snap.data() as Log;
    logs.push(log);
  });

  return logs;
};

export const fetchLogOfParticularDay = async (userId: string, date: string) => {
  const logRef = doc(db, `users/${userId}/logs/${date}`);
  const logSnapShot = await getDoc(logRef);
  if (logSnapShot.exists()) {
    const log = logSnapShot.data() as Log;
    console.log("log", log);
    return log;
  }
  return undefined;
};

export const newLogDay = (userId: string, logformvalue: LogFormType) => {
  const newLog: Log = {
    dateString: logformvalue.date,
    timeStamp: new Date(logformvalue.date).getTime(),
    dateUpdated: Timestamp.now(),
    activity: [logformvalue.title],
    ...(logformvalue.link ? { link: logformvalue.link } : {}),
    userId,
  };
  const logRef = doc(db, `users/${userId}/logs/${logformvalue.date}`);
  return setDoc(logRef, newLog);
};

export const updateLogActivity = (
  userId: string,
  dateString: string,
  activity: string | string[],
  link?: string,
) => {
  const logRef = doc(db, `users/${userId}/logs/${dateString}`);
  if (typeof activity === "string") {
    return updateDoc(logRef, { activity: arrayUnion(activity) });
  }
  return updateDoc(logRef, { activity, ...(link ? { link } : {}) });
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
  values: Omit<Request, "status" | "userId" | "timestamp">,
) => {
  const requestRef = doc(collection(db, `permissionRequests`));
  const newRequest: Request = {
    userId,
    ...values,
    status: "pending",
    timestamp: new Date().getTime(),
  };
  return setDoc(requestRef, newRequest);
};
export const makeLeaveRequest = (
  userId: string,
  values: Omit<Request, "type" | "status" | "userId" | "timestamp">,
  type: Request["type"],
) => {
  const requestRef = doc(collection(db, `permissionRequests`));

  const newRequest: Request = {
    userId,
    ...values,
    status: "pending",
    type,
    timestamp: new Date().getTime(),
  };
  return setDoc(requestRef, newRequest);
};

export const updateRequest = async (req: Request) => {
  const requestRef = doc(db, `permissionRequests/${req.id}`);
  return updateDoc(requestRef, req);
};

export const listenUserRequests = (
  userId: string,
  callback: (requests: Request[]) => void,
) => {
  const requestsCollection = collection(db, "permissionRequests");
  const q = query(
    requestsCollection,
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
  );
  return onSnapshot(q, (snapshot) => {
    const requests: Request[] = [];
    snapshot.forEach((snap) => {
      const request = snap.data() as Request;
      request.id = snap.id;
      requests.push(request);
    });
    callback(requests);
  });
};

export const listenOnRequest = (
  id: string,
  callback: (req: Request) => void,
) => {
  const requestRef = doc(db, `permissionRequests/${id}`);
  return onSnapshot(requestRef, (snapshot) => {
    const request = snapshot.data() as Request;
    callback(request);
  });
};

export const deleteRequest = (id: string) => {
  const requestRef = doc(db, `permissionRequests/${id}`);
  return deleteDoc(requestRef);
};
