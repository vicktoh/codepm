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
  Skeleton,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { FC, useEffect, useMemo, useState } from "react";
import { AiOutlineCalendar } from "react-icons/ai";
import { BsKanban, BsTable } from "react-icons/bs";
import { useParams } from "react-router-dom";
import { KanbanWorkPlanView } from "../components/KanbanWorkPlanView";
import { TableViewWorkPlan } from "../components/TableViewWorkPlan";
import { TaskForm } from "../components/TaskForm";
import { WORKPLAN_COLORS } from "../constants";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { getProject, listenOnTasks } from "../services/projectServices";
import { Project, Task, WorkplanViewType } from "../types/Project";

export const WorkplanPage: FC = () => {
  const { projectId, workplanId } = useParams();
  const [project, setProject] = useState<Project>();
  const [isFetchingProjects, setFetchingProjects] = useState(true);
  const [currentView, setCurrentView] = useState<WorkplanViewType>(
    WorkplanViewType.table,
  );
  const [tasks, setTasks] = useState<(Task & { draft?: boolean })[]>();
  const [isFetchTasks, setFetchingTasks] = useState<boolean>(true);
  const [selectedTask, setSelectedTask] = useState<Task>();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const glassEffect = useGlassEffect(false, "lg");
  const workplan = useMemo(
    () => project?.workplans?.find(({ id }) => id === workplanId),
    [project, workplanId],
  );

  const toast = useToast();
  useEffect(() => {
    async function fetchProject() {
      try {
        const proj = await getProject(projectId || "");
        console.log(proj);
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
      console.log({ result });
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
          <Tooltip label="calendar view">
            <IconButton
              colorScheme={
                currentView === WorkplanViewType.calendar ? "brand" : ""
              }
              onClick={() => setCurrentView(WorkplanViewType.calendar)}
              aria-label="toggle calendar view"
              variant="ghost"
              {...(currentView === WorkplanViewType.calendar
                ? glassEffect
                : null)}
              icon={<Icon as={AiOutlineCalendar} />}
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
        <Modal size="lg" isOpen={isOpen} onClose={onClose}>
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
