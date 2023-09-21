import React, { FC, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Link,
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  AiFillClockCircle,
  AiOutlineClockCircle,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlinePlus,
  AiOutlineSave,
} from "react-icons/ai";
import { useAppSelector } from "../reducers/types";
import {
  Document,
  Task,
  TaskComment,
  TaskStatus,
  TimePeriod,
  TodoItem,
} from "../types/Project";
import { DuedatePopover } from "./DuedatePopover";
import { UserListPopover } from "./UserListPopover";
import { format } from "date-fns";
import { STATUS_COLORSCHEME } from "../constants";
import { StatusPopover } from "./StatusPopover";
import { DocumentPopover } from "./DocumentPopover";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { TodoItemComponent } from "./TodoItemComponent";
import { MentionsInput, Mention, MentionItem } from "react-mentions";

import {
  listenOnTaskComment,
  removeTask,
  updateDbTask,
  writeComment,
} from "../services/taskServices";
import { useRef } from "react";
import {
  BsFillLightningFill,
  BsLightningCharge,
  BsTrash,
} from "react-icons/bs";
import { Timestamp } from "firebase/firestore";
import { LoadingComponent } from "./LoadingComponent";
import { EmptyState } from "./EmptyState";
import { TaskCommentComponent } from "./TaskCommentComponent";
import {
  sendMultipleNotification,
  sendNotification,
} from "../services/notificationServices";
import mentionStyle from "../helpers/mentionstyle";
import { assign } from "lodash";
import { setNotification } from "../reducers/notificationSlice";
type TaskFormProps = {
  task: Task;
  onClose: () => void;
};

