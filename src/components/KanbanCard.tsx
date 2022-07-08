import {
  Avatar,
  AvatarGroup,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  Text,
  Tooltip,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import React, { FC, useState } from "react";
import { useAppSelector } from "../reducers/types";
import { Project, Task } from "../types/Project";
import { format } from "date-fns";
import { AiOutlineClockCircle } from "react-icons/ai";
import { RiAttachment2 } from "react-icons/ri";
import { useLoadingAnimation } from "../hooks/useLoadingAnimation";
import { Timestamp } from "firebase/firestore";
import { addTaskToDb } from "../services/taskServices";
type KanbanCardProps = {
  task: Task & { draft?: boolean };
  openTask: () => void;
  project: Project;
  workplanId: string;
};

export const KanbanCard: FC<KanbanCardProps> = ({
  task,
  openTask,
  project,
  workplanId,
}) => {
  const { users, auth } = useAppSelector(({ users, auth }) => ({
    users,
    auth,
  }));
  const [title, setTitle] = useState<string>("");
  const [isSaving, setSaving] = useState<boolean>(false);
  const loadingAnimation = useLoadingAnimation();
  const inputSize = useBreakpointValue({ base: "xs", md: "sm", lg: "sm" });
  const toast = useToast();
  const addTaskDraft = async () => {
    const newTask: Task = {
      title,
      timestamp: Timestamp.now(),
      projectFunder: project.funder,
      projectId: project.id,
      projectTitle: project.title,
      workplanId,
      creatorId: auth?.uid || "",
      status: task.status,
    };
    try {
      setSaving(true);
      await addTaskToDb(project.id, newTask);
    } catch (error) {
      const err: any = error;
      toast({
        title: "Could not save this task",
        description: err?.message || "Unknown error",
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (task.draft) {
    return (
      <Flex
        animation={isSaving ? loadingAnimation : "none"}
        my={3}
        py={3}
        px={2}
        minWidth={["250px", "300px"]}
        bg="white"
      >
        <Input
          disabled={isSaving}
          onBlur={addTaskDraft}
          size={inputSize}
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Flex>
    );
  }

  return (
    <Flex
      my={3}
      minWidth={["250px", "300px"]}
      bg="white"
      borderRadius="md"
      px={3}
      py={2}
      direction="column"
    >
      <Heading
        onClick={openTask}
        fontSize={["sm", "lg"]}
        color="red.500"
        textDecor="underline"
      >
        {task.title}
      </Heading>
      {task.assignees?.length ? (
        <AvatarGroup spacing="-.5rem" my={3}>
          {task.assignees.map((userId) => (
            <Tooltip
              key={`avatar-${userId}`}
              label={users?.usersMap[userId].displayName || ""}
            >
              <Avatar
                name={users?.usersMap[userId].displayName || ""}
                src={users?.usersMap[userId].photoUrl}
                size="xs"
              />
            </Tooltip>
          ))}
        </AvatarGroup>
      ) : null}
      <Flex direction="row" justifyContent="space-between">
        {task.dueDate ? (
          <HStack>
            <Icon as={AiOutlineClockCircle} fontSize="sm" color="blue.300" />
            {task.dueDate.startDate ? (
              <Text fontSize={["xss", "xs"]}>
                {format(new Date(task.dueDate.startDate), "do MMM")} {" - "}{" "}
              </Text>
            ) : null}
            {task.dueDate.dueDate ? (
              <Text fontSize={["xx-small", "xs"]}>
                {format(new Date(task.dueDate.dueDate), "do MMM")}
              </Text>
            ) : null}
          </HStack>
        ) : null}

        {task.attachments?.length ? (
          <HStack>
            <Icon as={RiAttachment2} fontSize="sm" />
            <Text fontSize={["xx-small", "xs"]}>{task.attachments.length}</Text>
          </HStack>
        ) : null}
      </Flex>
    </Flex>
  );
};
