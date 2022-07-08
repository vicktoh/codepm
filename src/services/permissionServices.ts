import { doc, onSnapshot } from "firebase/firestore";
import { Permission } from "../types/Permission";
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
