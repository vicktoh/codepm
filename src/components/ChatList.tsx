import React, { FC, useState } from "react";
import {
  Avatar,
  Flex,
  Heading,
  HStack,
  IconButton,
  Text,
  toast,
  useBreakpointValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Chat } from "../types/Chat";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { useAppSelector } from "../reducers/types";
import { formatDistance } from "date-fns";
import { EmptyState } from "./EmptyState";
import { BsTrash } from "react-icons/bs";
import { removeChat, removeRequisitionChat } from "../services/chatServices";
type ChatListProps = {
  chats: Chat[];
  userId?: string;
  requisitionId?: string;
};

const ChatBubble: FC<{ chat: Chat; requisitionId?: string }> = ({
  chat,
  requisitionId,
}) => {
  const glassEffect = useGlassEffect(false, "sm");
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });
  const [deleting, setDeleting] = useState<boolean>(false);
  const { users, auth } = useAppSelector(({ users, auth }) => ({
    users,
    auth,
  }));
  const toast = useToast();
  const { usersMap = {} } = users || {};
  const sender = users?.usersMap[chat.senderId] || chat.sender;
  const time = formatDistance(chat.timestamp as number, new Date());
  const onDeleteChat = async () => {
    try {
      setDeleting(true);
      await (requisitionId
        ? removeRequisitionChat(requisitionId, chat)
        : removeChat(chat));
    } catch (error) {
      const err: any = error;
      toast({
        title: "Could not delete chat",
        description: err?.message || "smothing went wrong",
        status: "error",
      });
    } finally {
      setDeleting(false);
    }
  };
  return (
    <Flex
      alignSelf={chat.senderId === auth?.uid ? "flex-end" : "flex-start"}
      maxWidth="50%"
      px={5}
      py={4}
      my={5}
      direction="column"
      bg="whiteAlpha.500"
      borderRadius="lg"
      boxShadow="lg"
      position="relative"
      role="group"
    >
      {auth?.uid === chat.senderId && (
        <IconButton
          icon={<BsTrash />}
          aria-label="delete chat"
          position="absolute"
          left={2}
          size="xs"
          zIndex={1}
          top={2}
          bg="red.300"
          color="white"
          isLoading={deleting}
          onClick={onDeleteChat}
          display="none"
          _groupHover={{ display: "flex" }}
        />
      )}
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
          <Text fontSize={isMobile ? "xx-small" : "xx-small"} color="red.500">
            {time} ago
          </Text>
        </VStack>
      </HStack>
      <Text mt={isMobile ? 1 : 2} fontSize="sm">
        {chat.text}
      </Text>
      {chat.recipient?.length ? (
        <Flex direction="column" mt={5}>
          <HStack spacing={-3}>
            {chat.recipient.map((userid) => (
              <Avatar
                size="xs"
                key={userid}
                src={usersMap[userid]?.photoUrl || ""}
                name={usersMap[userid]?.displayName || ""}
              />
            ))}
          </HStack>
        </Flex>
      ) : null}
    </Flex>
  );
};

export const ChatList: FC<ChatListProps> = ({
  chats,
  userId,
  requisitionId,
}) => {
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
      {chats.map((chat) => {
        if (
          userId &&
          chat.senderId !== userId &&
          chat.recipient?.length &&
          !chat.recipient.includes(userId)
        ) {
          return null;
        }
        return (
          <ChatBubble
            requisitionId={requisitionId}
            chat={chat}
            key={`chat-bubble-${chat.id}`}
          />
        );
      })}
    </>
  );
};
