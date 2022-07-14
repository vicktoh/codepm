import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Requisition, RequisitionStats } from "../types/Requisition";
import { db, firebaseApp } from "./firebase";

export const listenOnRequisition = (
  userId: string,
  callback: (requisition: Requisition[]) => void,
  errorCallback: (message: string) => void,
) => {
  const requisitionsCollection = collection(db, `users/${userId}/requisitions`);
  const q = query(
    requisitionsCollection,
    orderBy("timestamp", "desc"),
    limit(100),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const requisitons: Requisition[] = [];
      snapshot.forEach((snap) => {
        const req = snap.data() as Requisition;
        req.id = snap.id;
        requisitons.push(req);
      });
      console.log(requisitons);
      callback(requisitons);
    },
    (error) =>
      errorCallback(
        error?.message || "Unexpected Error, Please refresh the page",
      ),
  );
};

export const listenOnRequisitionStats = (
  userId: string,
  callback: (stats: RequisitionStats) => void,
  errorCallback: (message: string) => void,
) => {
  const statsRef = doc(db, `requisitionStats/${userId}`);
  return onSnapshot(
    statsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const stats = snapshot.data() as RequisitionStats;
        callback(stats);
      } else {
        callback({});
      }
    },
    (error) => errorCallback(error.message || "Unexpected error"),
  );
};

export const uploadInvoice = (
  file: File,
  setProgress: (progress: number) => void,
  onUploadErr: (message: string) => void,
  onUploadSuccess: (url: string, name: string) => void,
) => {
  const timestamp = new Date().getTime();
  const storage = getStorage(firebaseApp);
  const invoiceRef = ref(storage, `invoices/${timestamp}`);
  const uploadTask = uploadBytesResumable(invoiceRef, file);
  uploadTask.on(
    "state_changed",
    (snap) => {
      const percentage = (snap.bytesTransferred / snap.totalBytes) * 100;
      setProgress(percentage);
    },
    (error) => onUploadErr(error?.message || "Unexpected error try again"),
    async () => {
      const url = await getDownloadURL(uploadTask.snapshot.ref);
      onUploadSuccess(url, timestamp + "");
    },
  );
};

export const removeInvoice = (name: string) => {
  const storage = getStorage(firebaseApp);
  const invoiceRef = ref(storage, `invoices/${name}`);
  return deleteObject(invoiceRef);
};

export const addNewRequisition = (userId: string, requisition: Requisition) => {
  const requisitionCollection = collection(db, "requisitions");
  const requisitionRef = doc(requisitionCollection);
  console.log(`users/${userId}/requisitions/${requisitionRef.id}`);
  const userRequisitionRef = doc(
    db,
    `users/${userId}/requisitions/${requisitionRef.id}`,
  );
  const batch = writeBatch(db);
  batch.set(requisitionRef, requisition);
  batch.set(userRequisitionRef, requisition);
  return batch.commit();
};

export const updateRequisition = (
  userId: string,
  requisitionId: string,
  requisition: Requisition,
) => {
  const requisitionRef = doc(db, `requisitions/${requisitionId}`);
  const userRequisitionRef = doc(
    db,
    `users/${userId}/requisitions/${requisitionId}`,
  );
  const batch = writeBatch(db);
  batch.update(requisitionRef, { ...requisition });
  batch.update(userRequisitionRef, { ...requisition });
  return batch.commit();
};

export const deleteRequisition = (userId: string, requisitionId: string) => {
  const requisitionRef = doc(db, `requisitions/${requisitionId}`);
  const userRequisitionRef = doc(
    db,
    `users/${userId}/requisitions/${requisitionId}`,
  );
  const batch = writeBatch(db);
  batch.delete(requisitionRef);
  batch.delete(userRequisitionRef);
  return batch.commit();
};
