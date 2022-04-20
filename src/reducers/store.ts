import { configureStore } from "@reduxjs/toolkit";
import { Auth } from "../types/Auth";
import auth from './authSlice';

export const store = configureStore({
   reducer: {
      auth,
   }
})


export type StoreType = {
   auth : Auth | null,
   categories: string [] | null;
}


export type AppDispatch = typeof store.dispatch;