export const TaskForm: FC<TaskFormProps> = ({ task, onClose }) => {
  const { _highlightResult, ...restTask } = task as any;
  const { users, auth } = useAppSelector(({ users, auth }) => ({
    users,
    auth,
  }));
  const [mentions, setMentions] = useState<MentionItem[]>([]);
  const [taskState, setTask] = useState<Task>(restTask);
  const [isRequestingReview, setIsRequestingReview] = useState<boolean>(false);
  const [editModeTitle, setEditModeTitle] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [taskComments, setTaskComments] = useState<TaskComment[]>();
  const [fetchingComments, setFetchingComments] = useState(false);
  const myRef = useRef();
  const [saving, setSaving] = useState<boolean>(false);
  const [editModeDescription, setEditModeDescription] =
    useState<boolean>(false);
  const [title, setTitle] = useState<string>(task.title);
  const [description, setDescription] = useState<string>(
    task?.description || "",
  );
  const [chatmention, setChatMention] = useState<string>("");
  const chatMembers = useMemo(() => {
    return (users?.users || []).map(({ userId, displayName }) => ({
      id: userId,
      display: displayName || "Unknown user",
    }));
  }, [users]);
  const [comments, setComments] = useState<string>("");
  const onChangeMention = (
    e: any,
    newValue: string,
    newPlainTextValue: string,
    newMentions: MentionItem[],
  ) => {
    setChatMention(e.target.value);
    setComments(newPlainTextValue);
    if (newMentions.length) {
      setMentions((m) => [...m, ...newMentions]);
    } else {
      const mens = mentions.filter(
        (men) => newPlainTextValue.indexOf(`${men.display}`) > -1,
      );
      setMentions(mens);
    }
  };

  const glassEffect = useGlassEffect(true, "lg");
  const toast = useToast();

  useEffect(() => {
    const saveTask = async () => {
      if (myRef.current) {
        myRef.current = undefined;
        return;
      }
      try {
        setSaving(true);
        await updateDbTask(taskState.projectId, taskState.id || "", taskState);
      } catch (error) {
        const err: any = error;
        toast({
          title: "Unable to save Task",
          description: err?.message || "Unknown error",
          status: "error",
        });
      } finally {
        setSaving(false);
      }
    };
    saveTask();
  }, [taskState, toast]);

  useEffect(() => {
    const fetchTaskComment = () => {
      return listenOnTaskComment(task.projectId, task.id || "", (comments) => {
        setTaskComments(comments);
        setFetchingComments(false);
      });
    };
    const unsub = fetchTaskComment();

    return unsub;
  }, [task.id, task.projectId]);
  const saveProjectTitle = async () => {
    setTask((task) => ({ ...task, title }));
    setEditModeTitle(false);
  };
  const saveDescription = async () => {
    setTask((task) => ({ ...task, description }));
    setEditModeDescription(false);
  };

  const addAssignees = (userId: string) => {
    const assignees = [...(taskState.assignees || [])];
    const index = assignees.indexOf(userId);
    if (index > -1) {
      assignees.splice(index, 1);
    } else {
      assignees.push(userId);
      sendNotification({
        reciepientId: userId,
        title: `New Task: (${task.projectTitle})`,
        read: false,
        timestamp: Timestamp.now(),
        description: `You have been assigned a task ${task.title} by ${
          auth?.displayName || "Unknown user"
        } click the link to view`,
        linkTo: `dashboard/projects/${task.projectId}/${task.workplanId}`,
        type: "tasks",
      });
    }
    setTask((task) => ({ ...task, assignees }));
  };

  const addDueDate = (values: TimePeriod) => {
    setTask((task) => ({ ...task, dueDate: values }));
  };
  const selectStatus = (status: TaskStatus) => {
    if (status === TaskStatus.completed && auth?.uid !== task.creatorId) {
      toast({
        title: "Only the creator of this task can mark it as complete",
        status: "warning",
      });
      return;
    }
    setTask((task) => ({ ...task, status }));
  };

  const addDocument = (document: Document) => {
    const attachments = [...(taskState?.attachments || [])];
    attachments.push(document);
    setTask((task) => ({ ...task, attachments }));
  };

  const editDocument = async (i: number) => {
    const attachments = [...(taskState.attachments || [])];

    return (document: Document) => {
      attachments[i] = document;
      setTask((task) => ({ ...task, attachments }));
    };
  };
  const deleteDocument = (i: number) => {
    const attachments = [...(taskState.attachments || [])];
    attachments.splice(i, 1);
    setTask((task) => ({ ...task, attachments }));
  };

  const requestReview = async () => {
    try {
      setIsRequestingReview(true);
      const reciepients = [...(task.assignees || []), task.creatorId].filter(
        (userId) => userId !== auth?.uid,
      );
      await sendMultipleNotification(reciepients, {
        title: "Task needs review",
        description: `${auth?.displayName || ""} is requesting the task ${
          task.title
        } to be reviewed`,
        linkTo: `/dashboard/projects/${task.projectId}/${task.workplanId}`,
        type: "tasks",
      });
      toast({
        title: "Review successfully requested",
        description:
          "A notification has been sent to concerning parties for review",
        status: "success",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Something went wrong!, please try again",
        status: "error",
      });
    } finally {
      setIsRequestingReview(false);
    }
  };

  const addComment = async () => {
    if (task.id === undefined) return;
    const userComment: TaskComment = {
      comment: comments,
      userId: auth?.uid || "",
      timestamp: Timestamp.now(),
    };
    await writeComment(task.projectId, task.id, userComment);
    // Send notification to all those assiged
    task.assignees &&
      sendMultipleNotification(task.assignees, {
        title: `Comment: (${task.projectTitle}) - ${task.title}`,
        description: `${
          auth?.displayName || "Unknown user"
        } says "${userComment}"`,
        linkTo: `/dashboard/projects/${task.projectId}/${task.workplanId}`,
        type: "tasks",
      });

    // Send notification to all those mentioned
    if (mentions.length) {
      sendMultipleNotification(
        mentions.map(({ id }) => id),
        {
          title: `Task mention `,
          description: `You were mentioned by ${auth?.displayName}  in (${task.projectTitle} - ${task.title} ):
           """${comments}"""`,
          type: "tasks",
          linkTo: `/dashboard/${task.id}`,
        },
      );
    }
    setComments("");
    setMentions([]);
  };
  // Todo list actions

  const checkTodoItem = (index: number, value: boolean) => {
    const todo = [...(taskState.todo || [])];
    todo[index].checked = value;
    setTask((task) => ({ ...task, todo }));
  };
  const setTodoLabel = (index: number, value: string) => {
    const todo = [...(taskState.todo || [])];
    todo[index].label = value;
    setTask((task) => ({ ...task, todo }));
  };
  const addNewTodoItem = () => {
    const todo: TodoItem[] = [
      ...(taskState.todo || []),
      { label: "", checked: false },
    ];
    setTask((task) => ({ ...task, todo }));
  };

  const removeTodoItem = (index: number) => {
    const todo = [...(taskState.todo || [])];
    todo.splice(index, 1);
    setTask((task) => ({ ...task, todo }));
  };
  const markUrgent = async () => {
    try {
      await updateDbTask(task.projectId, task.id || "", {
        isUrgent: !!!taskState.isUrgent,
      });
      setTask((task) => ({ ...task, isUrgent: !!!taskState.isUrgent }));
    } catch (error) {
      toast({
        title: "Something went wrong",
        status: "error",
      });
    }
  };

  const deleteTask = async () => {
    try {
      setDeleting(true);
      await removeTask(taskState.projectId, taskState);
      setDeleting(false);
      onClose();
    } catch (error) {
      const err: any = error;
      setDeleting(false);
      toast({
        title: "Could not delete task",
        description: err?.message || "Unexpected error try again",
        status: "error",
      });
    }
  };

  return (
    <Flex direction="column" px={5} py={3} ref={myRef.current}>
      {editModeTitle ? (
        <HStack alignItems="center">
          <Input
            size="lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveProjectTitle}
          />
          <IconButton
            size="sm"
            aria-label="save title"
            transition="background 700ms ease-out"
            variant="ghost"
            borderRadius="full"
            _hover={{
              background: "brand.400",
              color: "white",
            }}
            onClick={saveProjectTitle}
            icon={<Icon as={AiOutlineSave} />}
          />
        </HStack>
      ) : (
        <HStack alignItems="center" spacing={4}>
          <Heading my={3}>{taskState.title}</Heading>
          <IconButton
            onClick={() => setEditModeTitle(true)}
            aria-label="edit title"
            icon={<Icon as={AiOutlineEdit} />}
            size="sm"
            variant="ghost"
            transition="background 700ms ease-out"
            borderRadius="full"
            _hover={{
              background: "brand.400",
              color: "white",
            }}
          />
        </HStack>
      )}

      {task.creatorId ? (
        <Box mt={3}>
          <VStack spacing={3} alignItems="start">
            <Heading fontSize="md">🧒🏽 Created By</Heading>
            <Avatar
              size="md"
              src={users?.usersMap[task.creatorId]?.photoUrl}
              name={
                users?.usersMap[task.creatorId]?.displayName || "Unkown user"
              }
            />
          </VStack>
        </Box>
      ) : null}
      <Box mt={3}>
        <HStack>
          <Heading fontSize="md" my={3}>
            📝 Description
          </Heading>
          {!editModeDescription ? (
            <IconButton
              variant="ghost"
              transition="background 700ms ease-out"
              borderRadius="full"
              _hover={{
                background: "brand.400",
                color: "white",
              }}
              onClick={() => setEditModeDescription(true)}
              aria-label="edit title"
              icon={<Icon as={AiOutlineEdit} />}
              size="sm"
            />
          ) : null}
        </HStack>
        {editModeDescription ? (
          <Textarea
            height={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={saveDescription}
          />
        ) : (
          <Text>{taskState?.description || "No Description Yet"}</Text>
        )}
      </Box>

      <Flex gap={5} mt={3}>
        <Box>
          <Heading fontSize="md" my={3}>
            🎯 Status
          </Heading>
          <StatusPopover
            currentStatus={taskState.status}
            onSelect={selectStatus}
          >
            <Box alignSelf="flex-start" cursor="pointer">
              <Badge
                size="lg"
                colorScheme={STATUS_COLORSCHEME[taskState.status]}
              >
                {taskState.status}
              </Badge>
            </Box>
          </StatusPopover>
        </Box>
        {auth?.uid !== taskState.creatorId ? (
          <Button
            alignSelf="flex-end"
            size="sm"
            variant="outline"
            colorScheme="brand"
            isLoading={isRequestingReview}
            onClick={requestReview}
          >
            Reques review from owner
          </Button>
        ) : null}
      </Flex>

      <Box mt={3}>
        <HStack>
          <Heading fontSize="md">👨🏿 Assigned to</Heading>
          <UserListPopover
            assignees={taskState.assignees || []}
            onSelectUser={addAssignees}
          >
            <IconButton
              aria-label="assign to user"
              icon={<Icon as={AiOutlinePlus} />}
              transition="background 700ms ease-out"
              variant="ghost"
              borderRadius="full"
              _hover={{
                background: "brand.400",
                color: "white",
              }}
            />
          </UserListPopover>
        </HStack>
        {taskState?.assignees && taskState.assignees.length ? (
          <AvatarGroup spacing="-1rem">
            {taskState.assignees.map((userId) => (
              <Avatar
                key={`assignees-${userId}`}
                src={users?.usersMap ? users.usersMap[userId]?.photoUrl : ""}
                name={
                  users?.usersMap
                    ? users.usersMap[userId]?.displayName
                    : "Unknow User"
                }
                size="md"
              />
            ))}
          </AvatarGroup>
        ) : (
          <Text>Not assigned to anyone yet</Text>
        )}
      </Box>
      <Box mt={3}>
        <HStack>
          <Heading fontSize="md">🕘 Dates</Heading>
          <DuedatePopover
            saveTask={() => null}
            onSubmit={addDueDate}
            timePeriod={taskState.dueDate}
          >
            <IconButton
              aria-label="assign to user"
              icon={<Icon as={AiOutlinePlus} />}
              transition="background 700ms ease-out"
              variant="ghost"
              borderRadius="full"
              _hover={{
                background: "brand.400",
                color: "white",
              }}
            />
          </DuedatePopover>
          {taskState.isUrgent ? (
            <Badge colorScheme="red">
              <Icon as={BsLightningCharge} />
              Urgent
            </Badge>
          ) : null}
        </HStack>
        {taskState.dueDate ? (
          <HStack spacing={2}>
            {taskState.dueDate.startDate ? (
              <HStack spacing={1}>
                <Icon
                  as={AiOutlineClockCircle}
                  fontSize="md"
                  color="blue.900"
                />
                <Text fontSize="md" color="blue.900">{`Start date: ${format(
                  new Date(taskState.dueDate.startDate),
                  "do MMM Y",
                )} - `}</Text>
              </HStack>
            ) : null}
            {taskState.dueDate.dueDate ? (
              <HStack spacing={1}>
                <Icon
                  as={AiOutlineClockCircle}
                  fontSize="md"
                  color="blue.900"
                />
                <Text fontSize="md" color="blue.900">{`Due date: ${format(
                  new Date(taskState.dueDate.dueDate),
                  "do MMM Y",
                )}`}</Text>
              </HStack>
            ) : null}
          </HStack>
        ) : (
          <Text>No Due dates assigned</Text>
        )}
      </Box>
      <Box mt={3}>
        <HStack>
          <Heading fontSize="md" my={3}>
            🧷 Attachments
          </Heading>
          <DocumentPopover onSubmit={addDocument}>
            <IconButton
              aria-label="assign to user"
              icon={<Icon as={AiOutlinePlus} />}
              transition="background 700ms ease-out"
              variant="ghost"
              borderRadius="full"
              _hover={{
                background: "brand.400",
                color: "white",
              }}
            />
          </DocumentPopover>
        </HStack>

        {taskState?.attachments && taskState.attachments.length ? (
          <HStack wrap="wrap">
            {taskState.attachments.map((document, i) => (
              <HStack
                {...glassEffect}
                bg="brand.300"
                px={4}
                py={2}
                spacing={3}
                key={`document-${i}`}
                borderWidth={1}
                borderColor="gray.100"
              >
                <Text>{document.title}</Text>
                <IconButton
                  size="xs"
                  as={Link}
                  href={document.url}
                  isExternal={document.url}
                  aria-label="view document"
                  icon={<Icon as={AiOutlineEye} color="blue.600" />}
                />
                <DocumentPopover
                  onSubmit={() => editDocument(i)}
                  document={document}
                  key={`document-${i}`}
                >
                  <IconButton
                    size="xs"
                    aria-label="edit document"
                    icon={<Icon as={AiOutlineEdit} color="purple.600" />}
                  />
                </DocumentPopover>
                <IconButton
                  size="xs"
                  onClick={() => deleteDocument(i)}
                  aria-label="delete document"
                  icon={<Icon as={AiOutlineDelete} color="blue.600" />}
                />
              </HStack>
            ))}
          </HStack>
        ) : (
          <Text>No attachement yet</Text>
        )}
      </Box>
      <Box mt={3}>
        <HStack>
          <Heading fontSize="medium">📝 Todo List</Heading>
          <IconButton
            onClick={addNewTodoItem}
            aria-label="add todo Item"
            icon={<Icon as={AiOutlinePlus} />}
            transition="background 700ms ease-out"
            variant="ghost"
            borderRadius="full"
            _hover={{
              background: "brand.400",
              color: "white",
            }}
          />
        </HStack>
        {taskState.todo?.length ? (
          taskState.todo.map((todo, i) => (
            <TodoItemComponent
              key={`todoItem-${i}`}
              onRemoveTodoItem={removeTodoItem}
              todoItem={todo}
              index={i}
              onCheckTodo={checkTodoItem}
              onSetTodoLabel={setTodoLabel}
            />
          ))
        ) : (
          <Text>No Todo Item yet</Text>
        )}
      </Box>
      <Box mt={3}>
        <Heading fontSize="medium">💬 Comments</Heading>
        <Flex direction="column" mt={3}>
          {/* <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          ></Textarea> */}
          <MentionsInput
            onChange={onChangeMention}
            value={comments}
            style={mentionStyle}
          >
            <Mention
              trigger="@"
              data={chatMembers}
              displayTransform={(_, display) => "@" + display}
            />
          </MentionsInput>
          <Button
            colorScheme="brand"
            size="sm"
            alignSelf="flex-end"
            mt={3}
            onClick={addComment}
          >
            Save
          </Button>
          <Flex direction="column">
            {fetchingComments ? (
              <LoadingComponent />
            ) : taskComments?.length ? (
              taskComments.map((taskComment, i) => (
                <TaskCommentComponent
                  task={task}
                  comment={taskComment}
                  key={taskComment.id || i}
                />
              ))
            ) : (
              <EmptyState title="No comments yet" />
            )}
          </Flex>
        </Flex>
      </Box>
      {saving ? (
        <HStack position="absolute" right={5} top={5} spacing={4}>
          <Icon color="brand.300" as={AiFillClockCircle} fontSize="xs" />
          <Text fontSize="xs">Saving....</Text>
        </HStack>
      ) : null}
      <Flex px={5} direction="row" mt={8} justifyContent="space-between">
        {auth?.uid === task.creatorId ? (
          <Button
            size="sm"
            isLoading={deleting}
            onClick={() => deleteTask()}
            bg="red.400"
            textColor="white"
            leftIcon={<Icon as={BsTrash} />}
          >
            Delete
          </Button>
        ) : null}
        {auth?.uid === task.creatorId ? (
          <Button
            size="sm"
            onClick={markUrgent}
            colorScheme={taskState.isUrgent ? "blue" : "brand"}
            variant="outline"
            leftIcon={<Icon as={BsFillLightningFill} />}
          >
            {taskState.isUrgent ? "Unmark as urgent" : "Mark as Urgent"}
          </Button>
        ) : null}
      </Flex>
    </Flex>
  );
};
