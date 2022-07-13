import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Auth } from "../types/Auth";

const initialAuth: Auth | null = null;

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuth,
  reducers: {
    setAuth: (state: Auth | null, action: PayloadAction<Auth | null>) => {
      state =
        action.payload === null
          ? null
          : { ...(state || {}), ...action.payload };
      return state as any;
    },
    updateAuth: (state: Auth | null, action: PayloadAction<Partial<Auth>>) => {
      state = { ...(state || {}), ...(action.payload as Auth) };
      return state as any;
    },
  },
});

export const { setAuth, updateAuth } = authSlice.actions;
export default authSlice.reducer;
