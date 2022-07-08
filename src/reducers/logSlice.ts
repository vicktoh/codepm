import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LogState } from "../types/Log";

const initialLog: LogState | null = null;

const logSlice = createSlice({
  name: "logs",
  initialState: initialLog,
  reducers: {
    setLog: (
      state: LogState | null,
      action: PayloadAction<LogState | null>,
    ) => {
      state =
        action.payload === null
          ? null
          : { ...(state || {}), ...action.payload };
      return state as any;
    },
  },
});

export const { setLog } = logSlice.actions;
export default logSlice.reducer;
