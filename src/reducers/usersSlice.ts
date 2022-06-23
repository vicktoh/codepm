import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../types/User";

const initialAuth: { users: User[]; userMap: Record<string, User> } | null =
  null;

const usersSlice = createSlice({
  name: "users",
  initialState: initialAuth,
  reducers: {
    setUsers: (
      state: User | null | {},
      action: PayloadAction<User[] | null | {}>,
    ) => {
      state =
        action.payload === null
          ? null
          : { ...(state || {}), ...action.payload };
      return state as any;
    },
  },
});

export const { setUsers } = usersSlice.actions;
export default usersSlice.reducer;
