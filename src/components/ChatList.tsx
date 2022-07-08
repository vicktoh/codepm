import React, { FC } from "react";
import {
  Avatar,
  Flex,
  Heading,
  HStack,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { Chat } from "../types/Chat";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { useAppSelector } from "../reducers/types";
import { formatDistance } from "date-fns";
import { EmptyState } from "./EmptyState";
type ChatListProps = {
  chats: Chat[];
};

const ChatBubble: FC<{ chat: Chat }> = ({ chat }) => {
  const glassEffect = useGlassEffect(false, "sm");
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });
  const { users, auth } = useAppSelector(({ users, auth }) => ({
    users,
    auth,
  }));
  const sender = users?.usersMap[chat.senderId] || chat.sender;
  const time = formatDistance(chat.timestamp as number, new Date());
  return (
    <Flex
      alignSelf={chat.senderId === auth?.uid ? "flex-end" : "flex-start"}
      maxWidth="50%"
      px={5}
      py={2}
      my={5}
      direction="column"
      {...glassEffect}
      borderRadius="lg"
      boxShadow="lg"
    >
      <HStack alignItems="flex-start">
        <Avatar
          size={isMobile ? "sm" : "md"}
          src={sender.photoUrl}
          name={sender.displayName}
        />
        <VStack spacing={1} alignItems="flex-start">
          <Heading color="black" fontSize={isMobile ? "xs" : "sm"}>
            {sender.displayName}
          </Heading>
          <Text fontSize={isMobile ? "xx-small" : "xs"} color="red.500">
            {time} ago
          </Text>
        </VStack>
      </HStack>
      <Text mt={isMobile ? 1 : 5} fontSize="sm">
        {chat.text}
      </Text>
    </Flex>
  );
};

export const ChatList: FC<ChatListProps> = ({ chats }) => {
  if (!chats.length) {
    return (
      <EmptyState
        description="You dont have any chat yet"
        title="Empty conversation"
      />
    );
  }

  return (
    <>
      {chats.map((chat) => (
        <ChatBubble chat={chat} key={`chat-bubble-${chat.id}`} />
      ))}
    </>
  );
};
