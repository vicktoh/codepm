import React, { FC, useEffect, useState } from "react";
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
import {
  listenOnTaskComment,
  removeTask,
  updateDbTask,
  writeComment,
} from "../services/taskServices";
import { useRef } from "react";
import { BsTrash } from "react-icons/bs";
import { Timestamp } from "firebase/firestore";
import { LoadingComponent } from "./LoadingComponent";
import { EmptyState } from "./EmptyState";
import { TaskCommentComponent } from "./TaskCommentComponent";

type TaskFormProps = {
  task: Task;
  onClose: () => void;
};

export const TaskForm: FC<TaskFormProps> = ({ task, onClose }) => {
  const [taskState, setTask] = useState<Task>(task);
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

  const [comments, setComments] = useState<string>("");

  const { users, auth } = useAppSelector(({ users, auth }) => ({
    users,
    auth,
  }));
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

  const addComment = async () => {
    if (!task.id) return;
    const userComment: TaskComment = {
      comment: comments,
      userId: auth?.uid || "",
      timestamp: Timestamp.now(),
    };
    await writeComment(task.projectId, task.id, userComment);
    setComments("");
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

      <Box mt={3}>
        <Heading fontSize="md" my={3}>
          🎯 Status
        </Heading>
        <StatusPopover currentStatus={taskState.status} onSelect={selectStatus}>
          <Box alignSelf="flex-start" cursor="pointer">
            <Badge size="lg" colorScheme={STATUS_COLORSCHEME[taskState.status]}>
              {taskState.status}
            </Badge>
          </Box>
        </StatusPopover>
      </Box>

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
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          ></Textarea>
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
      <Flex
        px={5}
        direction="row-reverse"
        mt={8}
        justifyContent="space-between"
      >
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
      </Flex>
    </Flex>
  );
};
