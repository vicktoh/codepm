import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Auth } from "../types/Auth";

const initialAuth: Auth | null = null;

const authSlice = createSlice({
    name: 'auth',
    initialState: initialAuth,
    reducers: {
        setAuth: (state: Auth | null | {}, action: PayloadAction<Auth|null| {}>) => {
             state = action.payload === null ? null : { ...(state || {}), ...action.payload };
             return state as any  
        },
    },
});

export const { setAuth } = authSlice.actions;
export default authSlice.reducer;