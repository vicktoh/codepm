import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Requisition } from "../types/Requisition";

const initialAuth: Requisition[] | null = null;

const requisitonsSlice = createSlice({
  name: "requisitions",
  initialState: initialAuth,
  reducers: {
    setRequisition: (
      state: Requisition[] | null,
      action: PayloadAction<Requisition[]>,
    ) => {
      return action.payload as any;
    },
  },
});

export const { setRequisition } = requisitonsSlice.actions;
export default requisitonsSlice.reducer;
