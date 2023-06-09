import { cH } from "@fullcalendar/core/internal-common";
import { getDatabase, onValue, ref } from "firebase/database";
import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { Chat } from "../types/Chat";
import { Conversation } from "../types/Conversation";
import { Presence, PresenceState } from "../types/Presence";
import { db, firebaseApp } from "./firebase";

export const listenOnConversations = (
  userId: string,
  callback: (data: Conversation[]) => void,
) => {
  const collectionRef = collection(db, `users/${userId}/conversations`);
  const q = query(collectionRef, orderBy("lastUpdated", "desc"));
  return onSnapshot(q, (snapshot) => {
    const conversations: Conversation[] = [];
    snapshot.forEach((snap) => {
      const conversation = snap.data() as Conversation;
      conversation.id = snap.id;
      conversations.push(conversation);
    });

    callback(conversations);
  });
};

export const listenOnChats = (
  conversationId: string,
  callback: (chats: Chat[]) => void,
) => {
  const collectionRef = collection(
    db,
    `/conversations/${conversationId}/chats`,
  );
  const q = query(collectionRef, orderBy("timestamp", "desc"), limit(20));
  return onSnapshot(
    q,
    (snapshot) => {
      const chats: Chat[] = [];
      snapshot.forEach((snap) => {
        const chat = snap.data() as Chat;
        chat.id = snap.id;
        chat.timestamp = (chat.timestamp as Timestamp).toMillis();
        chats.push(chat);
      });
      callback(chats.reverse());
    },
    (error) => console.log({ error }),
  );
};

export const listenOnPressence = (
  userId: string,
  callback: (presence: PresenceState) => void,
) => {
  const database = getDatabase(firebaseApp);
  const statusRef = ref(database, `status`);
  return onValue(statusRef, (snapshot) => {
    const presence: PresenceState = {};
    snapshot.forEach((snap) => {
      const pres = snap.val() as Presence;
      presence[snap.key || ""] = pres;
    });
    callback(presence);
  });
};

export const startConversation = async (
  creatorId: string,
  recipientId: string,
  type: Conversation["type"] = "private",
) => {
  const converSationRef = doc(collection(db, "conversations"));
  const batch = writeBatch(db);
  const conversation: Conversation = {
    timestamp: new Date().getTime(),
    lastUpdated: new Date().getTime(),
    creatorId,
    chatCount: 0,
    conversation: { [creatorId]: 0 },
    members: [creatorId, recipientId],
    type,
    id: converSationRef.id,
  };
  const senderRef = doc(
    db,
    `users/${creatorId}/conversations/${converSationRef.id}`,
  );
  if (recipientId) {
    const recipientRef = doc(
      db,
      `users/${recipientId}/conversations/${converSationRef.id}`,
    );
    batch.set(recipientRef, conversation);
  }
  batch.set(converSationRef, conversation);
  batch.set(senderRef, conversation);
  await batch.commit();
};

export const createNewGroupConversation = (
  groupName: string,
  creatorId: string,
) => {
  const conversationRef = doc(collection(db, `conversations/`));
  const userConversationRef = doc(
    db,
    `users/${creatorId}/conversations/${conversationRef.id}`,
  );
  const newGroupConversation: Conversation = {
    type: "group",
    title: groupName,
    creatorId,
    chatCount: 0,
    conversation: { [creatorId]: 0 },
    timestamp: new Date().getTime(),
    lastUpdated: new Date().getTime(),
    members: [creatorId],
    id: conversationRef.id,
  };

  const batch = writeBatch(db);
  batch.set(conversationRef, newGroupConversation);
  batch.set(userConversationRef, newGroupConversation);

  return batch.commit();
};

export const removeGroupConversation = async (conversation: Conversation) => {
  const batch = writeBatch(db);
  batch.delete(doc(db, `conversations/${conversation.id}`));
  for (const member of conversation.members) {
    batch.delete(doc(db, `users/${member}/conversations/${conversation.id}`));
  }
  await batch.commit();
};

export const sendChat = (
  conversationId: string,
  newchat: Chat,
  members: string[],
  chatCount: number,
  conversation: Conversation["conversation"],
) => {
  const batch = writeBatch(db);
  const chatRef = doc(collection(db, `conversations/${conversationId}/chats`));
  for (const member of members) {
    const memberRef = doc(
      db,
      `users/${member}/conversations/${conversationId}`,
    );
    batch.update(memberRef, {
      lastUpdated: new Date().getTime(),
      chatCount: chatCount,
      conversation,
    });
  }
  batch.set(chatRef, newchat);

  return batch.commit();
};

export const removeChat = (chat: Chat) => {
  if (!chat.id) return;
  const chatRef = doc(
    db,
    `conversations/${chat.conversationId}/chats/${chat.id}`,
  );
  return deleteDoc(chatRef);
};

export const removeRequisitionChat = (requisitionId: string, chat: Chat) => {
  if (!chat.id) return;
  const chatRef = doc(db, `requisitions/${requisitionId}/chats/${chat.id}`);
  return deleteDoc(chatRef);
};

export const markAsRead = (
  userId: string,
  conversationId: string,
  conversation: Record<string, number | undefined>,
) => {
  const conversationRef = doc(
    db,
    `users/${userId}/conversations/${conversationId}`,
  );
  console.log(conversation);
  return updateDoc(conversationRef, {
    conversation,
  });
};

export const addNewMembersToConversation = (
  conversation: Conversation,
  newMembers: string[],
) => {
  const generalConverationRef = doc(db, `conversations/${conversation.id}`);
  const batch = writeBatch(db);
  const members = [...conversation.members, ...newMembers];
  console.log(
    "Adding members to conversation",
    conversation.members,
    newMembers,
    conversation.id,
    conversation.title,
  );
  batch.update(generalConverationRef, {
    members,
  });
  const newConversation = {
    ...conversation,
    members,
    lastUpdated: new Date().getTime(),
  };
  console.log({ newConversation });
  conversation.members.forEach((member) => {
    batch.update(
      doc(db, `users/${member}/conversations/${conversation.id}`),
      newConversation,
    );
  });
  newMembers.forEach((userId) => {
    batch.set(
      doc(db, `users/${userId}/conversations/${conversation.id}`),
      newConversation,
    );
  });

  return batch.commit();
};

export const removeMembersFromConversation = (
  conversation: Conversation,
  newMembers: string[],
  removedMembers: string[],
) => {
  const generalConverationRef = doc(db, `conversations/${conversation.id}`);
  const batch = writeBatch(db);
  const newConversation = {
    members: newMembers,
    lastUpdated: new Date().getTime(),
  };
  batch.update(generalConverationRef, newConversation);
  for (const member of newMembers) {
    batch.update(
      doc(db, `users/${member}/conversations/${conversation.id}`),
      newConversation,
    );
  }
  for (const member of removedMembers) {
    batch.delete(doc(db, `users/${member}/conversations/${conversation.id}`));
  }
  return batch.commit();
};
