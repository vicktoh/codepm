import {
  Button,
  Flex,
  HStack,
  Input,
  Text,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import { Timestamp } from "firebase/firestore";
import React, { FC, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../reducers/types";
import {
  listenOnRequisitionChat,
  markRequisitionChatAsRead,
  sendRequisitionChat,
} from "../../services/requisitionServices";
import { Chat } from "../../types/Chat";
import { Requisition } from "../../types/Requisition";
import { ChatList } from "../ChatList";
type RequisitionChatProps = {
  requisition: Requisition;
};

export const RequisitionChat: FC<RequisitionChatProps> = ({ requisition }) => {
  const { auth, profile } = useAppSelector(({ users, auth, profile }) => ({
    users,
    profile,
    auth,
  }));
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });
  const [chats, setChats] = useState<Chat[]>();
  const [loading, setLoading] = useState<boolean>();
  const [chatMessage, setChatMessage] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const toast = useToast();
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!requisition.id) return;
    setLoading(true);
    const unsub = listenOnRequisitionChat(
      requisition.id,
      (chts) => {
        console.log("I ran");
        setLoading(false);
        setChats(chts);
      },
      (error) => {
        setLoading(false);
        toast({
          title: "Could not fetch chats",
          description: error,
          status: "error",
        });
      },
    );
    return unsub;
  }, [requisition.id, toast]);

  useEffect(() => {
    setTimeout(() => {
      if (!chats || !chats.length || !auth?.uid || !requisition.id) return;
      if (chats?.length === (requisition.conversation || {})[auth.uid]) return;
      console.log("updating mark as read");
      const conversation: Requisition["conversation"] = {
        ...(requisition.conversation || {}),
        [auth.uid]: chats.length,
      };
      try {
        markRequisitionChatAsRead(
          requisition.id,
          requisition.creatorId,
          conversation,
          chats.length,
        );
      } catch (error) {
        console.log(error);
      }
    }, 1200);
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 800);
  }, [
    chats,
    auth?.uid,
    requisition.id,
    requisition.creatorId,
    requisition.conversation,
  ]);

  const sendChatMessage = async () => {
    if (!chatMessage) return;
    const newchat: Chat = {
      text: chatMessage,
      timestamp: Timestamp.now(),
      senderId: auth?.uid || "",
      sender: {
        photoUrl: profile?.photoUrl || "",
        displayName: auth?.displayName || "",
      },
      conversationId: requisition.id || "",
    };
    try {
      setSending(true);
      await sendRequisitionChat(requisition.id || "", newchat);
    } catch (error) {
      const err: any = error;
      toast({
        description: err?.message || "Unexpected error",
        title: "Error",
        status: "error",
      });
    } finally {
      setSending(false);
      setChatMessage("");
    }
  };
  const onEnterChat = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendChatMessage();
    }
  };

  return (
    <Flex
      position="relative"
      flex="1 1"
      direction="column"
      width="100%"
      maxHeight="65vh"
      px={5}
      pt={5}
      pb="80px"
    >
      <Flex flex="1 1" overflowY="auto" direction="column">
        <Flex direction="column" width="100%" mt="auto">
          {loading ? (
            <Flex
              flex="1 1"
              direction="column"
              width="100%"
              justifyContent="center"
              alignItems="center"
            >
              <Text>Loading Chats...</Text>
            </Flex>
          ) : (
            chats && <ChatList chats={chats} />
          )}
          <Flex ref={endRef}></Flex>
        </Flex>
      </Flex>
      <Flex
        width="100%"
        px={5}
        position="fixed"
        left={0}
        bottom={isMobile ? 10 : 5}
      >
        <HStack width="100%" spacing={2}>
          <Input
            onKeyUp={onEnterChat}
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            variant="outline"
            borderColor="brand.300"
            placeholder="Enter your message here"
            _placeholder={{
              color: "gray.700",
            }}
          />
          <Button
            isLoading={sending}
            onClick={() => sendChatMessage()}
            variant="solid"
            colorScheme="red"
          >
            Send
          </Button>
        </HStack>
      </Flex>
    </Flex>
  );
};
