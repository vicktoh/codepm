import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../types/User";
type UserState = { users: User[]; usersMap: Record<string, User> };

const initialAuth: UserState | null = null;

const usersSlice = createSlice({
  name: "users",
  initialState: initialAuth,
  reducers: {
    setUsers: (
      state: UserState | null,
      action: PayloadAction<UserState | null>,
    ) => {
      state = action.payload;
      return state as any;
    },
  },
});

export const { setUsers } = usersSlice.actions;
export default usersSlice.reducer;
