import React, { FC, useMemo } from "react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Flex,
  Heading,
  HStack,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { formatDistance } from "date-fns";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { useAppSelector } from "../reducers/types";
import { Conversation } from "../types/Conversation";
type ConversationItemProps = {
  conversation: Conversation;
  onClick: () => void;
};
export const ConversationItem: FC<ConversationItemProps> = ({
  conversation,
  onClick,
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
  const recipientId = useMemo(() => {
    const recp = conversation.members.filter(
      (memberId) => memberId !== auth?.uid,
    );
    return recp[0];
  }, [conversation.members, auth?.uid]);

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
  const glassEffect = useGlassEffect(false, "3px");
  if (conversation.type === "group") {
    return (
      <Flex
        direction="row"
        py={3}
        px={2}
        onClick={onClick}
        justifyContent="space-between"
        cursor="pointer"
        {...glassEffect}
      >
        <VStack alignItems="flext-start">
          <Heading fontSize="md">
            {conversation?.title || "Unknown Username"}
          </Heading>
          <AvatarGroup spacing="-1rem">
            {conversation.members
              .filter((memberId, i) => i < 3)
              .map((memberId, i) => (
                <Avatar
                  size="sm"
                  key={`member-${i}`}
                  src={usersMap[memberId]?.photoUrl || ""}
                  name={usersMap[memberId]?.displayName || ""}
                />
              ))}
          </AvatarGroup>
        </VStack>
        <VStack alignItems="flex-end">
          {conversation.unreadCount ? (
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
              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
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
  }
  return (
    <Flex
      justifyContent="space-between"
      onClick={onClick}
      cursor="pointer"
      {...glassEffect}
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
        {conversation.unreadCount ? (
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
            {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
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
