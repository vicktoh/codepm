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
      conversation.timestamp = (conversation.timestamp as Timestamp).seconds;
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
    timestamp: Timestamp.now(),
    lastUpdated: Timestamp.now().toMillis(),
    creatorId,
    members: [creatorId, recipientId],
    type,
    id: converSationRef.id,
  };
  const senderRef = doc(
    db,
    `users/${creatorId}/conversations/${converSationRef.id}`,
  );
  const recipientRef = doc(
    db,
    `users/${recipientId}/conversations/${converSationRef.id}`,
  );
  batch.set(converSationRef, conversation);
  batch.set(senderRef, conversation);
  batch.set(recipientRef, conversation);
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
    timestamp: Timestamp.now(),
    lastUpdated: Timestamp.now().toMillis(),
    members: [creatorId],
    id: conversationRef.id,
  };

  const batch = writeBatch(db);
  batch.set(conversationRef, newGroupConversation);
  batch.set(userConversationRef, newGroupConversation);

  return batch.commit();
};

export const sendChat = (conversationId: string, newchat: Chat) => {
  const batch = writeBatch(db);
  const chatRef = doc(collection(db, `conversations/${conversationId}/chats`));
  const senderConversation = doc(
    db,
    `users/${newchat.senderId}/conversations/${conversationId}`,
  );
  const reciepientConversation = doc(
    db,
    `users/${newchat.recieverId}/conversations/${conversationId}`,
  );

  batch.set(chatRef, newchat);
  batch.update(senderConversation, { lastUpdated: new Date().getTime() });
  batch.update(reciepientConversation, { lastUpdated: new Date().getTime() });

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

export const markAsRead = (userId: string, conversationId: string) => {
  const conversationRef = doc(
    db,
    `users/${userId}/conversations/${conversationId}`,
  );
  return updateDoc(conversationRef, {
    unreadCount: 0,
  });
};

export const addNewMembersToConversation = (
  conversation: Conversation,
  members: string[],
) => {
  const generalConverationRef = doc(db, `conversations/${conversation.id}`);
  const batch = writeBatch(db);
  batch.update(generalConverationRef, { members });
  const newConversation: Conversation = {
    ...conversation,
    members: members,
    lastUpdated: Timestamp.now().toMillis(),
  };

  members.forEach((userId) => {
    batch.set(
      doc(db, `users/${userId}/conversations/${conversation.id}`),
      newConversation,
    );
  });

  return batch.commit();
};
