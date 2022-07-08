import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { System } from "../types/System";

const initialAuth: System | null = null;

const systemSlice = createSlice({
  name: "system",
  initialState: initialAuth,
  reducers: {
    setSystem: (state: System | null, action: PayloadAction<System | null>) => {
      state = action.payload;
      return state as any;
    },
  },
});

export const { setSystem } = systemSlice.actions;
export default systemSlice.reducer;
