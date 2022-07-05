import { Conversation, ConversationType } from "../types/Conversation";
import { User } from "../types/User";

export const conversationExist = (
  userId: string,
  conversations: Conversation[],
) => {
  let conversation = null;
  for (let i = 0; i < conversations.length; i++) {
    if (
      conversations[i].members.includes(userId) &&
      conversations[i].type === "private"
    ) {
      conversation = conversations[i];
      return conversation;
    }
  }
};

export const isInConversation = (
  search: string,
  members: string[],
  users: Record<string, User>,
  title?: string,
) => {
  let truthValue = false;
  if (title) {
    const i = title.toLowerCase().indexOf(search.toLowerCase());
    if (i > -1) return true;
    else return false;
  }
  members.forEach((memberid) => {
    const index = users[memberid].displayName
      .toLowerCase()
      .indexOf(search.toLowerCase());
    if (index > -1) {
      truthValue = truthValue || true;
    }
  });
  return truthValue;
};
