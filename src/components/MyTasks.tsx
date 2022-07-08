import React, { FC, useEffect, useMemo, useState } from "react";
import {
  Flex,
  Heading,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
  HStack,
  AvatarGroup,
  Avatar,
  Icon,
  Tag,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Task } from "../types/Project";
import { listenOnMyTasks } from "../services/taskServices";
import { useAppSelector } from "../reducers/types";
import { AiOutlineCalendar } from "react-icons/ai";
import { STATUS_COLORSCHEME } from "../constants";
import { BsChevronRight } from "react-icons/bs";
import { Link } from "react-router-dom";

const MyTaskRow: FC<{ task: Task }> = ({ task }) => {
  const { users } = useAppSelector(({ users }) => ({ users }));
  const assigneeesTorender = useMemo(() => {
    if (!task?.assignees) return null;
    if (task.assignees.length > 3) {
      const assignees = task.assignees.slice(3);
      return {
        assignees,
        count: task.assignees.length - 3,
      };
    }
    return {
      assignees: task.assignees,
    };
  }, [task.assignees]);
  return (
    <Tr bg="white">
      <Td cursor="pointer" borderLeftRadius="lg">
        <Tooltip label={task.title}>
          <Text isTruncated noOfLines={1}>
            {task.title}
          </Text>
        </Tooltip>
      </Td>
      <Td>
        {assigneeesTorender ? (
          <HStack>
            <AvatarGroup spacing="-1rem">
              {assigneeesTorender.assignees.map((user) => (
                <Avatar
                  key={`user-avatar-${user}`}
                  size="sm"
                  src={
                    users?.usersMap ? users.usersMap[user]?.photoUrl || "" : ""
                  }
                  name={
                    users?.usersMap
                      ? users.usersMap[user]?.displayName || "Unknown user"
                      : "Unknown user"
                  }
                />
              ))}
            </AvatarGroup>
            {assigneeesTorender.count ? (
              <Text>{`and ${assigneeesTorender.count} more`}</Text>
            ) : null}
          </HStack>
        ) : (
          <Text color="gray.300">Not assigned to anyone</Text>
        )}
      </Td>
      <Td>
        {task.dueDate ? (
          <HStack>
            <Icon as={AiOutlineCalendar} color="blue.300" />
            <Text>{`${task.dueDate.startDate} - ${
              task.dueDate.dueDate || "*"
            }`}</Text>
          </HStack>
        ) : (
          "No due dates assigned"
        )}
      </Td>
      <Td>
        <Tag colorScheme={STATUS_COLORSCHEME[task.status]}>{task.status}</Tag>
      </Td>
      <Td borderRightRadius="lg">
        <IconButton
          aria-label="view task board"
          icon={<Icon as={BsChevronRight} />}
          size="sm"
          as={Link}
          to={`/dashboard/projects/${task.projectId}/${task.workplanId}`}
        />
      </Td>
    </Tr>
  );
};

export const MyTasks: FC = () => {
  const { auth } = useAppSelector(({ auth }) => ({ auth }));
  const [tasks, setTasks] = useState<Task[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });
  useEffect(() => {
    const unsub = listenOnMyTasks(auth?.uid || "", (tasks) => {
      setLoading(false);
      setTasks(tasks);
    });
    return () => unsub();
  }, [auth?.uid]);

  return (
    <Flex direction="column" mt={5}>
      <Heading my={3} fontSize="lg">
        My Tasks
      </Heading>
      <Skeleton isLoaded={!loading}>
        <TableContainer whiteSpace={isMobile ? "nowrap" : "initial"}>
          <Table
            sx={{
              borderCollapse: "separate",
              borderSpacing: "0 5px",
            }}
          >
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Assignees</Th>
                <Th>Due Dates</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tasks?.length ? (
                tasks.map((task, i) => (
                  <MyTaskRow key={`task-id-${i}`} task={task} />
                ))
              ) : (
                <Tr>
                  <Td colSpan={4}>
                    <Heading>You have no task assigned to you</Heading>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Skeleton>
    </Flex>
  );
};
