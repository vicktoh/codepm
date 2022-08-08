import { add, eachDayOfInterval, format } from "date-fns";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { Permission, Request } from "../types/Permission";
import { db } from "./firebase";

export const listenOnPermission = (
  userId: string,
  callback: (permission: Permission) => void,
) => {
  const permissionRef = doc(db, `permissions/${userId}`);
  return onSnapshot(permissionRef, (snapshot) => {
    const data = snapshot.data() as Permission;
    callback(data);
  });
};

export const getPermissions = async (userId: string) => {
  const permissionSnap = await getDoc(doc(db, `permissions/${userId}`));
  if (permissionSnap.exists()) {
    return permissionSnap.data() as Permission;
  }
  return null;
};

export const listenOnPermissionRequests = (
  onsuccess: (requests: Request[]) => void,
) => {
  const permissionCollection = collection(db, `permissionRequests`);
  const q = query(permissionCollection, orderBy("timestamp", "desc"));
  const unsub = onSnapshot(q, (snapshot) => {
    const requests: Request[] = [];
    snapshot.forEach((snap) => {
      const request = snap.data() as Request;
      request.id = snap.id;
      requests.push(request);
    });
    onsuccess(requests);
  });
  return unsub;
};

export const declineRequest = (id: string) => {
  const permissionDoc = doc(db, `permissionRequests/${id}`);
  return updateDoc(permissionDoc, { status: "declined" });
};

export const approveRequest = async (request: Request) => {
  const { leaveType, startDate, endDate, type, userId } = request;
  const permissionRef = doc(db, `permissions/${userId}`);
  const requestRef = doc(db, `permissionRequests/${request.id}`);
  if (type === "leave" && leaveType) {
    const leaveDays = eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate),
    }).map((date) => ({
      date: format(date, "y-MM-dd"),
      type: leaveType,
    }));
    await runTransaction(db, async (tranaction) => {
      const permissionSnap = await tranaction.get(permissionRef);

      if (permissionSnap.exists()) {
        tranaction.update(permissionRef, {
          leaveDays: arrayUnion(...leaveDays),
        });
      } else {
        tranaction.set(permissionRef, { leaveDays, logAllowance: {} });
      }
      tranaction.update(requestRef, { status: "approved" });
    });
  }
  if (type === "log") {
    const logAllowance: Permission["logAllowance"] = {
      period: {
        startDate,
        endDate,
      },
      expires: add(new Date(), { days: 1 }).getTime(),
    };
    await runTransaction(db, async (tranaction) => {
      const permissionSnap = await tranaction.get(permissionRef);
      if (permissionSnap.exists()) {
        tranaction.update(permissionRef, {
          logAllowance,
        });
      } else {
        tranaction.set(permissionRef, { leaveDays: [], logAllowance });
      }
      tranaction.update(requestRef, { status: "approved" });
    });
  }
};
