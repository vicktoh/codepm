import { configureStore } from "@reduxjs/toolkit";
import { Auth } from "../types/Auth";
import { Profile } from "../types/Profile";
import auth from './authSlice';
import profile from './profileSlice';
export const store = configureStore({
   reducer: {
      auth,
      profile
   }
})


export type StoreType = {
   auth : Auth | null,
   profile: Profile | null
}


export type AppDispatch = typeof store.dispatch;