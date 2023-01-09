import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  Skeleton,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { FC, useEffect, useMemo, useState } from "react";
import { BsCheckAll, BsKanban, BsTable } from "react-icons/bs";
import { FaFile } from "react-icons/fa";
import { MdCancel, MdPending } from "react-icons/md";
import { useParams } from "react-router-dom";
import { KanbanWorkPlanView } from "../components/KanbanWorkPlanView";
import { TaskStats } from "../components/MyTasks";
import { TableViewWorkPlan } from "../components/TableViewWorkPlan";
import { TaskForm } from "../components/TaskForm";
import { WORKPLAN_COLORS } from "../constants";
import { parseTasksToChartData } from "../helpers";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { getProject, listenOnTasks } from "../services/projectServices";
import { Project, Task, TaskStatus, WorkplanViewType } from "../types/Project";
import { Doughnut } from "react-chartjs-2";
export const WorkplanPage: FC = () => {
  const { projectId, workplanId } = useParams();
  const [project, setProject] = useState<Project>();
  const [isFetchingProjects, setFetchingProjects] = useState(true);
  const [currentView, setCurrentView] = useState<WorkplanViewType>(
    WorkplanViewType.table,
  );
  const [tasks, setTasks] = useState<(Task & { draft?: boolean })[]>();

  const data = useMemo(() => {
    return parseTasksToChartData(tasks || []);
  }, [tasks]);
  const [isFetchTasks, setFetchingTasks] = useState<boolean>(true);
  const [selectedTask, setSelectedTask] = useState<Task>();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const glassEffect = useGlassEffect(false, "lg");
  const workplan = useMemo(
    () => project?.workplans?.find(({ id }) => id === workplanId),
    [project, workplanId],
  );
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

    tasks?.length &&
      tasks.forEach((task) => {
        categoryCount[task.status].count += 1;
      });
    return categoryCount;
  }, [tasks]);

  const toast = useToast();
  useEffect(() => {
    async function fetchProject() {
      try {
        const proj = await getProject(projectId || "");
        setProject(proj);
      } catch (error) {
        const err: any = error;
        toast({
          title: "Could not fetch projects",
          description: err?.message || "Unknown error try again",
          status: "error",
        });
      } finally {
        setFetchingProjects(false);
      }
    }
    fetchProject();
  }, [projectId, toast]);

  useEffect(() => {
    const unsub = listenOnTasks(projectId, workplanId, (result) => {
      setFetchingTasks(false);
      setTasks(result);
    });
    return () => unsub && unsub();
  }, [projectId, workplanId]);

  const setTask = (task: Task) => {
    setTasks((tasks) => [task, ...(tasks || [])]);
  };
  const openTask = (task: Task) => {
    setSelectedTask(task);
    onOpen();
  };
  return (
    <Flex direction="column" px={5} pt={3} alignItems="flex-start">
      <Skeleton isLoaded={!isFetchingProjects && !!project}>
        <VStack spacing={1} alignItems="flex-start">
          <Heading fontSize="sm">{project?.funder}</Heading>
          <Heading
            fontSize="lg"
            color={
              workplan?.type ? WORKPLAN_COLORS[workplan?.type] : "tetiary.400"
            }
          >
            {workplan?.title}
          </Heading>
        </VStack>
      </Skeleton>
      <SimpleGrid columns={[1, 2]} width="100%">
        <SimpleGrid columns={2} gap={3} width="100%" mt={3}>
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
        <Flex direction="column" alignItems="center">
          <Box boxSize="200px">
            <Heading>Stats</Heading>
            <Doughnut data={data} />
          </Box>
        </Flex>
      </SimpleGrid>

      <Box mt={5}>
        <Text mb={1} fontSize={["sm", "xs"]} fontWeight="bold">
          Toggle view
        </Text>
        <HStack py={2} px={3} {...glassEffect}>
          <Tooltip label="table view">
            <IconButton
              onClick={() => setCurrentView(WorkplanViewType.table)}
              colorScheme={
                currentView === WorkplanViewType.table ? "brand" : ""
              }
              aria-label="toggle table view"
              variant="ghost"
              {...(currentView === WorkplanViewType.table ? glassEffect : null)}
              icon={<Icon as={BsTable} />}
            />
          </Tooltip>
          <Tooltip label="kanban view">
            <IconButton
              colorScheme={
                currentView === WorkplanViewType.kanban ? "brand" : ""
              }
              onClick={() => setCurrentView(WorkplanViewType.kanban)}
              aria-label="toggle kanban view"
              variant="ghost"
              {...(currentView === WorkplanViewType.kanban
                ? glassEffect
                : null)}
              icon={<Icon as={BsKanban} />}
            />
          </Tooltip>
        </HStack>
      </Box>

      {currentView === WorkplanViewType.table && project ? (
        <Skeleton mt={5} width="100%" isLoaded={!isFetchTasks && !!tasks}>
          <TableViewWorkPlan
            workplanId={workplanId || ""}
            project={project}
            tasks={tasks || []}
            setTask={setTask}
            openTask={openTask}
          />{" "}
        </Skeleton>
      ) : null}
      {currentView === WorkplanViewType.kanban && project ? (
        <Skeleton mt={5} width="100%" isLoaded={!isFetchTasks && !!tasks}>
          <KanbanWorkPlanView
            workplanId={workplanId || ""}
            project={project}
            tasks={tasks || []}
            setTask={setTask}
            openTask={openTask}
          />{" "}
        </Skeleton>
      ) : null}

      {selectedTask && isOpen ? (
        <Modal size="2xl" isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent {...glassEffect}>
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
