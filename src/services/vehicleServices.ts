import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { VehicleRequest } from "../types/VehicleRequest";
import { db } from "./firebase";

export const listenOnMyVehicleRequests = (
  userId: string,
  callback: (requests: VehicleRequest[]) => void,
) => {
  const vehicleRequestCollection = collection(db, "vehicleRequests");
  const q = query(vehicleRequestCollection, where("userId", "==", userId));

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
  const docRef = doc(db, `vehicleRequest/${request.id}`);
  return updateDoc(docRef, { ...request });
};

export const deleteVehicleRequest = (id: string) => {
  const docRef = doc(db, `vehicleRequest/${id}`);
  return deleteDoc(docRef);
};
