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
  Textarea,
  VStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverBody,
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
  BsFilePlus,
  BsPencil,
  BsPlus,
  BsSave,
  BsShieldMinus,
  BsSubtract,
  BsThreeDots,
} from "react-icons/bs";
import { useAppSelector } from "../reducers/types";
import {
  addNewAdminsToConversation,
  addNewMembersToConversation,
  changeGroupName,
  exitConversation,
  listenOnChats,
  markAsRead,
  removeAdminsFromGrop,
  removeMembersFromConversation,
  sendChat,
} from "../services/chatServices";
import { Chat } from "../types/Chat";
import { Conversation } from "../types/Conversation";
import { ChatList } from "./ChatList";
import { UserListPopover } from "./UserListPopover";
import { sendMultipleNotification } from "../services/notificationServices";
import {
  AiOutlineUsergroupAdd,
  AiOutlineUsergroupDelete,
} from "react-icons/ai";
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
  const [uploading, setUploading] = useState<boolean>();

  const [addingMembers, setAddingMembers] = useState<boolean>();
  const [removingMembers, setRemovingMembers] = useState<boolean>();
  const [addingAdmins, setAddingAdmins] = useState<boolean>();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [title, setTitle] = useState<string>(conversation.title || "");
  const [editingTitle, setEditingTitle] = useState<boolean>();
  const [exiting, setExiting] = useState<boolean>();
  const [removingAdmins, setRemovingAdmins] = useState<boolean>();
  const [members, setMembers] = useState<string[]>([]);
  const [membersToRemove, setMembersToRemove] = useState<string[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [adminsToRemove, setAdminsToRemove] = useState<string[]>([]);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const toast = useToast();
  const chatMembers = useMemo(() => {
    return (conversation.members || []).map((userId) => ({
      id: userId,
      display: users?.usersMap[userId]?.displayName || "Unknown",
    }));
  }, [conversation.members, users]);
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
  const nonAdmins = useMemo(() => {
    return users?.users
      .filter((user) => !(conversation.admins || []).includes(user.userId))
      .map(({ userId }) => userId);
  }, [conversation.admins, users?.users]);

  useEffect(() => {
    setTimeout(() => {
      if (!auth?.uid) return;
      if (!chats || !chats.length) return;
      // if (chats[chats.length - 1]?.senderId !== auth?.uid) {

      // }
      try {
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
            title: `💬 Chat Mention ${
              conversation.type === "group" ? `(${conversation.title})` : ""
            }`,
            description: `You were mentioned in a chat by ${auth?.displayName}
             """${newchat.text}"""`,
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
  const onEditTitle = async () => {
    try {
      setEditingTitle(true);
      await changeGroupName(title, conversation);
      setMode("view");
    } catch (error) {
      const err = error as any;
      toast({
        description: err?.message || "Unexpected error",
        title: "Error",
        status: "error",
      });
    } finally {
      setEditingTitle(false);
    }
  };
  const onEnterChat = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      // sendChatMessage();
      e.preventDefault();
    }
  };

  const onChangeMention = (
    e: any,
    newValue: string,
    newPlainTextValue: string,
    newMentions: MentionItem[],
  ) => {
    setChatMention(e.target.value);
    setChatMessage(newPlainTextValue);
    if (newMentions.length) {
      setMentions((m) => [...m, ...newMentions]);
    } else {
      const mens = mentions.filter(
        (men) => newPlainTextValue.indexOf(`${men.display}`) > -1,
      );
      setMentions(mens);
    }
  };
  const onAddAdminToGroup = async () => {
    if (!admins.length) return;
    setAddingAdmins(true);
    try {
      await addNewAdminsToConversation(conversation, admins);
      sendMultipleNotification(admins, {
        title: `🔐 Admin Added`,
        description: `You were added as an admin in a group "${conversation.title}" by ${auth?.displayName}`,
        type: "tasks",
        linkTo: "/chat",
      });
      setAdmins([]);
    } catch (e) {
      const err: any = e;
      toast({
        description: err?.message || "Unexpected error",
        title: "Error",
        status: "error",
      });
    } finally {
      setAddingAdmins(false);
    }
  };

  const onAddMembersToGroup = async () => {
    setAddingMembers(true);
    try {
      await addNewMembersToConversation(conversation, members);
      sendMultipleNotification(members, {
        title: "New Group 👨‍👨‍👦‍👦",
        type: "tasks",
        description: `You have been added to a new group ${conversation.title} by ${auth?.displayName}`,
        linkTo: "/chat",
      });
      setMembers([]);
    } catch (error) {
      const err: any = error;
      console.log(error);
    } finally {
      setAddingMembers(false);
    }
  };
  const onExitGroup = async () => {
    if (!auth?.uid) {
      toast({
        title: "Please login again",
        status: "error",
        isClosable: true,
      });
      return;
    }
    const members = [...conversation.members];
    const index = members.findIndex((member) => member === auth.uid);
    if (index !== -1) {
      members.splice(index, 1);
      const admins = [...(conversation.admins || [])];
      const adminIndex = admins.findIndex((admin) => admin === auth.uid);
      if (adminIndex !== -1) {
        admins.splice(adminIndex, 1);
      }
      try {
        setExiting(true);
        await exitConversation(conversation, { members, admins }, auth.uid);
        sendMultipleNotification(conversation.members, {
          title: "Exit Group",
          type: "tasks",
          description: ` ${auth?.displayName} has exited the group ${conversation.title}`,
          linkTo: "/chat",
        });
      } catch (error) {
        const err = error as any;
        toast({
          description: err?.message || "Unexpected error",
          title: "Error",
          status: "error",
        });
      } finally {
        setExiting(false);
      }
    }
  };
  const onRemoveAdminsFromGroup = async () => {
    if (!adminsToRemove.length) return;
    setRemovingAdmins(true);
    const newAdmins = (conversation.admins || []).filter(
      (admins) => !adminsToRemove.includes(admins),
    );
    try {
      await removeAdminsFromGrop(conversation, newAdmins);
      setAdminsToRemove([]);
    } catch (error) {
      const err: any = error;
      toast({
        description: err?.message || "Unexpected error",
        title: "Error",
        status: "error",
      });
    } finally {
      setRemovingAdmins(false);
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
  const onSelectAdmin = (userId: string, toRemove = false) => {
    const adminsCopy = [...(toRemove ? adminsToRemove : admins)];
    const index = adminsCopy.indexOf(userId);
    if (index > -1) {
      adminsCopy.splice(index, 1);
    } else {
      adminsCopy.push(userId);
    }

    toRemove ? setAdminsToRemove(adminsCopy) : setAdmins(adminsCopy);
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
        {mode === "view" ? (
          <HStack spacing={2} alignItems="center">
            <Heading my={isMobile ? "3" : 0} fontSize="md">{`${
              conversation.type === "private" ? "Conversation with" : ""
            } ${
              conversation.title ||
              (users?.usersMap ? users.usersMap[recipientId]?.displayName : "")
            }`}</Heading>
            {conversation.type === "group" &&
            (conversation.creatorId === auth?.uid ||
              (conversation.admins || []).includes(auth?.uid || "")) ? (
              <IconButton
                onClick={() => setMode("edit")}
                aria-label="Edit Group name"
                variant="outline"
                size="sm"
                icon={<Icon as={BsPencil} fontSize={10} />}
              />
            ) : null}
          </HStack>
        ) : (
          <HStack spacing={2}>
            <Input
              size="sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <IconButton
              onClick={onEditTitle}
              aria-label="Edit Group name"
              isLoading={editingTitle}
              alignSelf={isMobile ? "flex-start" : undefined}
              icon={<Icon as={BsSave} />}
            />
          </HStack>
        )}
      </Flex>
      {conversation.type === "group" &&
      (conversation.creatorId === auth?.uid ||
        (conversation.admins || []).includes(auth?.uid || "")) ? (
        <HStack mt={3} flexWrap="wrap" gap={2}>
          <Button
            isLoading={exiting}
            loadingText="Exiting Group"
            ml="auto"
            size="xs"
            variant="outline"
            onClick={onExitGroup}
          >
            🏃🏾 Exit Group
          </Button>
          <UserListPopover
            onCloseSuccess={onAddAdminToGroup}
            assignees={admins}
            onSelectUser={(userId) => onSelectAdmin(userId)}
            omit={conversation.admins || []}
          >
            <Button
              isLoading={addingAdmins}
              loadingText="Adding Admin(s)"
              ml="auto"
              size="xs"
              variant="outline"
              leftIcon={<Icon as={AiOutlineUsergroupAdd} />}
            >
              Add Admin
            </Button>
          </UserListPopover>
          <UserListPopover
            onCloseSuccess={onRemoveAdminsFromGroup}
            assignees={adminsToRemove}
            onSelectUser={(userId) => onSelectAdmin(userId, true)}
            omit={nonAdmins}
          >
            <Button
              isLoading={removingAdmins}
              loadingText="Removing Admin(s)"
              ml="auto"
              size="xs"
              variant="outline"
              leftIcon={<Icon as={AiOutlineUsergroupDelete} />}
            >
              Remove Admins
            </Button>
          </UserListPopover>
          <UserListPopover
            onCloseSuccess={onRemoveMembersFromGroup}
            assignees={membersToRemove}
            onSelectUser={(userId) => onSelectMember(userId, true)}
            omit={nonMembers}
          >
            <Button
              isLoading={removingMembers}
              loadingText="Removing Member(s)"
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
            chats && <ChatList conversation={conversation} chats={chats} />
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
          {/* <Textarea
            onKeyUp={onEnterChat}
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            variant="outline"
            borderColor="brand.300"
            placeholder="Enter your message here"
            rows={2}
            _placeholder={{
              color: "gray.700",
            }}
          /> */}
          <MentionsInput
            onChange={onChangeMention}
            value={chatMessage}
            style={mentionInputStyle}
          >
            <Mention
              trigger="@"
              data={chatMembers}
              displayTransform={(id, display) => `@${display}`}
              style={{
                backgroundColor: "red",
              }}
            />
          </MentionsInput>

          <HStack>
            <Button
              isLoading={sending}
              onClick={() => sendChatMessage()}
              variant="solid"
              colorScheme="red"
            >
              Send
            </Button>
            {/* <Popover>
              <PopoverTrigger>
                <IconButton icon={<BsThreeDots />} aria-label="add file" />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverHeader></PopoverHeader>
                <PopoverBody>
                  <Flex direction="column" px={5}>
                    <Button size="sm">Add Image</Button>
                  </Flex>
                </PopoverBody>
              </PopoverContent>
            </Popover> */}
          </HStack>
        </HStack>
      </Flex>
    </Flex>
  );
};
