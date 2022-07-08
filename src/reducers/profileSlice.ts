import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Profile } from "../types/Profile";

const initialAuth: Profile | null | Record<string, unknown> = null;

const profileSlice = createSlice({
  name: "profile",
  initialState: initialAuth,
  reducers: {
    setProfile: (
      state: Profile | null | Record<string, unknown>,
      action: PayloadAction<Profile | null | Record<string, unknown>>,
    ) => {
      state =
        action.payload === null
          ? null
          : { ...(state || {}), ...action.payload };
      return state as any;
    },
  },
});

export const { setProfile } = profileSlice.actions;
export default profileSlice.reducer;
