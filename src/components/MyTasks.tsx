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
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  ModalOverlay,
  Modal,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Tfoot,
} from "@chakra-ui/react";
import { Task, TaskStatus } from "../types/Project";
import {
  listenOnCreatedTasks,
  listenOnMyTasks,
} from "../services/taskServices";
import { useAppSelector } from "../reducers/types";
import { AiOutlineCalendar } from "react-icons/ai";
import { STATUS_COLORSCHEME } from "../constants";
import { BsCheckAll, BsChevronRight, BsListTask, BsPlus } from "react-icons/bs";
import { Link, useParams } from "react-router-dom";
import { MdCancel, MdPending } from "react-icons/md";
import { FaFile } from "react-icons/fa";
import { IconType } from "react-icons";
import { useSearchIndex } from "../hooks/useSearchIndex";
import { BiChevronLeft, BiChevronRight, BiSearchAlt } from "react-icons/bi";
import { TaskRow } from "./TaskRow";
import { TaskForm } from "./TaskForm";
import { Timestamp } from "firebase/firestore";

const MyTaskRow: FC<{ task: Task & { draft?: boolean } }> = ({ task }) => {
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
export type TaskStats = {
  count: number;
  icon: IconType;
  status: TaskStatus;
  color: string;
};
const TASK_PER_PAGE = 10;
export const MyTasks: FC = () => {
  const { auth } = useAppSelector(({ auth }) => ({ auth }));
  const params = useParams<{ taskId?: string }>();
  const [selectedTask, setSelectedTask] = useState<
    Task & { draft?: boolean }
  >();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [searchInput, setSearchInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>();
  const [createdTask, setCreatedTasks] = useState<Task[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCreated, setLoadingLoadingCreated] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const taskPage = useMemo(() => {
    let totalData = [...(createdTask || []), ...(tasks || [])];
    if (searchInput) {
      totalData = totalData.filter(
        (task) =>
          task.title.toLowerCase().indexOf(searchInput.toLowerCase()) > -1,
      );
    }
    const total = totalData.length;
    const pages = Math.ceil(total / TASK_PER_PAGE);
    const start = (page - 1) * TASK_PER_PAGE;
    const end = start + TASK_PER_PAGE;
    if (end > totalData.length) {
      return { pages, total, tasksToRender: totalData };
    }
    return { tasksToRender: totalData.slice(start, end), pages, total };
  }, [createdTask, tasks, page, searchInput]);
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });

  const taskCategories: Record<TaskStatus, TaskStats> = useMemo(() => {
    const categoryCount = {
      completed: {
        count: 0,
        status: TaskStatus.completed,
        icon: BsCheckAll,
        color: "green.400",
      },
      "not-started": {
        count: 0,
        status: TaskStatus["not-started"],
        icon: MdCancel,
        color: "grey.500",
      },
      ongoing: {
        count: 0,
        status: TaskStatus.ongoing,
        icon: MdPending,
        color: "orange.500",
      },
      planned: {
        count: 0,
        status: TaskStatus.planned,
        icon: FaFile,
        color: "blue.500",
      },
    } as Record<TaskStatus, TaskStats>;

    taskPage.tasksToRender?.length &&
      taskPage.tasksToRender.forEach((task) => {
        categoryCount[task.status].count += 1;
      });
    return categoryCount;
  }, [taskPage]);

  const onOpenTask = (task: Task & { draft?: boolean }) => {
    console.log(task.id);
    setSelectedTask(task);
    onOpen();
  };
  const addNewTaskDraft = () => {
    const newTask: Task & { draft: boolean } = {
      title: "",
      draft: true,
      status: TaskStatus.planned,
      timestamp: Timestamp.now(),
      workplanId: "",
      projectId: "",
      projectFunder: "none",
      creatorId: "",
      projectTitle: "General Task",
    };
    setCreatedTasks([newTask, ...(createdTask || [])]);
  };

  useEffect(() => {
    const unsub = listenOnMyTasks(auth?.uid || "", (tasks) => {
      if (!tasks) return;
      setLoading(false);
      setTasks(tasks);
    });
    return () => unsub();
  }, [auth?.uid]);
  useEffect(() => {
    const unsub = listenOnCreatedTasks(auth?.uid || "", (tasks) => {
      if (!tasks) return;
      setLoading(false);
      setCreatedTasks(tasks);
    });
    return () => unsub();
  }, [auth?.uid]);

  useEffect(() => {
    console.log({ paramsId: params.taskId, tasks });

    if (params.taskId && tasks?.length && createdTask?.length) {
      const task = [...tasks, ...createdTask].find(
        (t) => t.id === params.taskId,
      );
      if (task) {
        setSelectedTask(task);
        onOpen();
      }
    }
  }, [tasks, params.taskId, onOpen, createdTask]);

  return (
    <Flex direction="column" mt={5}>
      <Flex direction="row" alignItems="center" my={4}>
        <HStack spacing={3} alignItems="center">
          <Heading my={3} fontSize="lg">
            My Tasks
          </Heading>
          <IconButton
            rounded="full"
            aria-label="add Task"
            onClick={addNewTaskDraft}
            icon={<BsPlus />}
            colorScheme="brand"
          />
        </HStack>
        <InputGroup maxWidth="224px" ml="auto">
          <InputLeftElement pointerEvents="none">
            <BiSearchAlt color="brand.300" />
          </InputLeftElement>
          <Input
            placeholder="Search task"
            variant="filled"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </InputGroup>
      </Flex>
      <Skeleton isLoaded={!!tasks && !loading}>
        <SimpleGrid columns={[1, 2, 4]} gap={3}>
          {Object.values(TaskStatus).map((task, i) => (
            <Flex
              key={`task-icon-${i}`}
              alignItems="center"
              borderRadius="lg"
              bg="white"
              justifyContent="center"
              p={3}
            >
              <Icon
                boxSize={8}
                as={taskCategories[task].icon}
                color={taskCategories[task].color}
              />
              <Flex direction="column" alignItems="center">
                <Heading fontSize="lg">{taskCategories[task].count}</Heading>
                <Text size="sm">{task}</Text>
              </Flex>
            </Flex>
          ))}
        </SimpleGrid>
        <Flex>
          <Heading my={3} fontSize="md">
            My tasks Overview
          </Heading>
        </Flex>
        <SimpleGrid columns={[2, 4]}></SimpleGrid>
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
                <Th>Attachements</Th>
                <Th>Due Dates</Th>
                <Th>Project</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {taskPage.tasksToRender?.length ? (
                taskPage.tasksToRender.map((task, i) => (
                  <TaskRow
                    key={`task-id-${i}`}
                    project={{
                      id: task.projectId,
                      funder: task.projectFunder,
                      title: task.projectTitle,
                    }}
                    showProject={true}
                    openTask={() => onOpenTask(task)}
                    task={task}
                    workplanId={task.workplanId}
                  />
                ))
              ) : (
                <Tr>
                  <Td colSpan={6}>
                    <Flex
                      direction="column"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <BsListTask fontSize={32} color="red.300" />
                      <Heading fontSize="lg" textAlign="center">
                        You have no task assigned to you
                      </Heading>
                    </Flex>
                  </Td>
                </Tr>
              )}
            </Tbody>
            <Tfoot display="flex" alignItems="cent" py={3}>
              <HStack spacing={2} alignSelf="center">
                <IconButton
                  aria-label="prev"
                  icon={<BiChevronLeft />}
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                />
                <IconButton
                  aria-label="prev"
                  icon={<BiChevronRight />}
                  disabled={page >= taskPage.pages}
                  onClick={() => setPage(page + 1)}
                />
              </HStack>
            </Tfoot>
          </Table>
        </TableContainer>
      </Skeleton>
      {selectedTask && isOpen ? (
        <Modal size="2xl" isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent bg="white">
            <ModalCloseButton />
            <ModalBody>
              <TaskForm onClose={onClose} task={selectedTask} />
            </ModalBody>
          </ModalContent>
        </Modal>
      ) : null}
    </Flex>
  );
};
