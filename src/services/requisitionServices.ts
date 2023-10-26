import { FirebaseError } from "firebase/app";
import { getDatabase, onValue, update } from "firebase/database";
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { ref as dbRef } from "firebase/database";
import { Chat } from "../types/Chat";
import {
  Beneficiary,
  Requisition,
  RequisitionItem,
  RequisitionStats,
} from "../types/Requisition";
import { db, firebaseApp } from "./firebase";
import { BudgetItem } from "../types/Project";
import { User } from "../types/User";

import { EmailPayLoad, NotificationPayload } from "../types/Notification";
import { BASE_URL } from "../constants";
import { sendEmailNotification } from "./userServices";

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
  order: "timestamp" | "lastUpdated" = "timestamp",
) => {
  const q = query(collection(db, "requisitions"), orderBy(order, "desc"));
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
export const removeDocument = (path: string) => {
  const storage = getStorage(firebaseApp);
  const invoiceRef = ref(storage, path);
  return deleteObject(invoiceRef);
};

export const addNewRequisition = async (
  userId: string,
  requisition: Requisition,
) => {
  const requisitionCollection = collection(db, "requisitions");
  const requisitionRef = doc(requisitionCollection);
  const userRequisitionRef = doc(
    db,
    `users/${userId}/requisitions/${requisitionRef.id}`,
  );
  const batch = writeBatch(db);
  batch.set(requisitionRef, requisition);
  batch.set(userRequisitionRef, requisition);
  await batch.commit();
  return requisitionRef.id;
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

export const listenOnVendors = (
  userId: string,
  callback: (vendors: Record<string, Beneficiary>) => void,
) => {
  const database = getDatabase(firebaseApp);
  const statusRef = dbRef(database, `userVendors/${userId}`);
  return onValue(statusRef, (snapshot) => {
    const vendors: Record<string, Beneficiary> = {};
    snapshot.forEach((snap) => {
      const pres = snap.val() as Beneficiary;
      vendors[snap.key || ""] = pres;
    });
    callback(vendors);
  });
};

export const updateVendorsList = (
  userId: string,
  vendors: Record<string, Beneficiary | null>,
  beneficiaries: Beneficiary[],
) => {
  const database = getDatabase();
  const updates: Record<string, Beneficiary> = {};
  beneficiaries.forEach((vendor) => {
    if (!vendors[vendor.accountNumber]) {
      updates[`userVendors/${userId}/${vendor.accountNumber}`] = vendor;
    }
  });
  if (Object.keys(updates).length) {
    return update(dbRef(database), updates);
  }
};

export const fetchBudgetItems = async (
  items: RequisitionItem[],
  projectId: string,
) => {
  const codes = items.map((item) => (item.budget || "").split("-")[0].trim());
  const collecitonRef = collection(db, `projects/${projectId}/budget`);
  const q = query(collecitonRef, where("code", "in", codes));
  const docs = await getDocs(q);
  const budgetItems: BudgetItem[] = [];
  docs.forEach((snap) => {
    const budget = snap.data() as BudgetItem;
    budget.id = snap.id;
    budgetItems.push(budget);
  });
  return budgetItems;
};

export const updateRetirementStatus = (
  userId: string,
  requisitionId: string,
  updates: Pick<
    Requisition,
    | "retired"
    | "retirementApproveDate"
    | "retirementComment"
    | "retirementRefund"
    | "retirementApproved"
    | "status"
    | "retirementTimestamp"
  >,
) => {
  const requisitionRef = doc(db, `requisitions/${requisitionId}`);
  const userRequisitionRef = doc(
    db,
    `users/${userId}/requisitions/${requisitionId}`,
  );
  const batch = writeBatch(db);
  updates = { ...updates };
  batch.update(requisitionRef, updates);
  batch.update(userRequisitionRef, updates);
  return batch.commit();
};
type NewReqProps = {
  raisedBy: string;
  title: string;
  ids: string[];
};
export const newRequisitionNotification = async (
  { raisedBy, title, ids }: NewReqProps,
  usersMap: Record<string, User | undefined>,
) => {
  const message = `${raisedBy} is requesting your attention on the requisition "${title}". 
  Go on the codepm platform to view it.`;
  const receipient = ids
    .map(
      (userId) =>
        `${usersMap[userId]?.displayName || "User"} <${
          usersMap[userId]?.email || ""
        }>`,
    )
    .join(", ");
  console.log(receipient);
  const payload = {
    to: receipient,
    data: {
      title: "Requisition Alert",
      message,
      action: `${BASE_URL}/requisition-admin`,
      date: (new Date(), "do MMM yyy"),
    },
  } as EmailPayLoad;
  try {
    await sendEmailNotification(payload);
  } catch (error) {}
};
