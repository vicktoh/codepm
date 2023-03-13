import { areIntervalsOverlapping } from "date-fns";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  orderBy,
} from "firebase/firestore";
import { request } from "http";
import { isBetween } from "../helpers";
import { VehicleRequest } from "../types/VehicleRequest";
import { db } from "./firebase";

export const listenOnMyVehicleRequests = (
  userId: string,
  callback: (requests: VehicleRequest[]) => void,
) => {
  const vehicleRequestCollection = collection(db, "vehicleRequests");
  const q = query(
    vehicleRequestCollection,
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
  );

  return onSnapshot(q, (snap) => {
    const reqs: VehicleRequest[] = [];
    snap.forEach((snapshot) => {
      const req = snapshot.data() as VehicleRequest;
      req.id = snapshot.id;
      reqs.push(req);
    });
    callback(reqs);
  });
};

export const sendVehicleRequest = async (request: VehicleRequest) => {
  const vCollection = collection(db, "vehicleRequests");
  const docRef = doc(vCollection);
  request.id = docRef.id;
  await setDoc(docRef, request);
  return docRef.id;
};

export const updateVehicleRquest = (request: Partial<VehicleRequest>) => {
  const docRef = doc(db, `vehicleRequests/${request.id}`);
  return updateDoc(docRef, { ...request });
};

export const deleteVehicleRequest = (id: string) => {
  const docRef = doc(db, `vehicleRequests/${id}`);
  return deleteDoc(docRef);
};

export const getVehicleRequestForDate = async (date: string) => {
  const collectionRef = collection(db, "vehicleRequests");
  const q = query(collectionRef, where("date", "==", date));
  const snapshot = await getDocs(q);
  const requests: VehicleRequest[] = [];
  snapshot.forEach((snap) => {
    const req = snap.data() as VehicleRequest;
    req.id = snap.id;
    requests.push(req);
  });

  return requests;
};

export const listenOnVehicleAdmin = (
  callback: (requests: VehicleRequest[]) => void,
) => {
  const collectionRef = collection(db, "vehicleRequests");
  const q = query(collectionRef, orderBy("timestamp", "desc"));
  return onSnapshot(q, (snapshot) => {
    const requests: VehicleRequest[] = [];
    snapshot.forEach((snap) => {
      const vehReq = snap.data() as VehicleRequest;
      vehReq.id = snap.id;
      requests.push(vehReq);
    });
    callback(requests);
  });
};

export const getVehicleRequestClashes = (
  reqs: VehicleRequest[],
  reqToCompare: VehicleRequest,
) => {
  const clashingReq = reqs.find(
    (req) =>
      req.id !== reqToCompare.id &&
      areIntervalsOverlapping(
        { start: req.startTime, end: req.endTime },
        { start: reqToCompare.startTime, end: reqToCompare.endTime },
      ),
  );
  console.log({ clashingReq });
  return clashingReq;
};

export const updateVehicleRequestStatus = (
  status: VehicleRequest["status"],
  requestId: string,
  userId: string,
) => {
  const docRef = doc(db, `vehicleRequests/${requestId}`);
  const payload: Partial<VehicleRequest> = {
    status,
    ...(status === "approved"
      ? {
          approvedBy: userId,
          approvedTimeStamp: new Date().getTime(),
        }
      : {}),
  };

  return updateDoc(docRef, payload);
};
