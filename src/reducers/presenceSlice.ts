import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PresenceState } from "../types/Presence";
const initialPresence: PresenceState | null = null;

const presencSlice = createSlice({
  initialState: initialPresence,
  name: "presence",
  reducers: {
    setPresence: (
      state: PresenceState | null,
      action: PayloadAction<PresenceState | null>,
    ) => {
      return { ...(state || {}), ...(action.payload || {}) } as any;
    },
  },
});

export const { setPresence } = presencSlice.actions;
export default presencSlice.reducer;
