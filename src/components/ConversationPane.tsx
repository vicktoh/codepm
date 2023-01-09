import {
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Text,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import { Timestamp } from "firebase/firestore";
import React, {
  FC,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BsChevronLeft, BsPlus } from "react-icons/bs";
import { useAppSelector } from "../reducers/types";
import {
  addNewMembersToConversation,
  listenOnChats,
  markAsRead,
  sendChat,
} from "../services/chatServices";
import { Chat } from "../types/Chat";
import { Conversation } from "../types/Conversation";
import { ChatList } from "./ChatList";
import { UserListPopover } from "./UserListPopover";
type ConversationPaneProps = {
  conversation: Conversation;
  toggleView: () => void;
};
export const ConversationPane: FC<ConversationPaneProps> = ({
  conversation,
  toggleView,
}) => {
  const { users, auth, profile } = useAppSelector(
    ({ users, auth, profile }) => ({
      users,
      profile,
      auth,
    }),
  );
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });
  const recipientId = useMemo(() => {
    const recp = conversation.members.filter(
      (memberId) => memberId !== auth?.uid,
    );
    return recp[0];
  }, [conversation.members, auth?.uid]);
  const [chats, setChats] = useState<Chat[]>();
  const [loading, setLoading] = useState<boolean>();
  const [addingMembers, setAddingMembers] = useState<boolean>();
  const [members, setMembers] = useState<string[]>(conversation.members || []);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const toast = useToast();
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!conversation.id) return;
    setLoading(true);
    try {
      const unsub = listenOnChats(conversation.id, (chts) => {
        setLoading(false);
        setChats(chts);
      });
      return () => unsub();
    } catch (error) {
      // console.log(error);
    }
  }, [conversation.id]);

  useEffect(() => {
    setTimeout(() => {
      if (!chats || !chats.length) return;
      if (chats[chats.length - 1]?.senderId !== auth?.uid) {
        try {
          markAsRead(auth?.uid || "", conversation.id || "");
        } catch (error) {
          // console.log(error);
        }
      }
    }, 1200);
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 800);
  }, [chats, auth?.uid, conversation.id]);

  const sendChatMessage = async () => {
    if (!chatMessage) return;
    const newchat: Chat = {
      text: chatMessage,
      ...(conversation.type === "private" ? { recieverId: recipientId } : {}),
      timestamp: Timestamp.now(),
      senderId: auth?.uid || "",
      sender: {
        photoUrl: profile?.photoUrl || "",
        displayName: auth?.displayName || "",
      },
      members,
      conversationId: conversation.id || "",
    };
    try {
      setSending(true);
      await sendChat(conversation.id || "", newchat);
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
  const onAddMembersToGroup = async () => {
    setAddingMembers(true);
    try {
      await addNewMembersToConversation(conversation, members);
    } catch (error) {
      const err: any = error;
      // console.log(err);
    } finally {
      setAddingMembers(false);
    }
  };
  const onSelectMember = (userId: string) => {
    const membersCopy = [...members];
    const index = membersCopy.indexOf(userId);
    if (index > -1) {
      membersCopy.splice(index, 1);
    } else {
      membersCopy.push(userId);
    }

    setMembers(membersCopy);
  };
  return (
    <Flex
      position="relative"
      flex="1 1"
      overflowY="auto"
      direction="column"
      width="100%"
      px={5}
      pt={5}
      pb="80px"
    >
      <HStack justifyContent="space-between">
        {isMobile ? (
          <IconButton
            onClick={toggleView}
            aria-label="go back"
            icon={<Icon as={BsChevronLeft} />}
          />
        ) : null}
        <Heading fontSize="md">{`Conversation with ${
          conversation.title ||
          (users?.usersMap ? users.usersMap[recipientId]?.displayName : "")
        }`}</Heading>
        {conversation.type === "group" ? (
          <UserListPopover
            onCloseSuccess={onAddMembersToGroup}
            assignees={members}
            onSelectUser={onSelectMember}
          >
            <Button
              isLoading={addingMembers}
              loadingText="Adding Member(s)"
              ml="auto"
              variant="outline"
              leftIcon={<Icon as={BsPlus} />}
            >
              Add Members
            </Button>
          </UserListPopover>
        ) : null}
      </HStack>
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
