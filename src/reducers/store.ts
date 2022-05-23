import { configureStore } from "@reduxjs/toolkit";
import { Auth } from "../types/Auth";
import { Profile } from "../types/Profile";
import { User } from "../types/User";
import auth from './authSlice';
import profile from './profileSlice';
import users from './usersSlice';
export const store = configureStore({
   reducer: {
      auth,
      profile,
      users
   }
})


export type StoreType = {
   auth : Auth | null,
   profile: Profile | null,
   users: User [] | null;
}


export type AppDispatch = typeof store.dispatch;