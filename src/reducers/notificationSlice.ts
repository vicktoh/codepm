import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Auth } from "../types/Auth";
import { Notification } from "../types/Notification";

const intialNotifications: Notification[] | null = null;

const notificationSlice = createSlice({
  name: "notifications",
  initialState: intialNotifications,
  reducers: {
    setNotification: (
      state: Notification[] | null,
      action: PayloadAction<Notification[] | null>,
    ) => {
      state = action.payload === null ? null : action.payload;
      return state as any;
    },
  },
});

export const { setNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
