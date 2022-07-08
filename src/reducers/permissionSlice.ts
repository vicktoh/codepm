import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Permission } from "../types/Permission";

const initialConversations: Permission | null | [] = null;

const permissionSlice = createSlice({
  name: "permission",
  initialState: initialConversations,
  reducers: {
    setPermisson: (
      state: Permission | null,
      action: PayloadAction<Permission | null>,
    ) => {
      state = action.payload;
      return state as any;
    },
  },
});

export const { setPermisson } = permissionSlice.actions;
export default permissionSlice.reducer;
