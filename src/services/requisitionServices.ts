import { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Chat } from "../types/Chat";
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
      callback(requisitons);
    },
    (error) =>
      errorCallback(
        error?.message || "Unexpected Error, Please refresh the page",
      ),
  );
};
export const listenOnRequisitionChat = (
  requisitionId: string,
  successCallback: (chats: Chat[]) => void,
  onError: (error: string) => void,
) => {
  const requisitionChatCollecito = collection(
    db,
    `requisitions/${requisitionId}/chats`,
  );
  const q = query(
    requisitionChatCollecito,
    orderBy("timestamp", "desc"),
    limit(20),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const chats: Chat[] = [];
      snapshot.forEach((snap) => {
        const chat = snap.data() as Chat;
        chat.id = snap.id;
        chat.timestamp = (chat.timestamp as Timestamp).toMillis();
        chats.push(chat);
      });
      successCallback(chats.reverse());
    },
    (error) => {
      onError(error.message);
    },
  );
};
export const sendRequisitionChat = (requisitoinId: string, newchat: Chat) => {
  const chatRef = doc(collection(db, `requisitions/${requisitoinId}/chats`));
  return setDoc(chatRef, newchat);
};

export const markRequisitionChatAsRead = (
  requisitionId: string,
  requisitionUserId: string,
  conversation: Record<string, number>,
  chatCount: number,
) => {
  const requisitionRef = doc(db, `requisitions/${requisitionId}`);
  const userRequisitionRef = doc(
    db,
    `users/${requisitionUserId}/requisitions/${requisitionId}`,
  );
  const batch = writeBatch(db);
  batch.update(requisitionRef, {
    chatCount,
    conversation,
  });
  batch.update(userRequisitionRef, {
    chatCount,
    conversation,
  });
  return batch.commit();
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

export const listenOnRequisitionAdmin = (
  callback: (requisitions: Requisition[]) => void,
  errorCallback: (error: FirebaseError) => void,
) => {
  const q = query(collection(db, "requisitions"));
  const unsub = onSnapshot(
    q,
    (snapshot) => {
      const requisitions: Requisition[] = [];
      snapshot.forEach((snap) => {
        const req = snap.data() as Requisition;
        req.id = snap.id;
        requisitions.push(req);
      });
      callback(requisitions);
    },
    (error) => {
      console.log(error);
      errorCallback(error);
    },
  );
  return unsub;
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
