import { firebaseApp, firebaseAuth } from "./firebase";
import {
  getDatabase,
  onDisconnect,
  onValue,
  ref,
  remove,
  serverTimestamp,
  set,
  update,
} from "firebase/database";
import {
  GoogleAuthProvider,
  signInWithPopup,
  User,
  AuthError,
  signOut,
} from "firebase/auth";
import { System } from "../types/System";

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
      // if (!isEmailAllowed(result.user.email || "")) {
      //   console.log("does not match email");
      //   signOut(firebaseAuth);
      //   return {
      //     status: "failed",
      //   } as Result;
      // }
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

export const listenOnSystem = (callback: (system: System) => void) => {
  const database = getDatabase(firebaseApp);
  const statusRef = ref(database, `system`);
  return onValue(statusRef, (snapshot) => {
    const system: System = snapshot.val();
    callback(system);
  });
};

export const updateSystemVariable = (
  system: Omit<System, "publicHolidays">,
) => {
  const database = getDatabase(firebaseApp);
  const statusRef = ref(database, `system`);
  return update(statusRef, system);
};

export const updateSystemPublicHoliday = (
  system: Pick<System, "publicHolidays">,
) => {
  const database = getDatabase(firebaseApp);
  const systemRef = ref(database, "system");
  return update(systemRef, system);
};

export const deleteSystemPublicHoliday = (index: number) => {
  const database = getDatabase(firebaseApp);
  const systemRef = ref(database, `system/publicHolidays/${index}`);
  return remove(systemRef);
};
