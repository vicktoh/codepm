import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Requisition } from "../types/Requisition";

const initialAuth: Requisition | null = null;

const requisitonsSlice = createSlice({
  name: "requisitons",
  initialState: initialAuth,
  reducers: {
    setRequisition: (
      state: Requisition[] | null,
      action: PayloadAction<Requisition[]>,
    ) => {
      state =
        action.payload === null ? null : [...(state || []), ...action.payload];
      return state as any;
    },
  },
});

export const { setRequisition } = requisitonsSlice.actions;
export default requisitonsSlice.reducer;
