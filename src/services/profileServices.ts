import { db, firebaseApp } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getStorage,
  uploadBytesResumable,
  ref,
  getDownloadURL,
} from "firebase/storage";
import { Profile } from "../types/Profile";
import { User } from "../types/User";

export const updateUserProfile = async (
  userId: string,
  profile: Partial<Profile>,
) => {
  const userRef = doc(db, `users/${userId}`);
  await setDoc(userRef, profile);
};
export const updatePhotoUrl = async (userId: string, photoUrl: string) => {
  const userRef = doc(db, `users/${userId}`);
  await updateDoc(userRef, { photoUrl });
};
export const updateSignatureUrl = async (
  userId: string,
  signatureUrl: string,
) => {
  const userRef = doc(db, `users/${userId}`);
  await updateDoc(userRef, { signatureUrl });
};

export const uploadProfilePic = async (
  userId: string,
  fileBlob: Blob,
  onErrorCallback: (mess: string) => void,
  progressCallback: (progress: number) => void,
  onSuccessCallback: (url: string) => void,
) => {
  const storage = getStorage(firebaseApp);
  const storageRef = ref(storage, `profile-pics/${userId}`);

  const task = uploadBytesResumable(storageRef, fileBlob);
  task.on(
    "state_changed",
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progressCallback(progress);
    },
    (error) => {
      onErrorCallback(error?.message || "UnknownError");
    },
    async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      onSuccessCallback(url);
    },
  );
};
export const uploadSignature = async (
  userId: string,
  fileBlob: Blob,
  onErrorCallback: (mess: string) => void,
  progressCallback: (progress: number) => void,
  onSuccessCallback: (url: string) => void,
) => {
  const storage = getStorage(firebaseApp);
  const storageRef = ref(storage, `signatures/${userId}`);

  const task = uploadBytesResumable(storageRef, fileBlob);
  task.on(
    "state_changed",
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progressCallback(progress);
    },
    (error) => {
      onErrorCallback(error?.message || "UnknownError");
    },
    async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      onSuccessCallback(url);
    },
  );
};

export const listenOnProfile = (
  userId: string,
  success: (data: Profile) => void,
) => {
  const userRef = doc(db, `users/${userId}`);
  const unsub = onSnapshot(userRef, (snapshot) => {
    const profile = snapshot.data() as Profile;
    success(profile);
  });

  return unsub;
};

export const fetchProfile = async (userId: string) => {
  const userRef = doc(db, `users/${userId}`);
  const profileSnap = await getDoc(userRef);
  return profileSnap.data() as Profile;
};

export const fetchUsers = async () => {
  const usersCollection = collection(db, "users");
  const usersQuery = query(usersCollection);
  const usersSnapshot = await getDocs(usersQuery);
  const users: User[] = [];
  const usersMap: Record<string, User> = {};
  usersSnapshot.forEach((snap) => {
    const user = snap.data() as User;
    user.userId = snap.id;
    users.push(user);
    usersMap[snap.id] = user;
  });

  return { users, usersMap };
};
