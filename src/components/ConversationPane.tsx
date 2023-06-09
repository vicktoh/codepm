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
import { MentionsInput, Mention, MentionItem } from "react-mentions";
import mentionInputStyle from "../helpers/mentionstyle";
import React, {
  FC,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BsChevronLeft,
  BsFileMinus,
  BsPlus,
  BsShieldMinus,
  BsSubtract,
} from "react-icons/bs";
import { useAppSelector } from "../reducers/types";
import {
  addNewMembersToConversation,
  listenOnChats,
  markAsRead,
  removeMembersFromConversation,
  sendChat,
} from "../services/chatServices";
import { Chat } from "../types/Chat";
import { Conversation } from "../types/Conversation";
import { ChatList } from "./ChatList";
import { UserListPopover } from "./UserListPopover";
import { sendMultipleNotification } from "../services/notificationServices";
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
  const [chatmention, setChatMention] = useState<string>("");
  const [mentions, setMentions] = useState<MentionItem[]>([]);
  const [loading, setLoading] = useState<boolean>();
  const [addingMembers, setAddingMembers] = useState<boolean>();
  const [removingMembers, setRemovingMembers] = useState<boolean>();
  const [members, setMembers] = useState<string[]>([]);
  const [membersToRemove, setMembersToRemove] = useState<string[]>([]);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const toast = useToast();
  console.log({ chatmention });
  const chatParse = useMemo(() => {
    const matches = chatmention.matchAll(/@\[(.*?)]\((.*?):(\d+)\)/g);
    // eslint-disable-next-line guard-for-in
    for (const match in matches) {
      console.log(match);
    }
  }, [chatmention]);
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
    setMembers([]);
    setMembersToRemove([]);
  }, [conversation.members]);
  const nonMembers = useMemo(() => {
    return users?.users
      .filter((user) => !conversation.members.includes(user.userId))
      .map(({ userId }) => userId);
  }, [conversation.members, users?.users]);

  useEffect(() => {
    setTimeout(() => {
      if (!auth?.uid) return;
      if (!chats || !chats.length) return;
      // if (chats[chats.length - 1]?.senderId !== auth?.uid) {

      // }
      try {
        console.log("marking as read");
        markAsRead(auth?.uid || "", conversation.id || "", {
          ...(conversation.conversation || {}),
          [auth.uid]: chats.length,
        });
      } catch (error) {
        // console.log(error);
      }
    }, 1200);
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 800);
  }, [chats, auth?.uid, conversation.id, conversation.conversation]);

  const sendChatMessage = async () => {
    if (!auth?.uid) {
      toast({
        title: "Please login to send a message",
        status: "error",
        isClosable: true,
      });
      return;
    }
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
    const newConversation = {
      ...conversation.conversation,
      [auth.uid]: (chats?.length || 0) + 1,
    };
    try {
      setSending(true);
      await sendChat(
        conversation.id || "",
        newchat,
        conversation.members,
        (chats?.length || 0) + 1,
        newConversation,
      );
      if (mentions.length) {
        sendMultipleNotification(
          mentions.map(({ id }) => id),
          {
            title: `💬 Chat Mention`,
            description: `You were mentioned in a chat by ${auth?.displayName}`,
            type: "tasks",
            linkTo: "/chat",
          },
        );
        setMentions([]);
      }
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

  const onChangeMention = (
    e: any,
    newValue: string,
    newPlainTextValue: string,
    mentions: MentionItem[],
  ) => {
    setChatMention(e.target.value);
    setChatMessage(newPlainTextValue);
    setMentions(mentions);
  };
  const onAddMembersToGroup = async () => {
    setAddingMembers(true);
    try {
      await addNewMembersToConversation(conversation, members);
      setMembers([]);
    } catch (error) {
      const err: any = error;
      console.log(error);
    } finally {
      setAddingMembers(false);
    }
  };
  const onRemoveMembersFromGroup = async () => {
    if (!membersToRemove.length) return;
    setRemovingMembers(true);
    const newMembers = conversation.members.filter(
      (m) => !membersToRemove.includes(m),
    );
    try {
      await removeMembersFromConversation(
        conversation,
        newMembers,
        membersToRemove,
      );
      setMembersToRemove([]);
    } catch (error) {
      const err: any = error;
      // console.log(err);
    } finally {
      setRemovingMembers(false);
    }
  };
  const onSelectMember = (userId: string, toRemove = false) => {
    const membersCopy = [...(toRemove ? membersToRemove : members)];
    const index = membersCopy.indexOf(userId);
    if (index > -1) {
      membersCopy.splice(index, 1);
    } else {
      membersCopy.push(userId);
    }

    toRemove ? setMembersToRemove(membersCopy) : setMembers(membersCopy);
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
      <Flex
        direction={isMobile ? "column" : "row"}
        justifyContent={isMobile ? "flex-start" : "space-between"}
      >
        {isMobile ? (
          <IconButton
            onClick={toggleView}
            aria-label="go back"
            alignSelf={isMobile ? "flex-start" : undefined}
            icon={<Icon as={BsChevronLeft} />}
          />
        ) : null}
        <Heading my={isMobile ? "3" : 0} fontSize="md">{`Conversation with ${
          conversation.title ||
          (users?.usersMap ? users.usersMap[recipientId]?.displayName : "")
        }`}</Heading>
        {conversation.type === "group" &&
        conversation.creatorId === auth?.uid ? (
          <HStack>
            <UserListPopover
              onCloseSuccess={onRemoveMembersFromGroup}
              assignees={membersToRemove}
              onSelectUser={(userId) => onSelectMember(userId, true)}
              omit={nonMembers}
            >
              <Button
                isLoading={removingMembers}
                loadingText="Adding Member(s)"
                ml="auto"
                size="xs"
                variant="outline"
                leftIcon={<Icon as={BsShieldMinus} />}
              >
                Remove Members
              </Button>
            </UserListPopover>
            <UserListPopover
              onCloseSuccess={onAddMembersToGroup}
              assignees={members}
              onSelectUser={onSelectMember}
              omit={conversation.members}
            >
              <Button
                isLoading={addingMembers}
                loadingText="Adding Member(s)"
                ml="auto"
                size="xs"
                variant="outline"
                leftIcon={<Icon as={BsPlus} />}
              >
                Add Members
              </Button>
            </UserListPopover>
          </HStack>
        ) : null}
      </Flex>
      <Flex flex="1 1" overflowY="auto" direction="column">
        <Flex direction="column" width="100%" mt="auto" px={2}>
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
        position="absolute"
        right={0}
        bottom={isMobile ? 10 : 5}
      >
        <HStack width="100%" spacing={2}>
          {/* <MentionsInput
            placeholder="Enter your message here"
            value={chatmention}
            onChange={onChangeMention}
            style={mentionInputStyle}
            allowSuggestionsAboveCursor={true}
            forceSuggestionsAboveCursor={true}
          >
            <Mention
              trigger="@"
              data={
                users?.users.map(({ email, userId }) => ({
                  id: userId,
                  display: email,
                })) || []
              }
            />
          </MentionsInput> */}
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
