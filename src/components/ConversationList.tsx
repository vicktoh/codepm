import {
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { FC, useState } from "react";
import { BsChatDots } from "react-icons/bs";
import { isInConversation } from "../helpers";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { useAppSelector } from "../reducers/types";
import { Conversation } from "../types/Conversation";
import { ConversationItem } from "./ConversationItem";

type ConversationListProps = {
  onSelectConversation: (conversaton: Conversation, index: number) => void;
  selectetdConversation?: Conversation;
};
export const ConversationList: FC<ConversationListProps> = ({
  onSelectConversation,
  selectetdConversation,
}) => {
  const [search, setSearch] = useState("");
  const { conversations, users } = useAppSelector(
    ({ conversations, users }) => ({
      conversations,
      users,
    }),
  );

  // const glassEffect = useGlassEffect(true);

  if (!conversations) {
    return (
      <Skeleton>
        <VStack spacing={5}>
          <Skeleton h="2.5rem" width="100" />
          <Skeleton h="2.5rem" width="100" />
          <Skeleton h="2.5rem" width="100" />
        </VStack>
      </Skeleton>
    );
  }

  return conversations.length ? (
    <Flex direction="column" flex="1 1" overflowY="auto">
      <Input
        _placeholder={{ color: "gray.500" }}
        placeholder="Search conversations"
        my={4}
        size="lg"
        variant="filled"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {conversations
        .filter((conversation) => {
          if (search) {
            return isInConversation(
              search,
              conversation.members,
              users?.usersMap || {},
              conversation.title,
            );
          }
          return true;
        })
        .map((conversation, i) => (
          <>
            {console.log(selectetdConversation, conversation.id)}
            <ConversationItem
              key={`conversation-${conversation.id || i}`}
              conversation={conversation}
              onClick={() => onSelectConversation(conversation, i)}
              isSelected={selectetdConversation?.id === conversation.id}
            />
          </>
        ))}
    </Flex>
  ) : (
    <Flex direction="column" bg="white" px={2} py={3} mt={5}>
      <HStack alignItems="center" justifyContent="center" my={3} mx={2}>
        <Icon boxSize={8} as={BsChatDots} />
        <Heading fontSize="xl">Nothing to see here</Heading>
      </HStack>
      <Text my={4} textAlign="center">
        You do not have any chats at the moment you can click the plus sign at
        the top to start a new conversation or group
      </Text>
    </Flex>
  );
};
