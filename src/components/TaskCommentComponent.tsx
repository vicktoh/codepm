import {
  Avatar,
  Button,
  Flex,
  Heading,
  IconButton,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { FC, useState } from "react";
import { useAppSelector } from "../reducers/types";
import { Task, TaskComment } from "../types/Project";
import { FaTimes, FaTrash } from "react-icons/fa";
import { AiFillEdit } from "react-icons/ai";
import { MdCheck } from "react-icons/md";
import { deleteTaskComment, updateTaskComment } from "../services/taskServices";
type TaskCommentProps = {
  task: Task;
  comment: TaskComment;
};
export const TaskCommentComponent: FC<TaskCommentProps> = ({
  task,
  comment,
}) => {
  const { users, auth } = useAppSelector(({ users, auth }) => ({
    users,
    auth,
  }));
  const { usersMap = {} } = users || {};
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [userComment, setUserComment] = useState<string>(comment.comment);
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const onEditTaskComment = async () => {
    if (!task.id || !comment.id) return;
    try {
      setIsEditing(true);
      await updateTaskComment(task.projectId, task.id, comment.id, userComment);
      setMode("view");
    } catch (error) {
      const err: any = error;
      toast({
        description: err?.message || "Unknown error, try again",
        title: "Something went wrong",
        status: "error",
      });
    } finally {
      setIsEditing(false);
    }
  };
  const onDeleteTaskComment = () => {
    if (!task.id || !comment.id) return;
    try {
      setIsDeleting(true);
      deleteTaskComment(task.projectId, task.id, comment.id);
    } catch (error) {
      const err: any = error;
      toast({
        description: err?.message || "Unknown error",
        status: "error",
        title: "Something went wrong",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  if (mode === "view") {
    return (
      <Flex direction="row" key={comment.id || ``} alignItems="center" mt={2}>
        <Avatar
          src={usersMap[comment.userId]?.photoUrl || ""}
          name={usersMap[comment.userId]?.displayName || "unknown user"}
          mr={3}
          size="sm"
          alignSelf="flex-start"
        />
        <Flex direction="column">
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Heading fontSize="md">
              {usersMap[comment.userId]?.displayName}
            </Heading>
            <Text ml={8} fontSize="sm" color="brand.500">
              {format(comment.timestamp.toDate(), "do MMM")}
            </Text>
          </Flex>

          <Text>{comment.comment}</Text>
          {auth?.uid === comment.userId ? (
            <Flex direction="row" mt={3}>
              <IconButton
                size="xs"
                aria-label="edit"
                colorScheme="blue"
                icon={<AiFillEdit />}
                onClick={() => setMode("edit")}
              />
              <IconButton
                ml={3}
                size="xs"
                aria-label="delete"
                colorScheme="red"
                icon={<FaTrash />}
                onClick={() => setMode("delete")}
              />
            </Flex>
          ) : null}
        </Flex>
      </Flex>
    );
  }
  if (mode === "edit") {
    return (
      <Flex direction="column" py={3}>
        <Textarea
          value={userComment}
          onChange={(e) => {
            setUserComment(e.target.value);
          }}
          rows={2}
        ></Textarea>
        <Button
          mt={2}
          isLoading={isEditing}
          alignSelf="flex-end"
          size="sm"
          colorScheme="brand"
          onClick={onEditTaskComment}
        >
          Save
        </Button>
      </Flex>
    );
  }

  return (
    <Flex direction="column">
      <Text my={2}>Are you sure you want to delete this comment</Text>
      <Flex direction="row">
        <IconButton
          icon={<MdCheck />}
          size="sm"
          aria-label="confirm"
          colorScheme="green"
          onClick={onDeleteTaskComment}
          isLoading={isDeleting}
        />
        <IconButton
          ml={4}
          icon={<FaTimes />}
          aria-label="delete"
          colorScheme="red"
          size="sm"
          onClick={() => setMode("view")}
        />
      </Flex>
    </Flex>
  );
};
