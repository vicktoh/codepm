import React, { FC, useState } from "react";
import {
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import { BsPlus } from "react-icons/bs";
import { RiGroup2Fill } from "react-icons/ri";
import { ConversationList } from "../components/ConversationList";
import { ConversationPane } from "../components/ConversationPane";
import { NewGroupPopover } from "../components/NewGroupPopover";
import { UserListPopover } from "../components/UserListPopover";
import { conversationExist } from "../helpers";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { useAppSelector } from "../reducers/types";
import {
  createNewGroupConversation,
  startConversation,
} from "../services/chatServices";
import { Conversation } from "../types/Conversation";

export const ChatPage: FC = () => {
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
  const [showChatPane, setShowChartPane] = useState<boolean>(!isMobile);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>();
  const [selectedConverstationIndex, setSelectedConverstationIndex] =
    useState<number>();
  const [creatingConversation, setCreatingConversation] =
    useState<boolean>(false);
  const [creatingGroup, setCreatingGroup] = useState<boolean>(false);
  const { conversations, auth } = useAppSelector(({ conversations, auth }) => ({
    conversations,
    auth,
  }));
  const toast = useToast();
  const onCreateNewGroup = async (groupname: string) => {
    try {
      setCreatingGroup(true);
      await createNewGroupConversation(groupname, auth?.uid || "");
    } catch (error) {
      const err: any = error;
      console.log(err);
      toast({
        title: "Could not create group",
        description: err?.message || "Unexpected error",
        status: "error",
      });
    } finally {
      setCreatingGroup(false);
    }
  };
  const selectConversation = (conversation: Conversation, index: number) => {
    setSelectedConversation(conversation);
    setSelectedConverstationIndex(index);
    if (isMobile) setShowChartPane((view) => !view);
  };
  const onCreateConversation = async (userId: string) => {
    const conversation = conversationExist(userId, conversations || []);
    const index = conversations?.findIndex(
      (con) => con.id === conversation?.id,
    );
    if (conversation && index && index >= 0) {
      selectConversation(conversation, index);
      return;
    }

    try {
      setCreatingConversation(true);
      await startConversation(auth?.uid || "", userId, "private");
    } catch (error) {
      console.log(error);
      const err: any = error;
      console.log(err);
    } finally {
      setCreatingConversation(false);
    }
  };
  const glassEffect = useGlassEffect(false, "sm");
  return (
    <Flex width="100%" direction="row" height="100%">
      <Flex
        display={isMobile ? (showChatPane ? "none" : "flex") : "flex"}
        direction="column"
        flex={isMobile ? 1 : 2}
        py={5}
        px={3}
      >
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Heading>Chats</Heading>

          <HStack spacing={5}>
            <UserListPopover
              onSelectUser={onCreateConversation}
              assignees={[]}
              closeOnSelect={true}
            >
              <IconButton
                isLoading={creatingConversation}
                variant="outline"
                aria-label="new chat"
                icon={<Icon as={BsPlus} />}
              />
            </UserListPopover>
            <NewGroupPopover onSubmit={onCreateNewGroup}>
              <IconButton
                variant="outline"
                aria-label="new group chat"
                isLoading={creatingGroup}
                icon={<Icon as={RiGroup2Fill} />}
              />
            </NewGroupPopover>
          </HStack>
        </Flex>
        {isMobile ? (
          showChatPane ? null : (
            <ConversationList
              onSelectConversation={selectConversation}
              selectetdConversation={selectedConversation}
            />
          )
        ) : (
          <ConversationList
            onSelectConversation={selectConversation}
            selectetdConversation={selectedConversation}
          />
        )}
      </Flex>
      <Flex
        ml={isMobile ? 0 : 5}
        display={isMobile ? (showChatPane ? "flex" : "none") : "flex"}
        direction="column"
        flex={isMobile ? 1 : "5 1"}
        bg="whiteAlpha.400"
        borderRadius="lg"
        my={isMobile ? 0 : 5}
      >
        {selectedConversation &&
        conversations &&
        selectedConverstationIndex !== undefined ? (
          <ConversationPane
            toggleView={() => setShowChartPane((view) => !view)}
            conversation={
              conversations[selectedConverstationIndex || 0] ||
              selectedConversation
            }
          />
        ) : null}
      </Flex>
    </Flex>
  );
};
