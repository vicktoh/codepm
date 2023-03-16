import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { Notification, ReduxNotification } from "../types/Notification";
import { db } from "./firebase";

export const listenOnNofification = (
  userId: string,
  callback: (notification: ReduxNotification[]) => void,
) => {
  const notificationRef = collection(db, `users/${userId}/notifications`);
  const q = query(notificationRef, orderBy("timestamp", "desc"));
  return onSnapshot(q, (snapshot) => {
    const nots: ReduxNotification[] = [];
    snapshot.forEach((snap) => {
      const notification = snap.data();
      notification.id = snap.id;
      if (typeof notification.timestamp !== "number")
        notification.timestamp = (
          notification.timestamp as Timestamp
        ).toMillis();
      nots.push(notification as ReduxNotification);
    });
    callback(nots);
  });
};

export const markNotificationAsRead = (
  notificationId: string,
  userId: string,
) => {
  const notificationDoc = doc(
    db,
    `users/${userId}/notifications/${notificationId}`,
  );
  return updateDoc(notificationDoc, { read: true });
};

export const sendNotification = (notification: Notification) => {
  const ref = collection(
    db,
    `users/${notification.reciepientId}/notifications/`,
  );

  return addDoc(ref, notification);
};
export const sendMultipleNotification = (
  userIds: string[],
  payload: Pick<Notification, "description" | "title" | "linkTo" | "type">,
) => {
  const batch = writeBatch(db);
  const { title, description, linkTo } = payload;
  userIds.forEach((userId) => {
    const collectionRef = collection(db, `users/${userId}/notifications`);
    const docRef = doc(collectionRef);
    batch.set(docRef, {
      ...payload,
      id: docRef.id,
      timestamp: Timestamp.now(),
      read: false,
      reciepientId: userId,
    } as Notification);
  });
  return batch.commit();
};
