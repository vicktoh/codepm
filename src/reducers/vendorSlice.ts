import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Beneficiary } from "../types/Requisition";

const initialConversations: Record<string, Beneficiary>[] | null | [] = null;

const conversationSlice = createSlice({
  name: "vendors",
  initialState: initialConversations,
  reducers: {
    setVendors: (
      state: Record<string, Beneficiary> | null,
      action: PayloadAction<Record<string, Beneficiary>>,
    ) => {
      state = action.payload;
      return state as any;
    },
  },
});

export const { setVendors } = conversationSlice.actions;
export default conversationSlice.reducer;
