import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Conversation } from "../types/Conversation";

const initialConversations: Conversation[] | null | [] = null;

const conversationSlice = createSlice({
  name: "conversations",
  initialState: initialConversations,
  reducers: {
    setConversations: (
      state: Conversation[] | null | Record<string, unknown>,
      action: PayloadAction<Conversation[] | null | Record<string, unknown>>,
    ) => {
      state =
        action.payload === null
          ? null
          : { ...(state || {}), ...action.payload };
      return state as any;
    },
  },
});

export const { setConversations } = conversationSlice.actions;
export default conversationSlice.reducer;
