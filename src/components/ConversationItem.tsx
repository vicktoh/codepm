import React, { FC, useMemo, useState } from "react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Flex,
  Heading,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { formatDistance } from "date-fns";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { useAppSelector } from "../reducers/types";
import { Conversation } from "../types/Conversation";
import { BsTrash } from "react-icons/bs";
import { DeleteDialog } from "./DeleteDialog";
import { removeGroupConversation } from "../services/chatServices";
type ConversationItemProps = {
  conversation: Conversation;
  onClick: () => void;
  isSelected: boolean;
};
export const ConversationItem: FC<ConversationItemProps> = ({
  conversation,
  onClick,
  isSelected,
}) => {
  const { users, presence, auth } = useAppSelector(
    ({ users, presence, auth }) => ({
      users,
      auth,
      presence,
    }),
  );
  const timelabelFontsize = useBreakpointValue({
    base: "5px",
    md: "8px",
    lg: "10px",
  });
  const { usersMap = {} } = users || {};
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const recipientId = useMemo(() => {
    const recp = conversation.members.filter(
      (memberId) => memberId !== auth?.uid,
    );
    return recp[0];
  }, [conversation.members, auth?.uid]);
  const unreadCount = useMemo(() => {
    // console.log(conversation.title, conversation);
    return Math.max(
      (conversation.chatCount || 0) -
        (conversation.conversation
          ? conversation.conversation[auth?.uid || ""] || 0
          : 0),
      0,
    );
  }, [conversation, auth?.uid]);

  const lastseen = useMemo(() => {
    if (!presence || !presence[recipientId]) return "unavailable";
    if (presence[recipientId].state === "offline") {
      return formatDistance(
        new Date(presence[recipientId]?.last_changed),
        new Date(),
      );
    }
    return "online";
  }, [recipientId, presence]);
  const lastUpdated = useMemo(() => {
    return formatDistance(new Date(), conversation.lastUpdated);
  }, [conversation.lastUpdated]);
  // const glassEffect = useGlassEffect(false, "3px");
  console.log(conversation.title, isSelected);
  const onDeleteConversation = async () => {
    setIsDeleting(true);
    try {
      await removeGroupConversation(conversation);
    } catch (err) {
      console.log(err);
    } finally {
      setIsDeleting(false);
    }
  };
  if (conversation.type === "group") {
    return (
      <Flex
        direction="row"
        py={3}
        px={2}
        my={"2px"}
        onClick={onClick}
        justifyContent="space-between"
        cursor="pointer"
        {...(isSelected ? { bg: "brand.200" } : { bg: "white" })}
      >
        <VStack alignItems="flext-start">
          <Heading fontSize="md">
            {conversation?.title || "Unknown Username"}
          </Heading>
          <HStack>
            <AvatarGroup spacing="-1rem">
              {conversation.members
                .filter((_memberId, i) => i < 3)
                .map((memberId, i) => (
                  <Avatar
                    size="sm"
                    key={`member-${i}`}
                    src={usersMap[memberId]?.photoUrl || ""}
                    name={usersMap[memberId]?.displayName || ""}
                  />
                ))}
            </AvatarGroup>
            {conversation.members.length > 3 && (
              <Badge
                variant="outline"
                colorScheme="green"
                fontSize={timelabelFontsize}
                ml={2}
              >
                {conversation.members.length - 3}+
              </Badge>
            )}
          </HStack>
        </VStack>
        <VStack alignItems="flex-end">
          {conversation.lastUpdated ? (
            <Text fontSize={timelabelFontsize} color="brand.400">
              {lastUpdated}
            </Text>
          ) : null}
          <HStack>
            {conversation.creatorId === auth?.uid ? (
              <IconButton
                size="xs"
                aria-label="Delete group"
                icon={<BsTrash />}
                onClick={() => setShowDelete(true)}
                isLoading={isDeleting}
              />
            ) : null}
            {unreadCount ? (
              <Badge
                color="white"
                fontSize="x-small"
                bg="brand.500"
                boxSize={5}
                display="inline-flex"
                justifyContent="center"
                alignItems="center"
                rounded="full"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            ) : null}
          </HStack>
        </VStack>
        {showDelete ? (
          <Modal isOpen={showDelete} onClose={() => setShowDelete(false)}>
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton />
              <ModalHeader>Delete Group</ModalHeader>
              <ModalBody>
                <DeleteDialog
                  title={`Delete Group ${conversation.title}`}
                  onClose={() => setShowDelete(false)}
                  onConfirm={onDeleteConversation}
                  isLoading={isDeleting}
                  description="This group will be deleted for all members as well. Are you sure?"
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        ) : null}
      </Flex>
    );
  }
  return (
    <Flex
      justifyContent="space-between"
      onClick={onClick}
      cursor="pointer"
      px={2}
      py={3}
      my={"2px"}
      borderColor={
        presence &&
        presence[recipientId] &&
        presence[recipientId].state === "online"
          ? "green.300"
          : ""
      }
      borderWidth={
        presence &&
        presence[recipientId] &&
        presence[recipientId].state === "online"
          ? 1
          : 0
      }
      {...(isSelected ? { bg: "brand.200" } : { bg: "white" })}
    >
      <HStack alignItems="flex-start">
        <Avatar
          src={usersMap[recipientId]?.photoUrl}
          name={usersMap[recipientId]?.displayName}
          size="sm"
        />
        <VStack spacing={1} alignItems="flex-start">
          <Heading fontSize="md">
            {usersMap[recipientId]?.displayName || ""}
          </Heading>
          <Text fontSize="xs">{lastseen}</Text>
        </VStack>
      </HStack>
      <VStack>
        {unreadCount ? (
          <Badge
            color="white"
            fontSize="x-small"
            bg="brand.500"
            boxSize={5}
            display="inline-flex"
            justifyContent="center"
            alignItems="center"
            rounded="full"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        ) : null}
        {conversation.lastUpdated ? (
          <Text fontSize={timelabelFontsize} color="brand.400">
            {lastUpdated}
          </Text>
        ) : null}
      </VStack>
    </Flex>
  );
};
