import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Project } from "../types/Project";

const initialConversations: Project[] | null | [] = null;

const conversationSlice = createSlice({
  name: "projects",
  initialState: initialConversations,
  reducers: {
    setProjects: (
      state: Project[] | null,
      action: PayloadAction<Project[] | null>,
    ) => {
      state = action.payload;
      return state as any;
    },
  },
});

export const { setProjects } = conversationSlice.actions;
export default conversationSlice.reducer;
