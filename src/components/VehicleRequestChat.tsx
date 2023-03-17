import {
  Button,
  Flex,
  HStack,
  Input,
  Text,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import React, { FC, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useAppSelector } from "../reducers/types";
import {
  listenOnVehicleRequest,
  markVehicleChatAsRead,
  sendVehicleChat,
} from "../services/vehicleServices";
import { Chat } from "../types/Chat";
import { Request } from "../types/Permission";
import { VehicleRequest } from "../types/VehicleRequest";
import { ChatList } from "./ChatList";
type RequestChatProps = {
  request: VehicleRequest;
};

export const VehicleRquestChat: FC<RequestChatProps> = ({ request }) => {
  const { auth, profile } = useAppSelector(({ users, auth, profile }) => ({
    users,
    profile,
    auth,
  }));
  console.log(request);
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });
  const [chats, setChats] = useState<Chat[]>();
  const [loading, setLoading] = useState<boolean>();
  const [chatMessage, setChatMessage] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const toast = useToast();
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!request.id) return;
    setLoading(true);
    const unsub = listenOnVehicleRequest(request.id, (req) => {
      console.log("I ran");
      setLoading(false);
      setChats(req.comments);
    });
    return unsub;
  }, [request.id, toast]);

  useEffect(() => {
    setTimeout(() => {
      if (!chats || !chats.length || !auth?.uid || !request.id) return;
      if (chats?.length === (request.conversation || {})[auth.uid]) return;
      console.log("updating mark as read");
      const conversation: Request["conversation"] = {
        ...(request.conversation || {}),
        [auth.uid]: chats.length,
      };
      try {
        markVehicleChatAsRead(request.id, conversation, chats.length);
      } catch (error) {
        console.log(error);
      }
    }, 1200);
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 800);
  }, [chats, auth?.uid, request.id, request.conversation]);

  const sendChatMessage = async () => {
    if (!chatMessage || !request.id) return;
    const newchat: Chat = {
      text: chatMessage,
      timestamp: new Date().getTime(),
      senderId: auth?.uid || "",
      sender: {
        photoUrl: profile?.photoUrl || "",
        displayName: auth?.displayName || "",
      },
      conversationId: request.id || "",
    };
    try {
      setSending(true);
      await sendVehicleChat([...(chats || []), newchat], request.id);
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
    <Flex direction="column" width="100%" flex="1 1" position="relative">
      <Flex
        direction="column"
        width="100%"
        height="65vh"
        overflowY="auto"
        px={5}
        pt={5}
      >
        <Flex direction="column" width="100%" flex="1 1">
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
          <Flex
            width="100%"
            px={5}
            position="absolute"
            bg="white"
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
      </Flex>
    </Flex>
  );
};
