import { firebaseApp, firebaseAuth } from "./firebase";
import {
  getDatabase,
  onDisconnect,
  onValue,
  ref,
  serverTimestamp,
  set,
} from "firebase/database";
import {
  GoogleAuthProvider,
  signInWithPopup,
  User,
  AuthError,
  signOut,
} from "firebase/auth";

type Result = {
  status: "success" | "failed";
  user?: User;
  error?: AuthError;
};

export const loginNormalUser = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(firebaseAuth, provider);
    if (result.user) {
      return {
        status: "success",
        user: result.user,
      } as Result;
    }
    return {
      status: "failed",
    } as Result;
  } catch (error) {
    const err: AuthError = error as any;
    return {
      status: "failed",
      error: err,
    } as Result;
  }
};

export const logOut = async () => {
  try {
    await signOut(firebaseAuth);
  } catch (error) {
    return error as AuthError;
  }
};

export const reportMyPresence = (userId: string) => {
  const database = getDatabase(firebaseApp);
  const statusRef = ref(database, `status/${userId}`);

  const isOfflineForDatabase = {
    state: "offline",
    last_changed: serverTimestamp(),
  };

  const isOnlineForDatabase = {
    state: "online",
    last_changed: serverTimestamp(),
  };

  const connectedRef = ref(database, ".info/connected");
  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) {
      console.log("it is not connected");
      return;
    }
    onDisconnect(statusRef).set(isOfflineForDatabase);
    set(statusRef, isOnlineForDatabase);
  });
};
