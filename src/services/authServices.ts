import { firebaseAuth } from "./firebase";
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
