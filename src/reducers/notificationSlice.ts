import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Auth } from "../types/Auth";
import { ReduxNotification } from "../types/Notification";

const intialNotifications: ReduxNotification[] | null = null;

const notificationSlice = createSlice({
  name: "notifications",
  initialState: intialNotifications,
  reducers: {
    setNotification: (
      state: ReduxNotification[] | null,
      action: PayloadAction<ReduxNotification[] | null>,
    ) => {
      state = action.payload === null ? null : action.payload;
      return state as any;
    },
  },
});

export const { setNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
