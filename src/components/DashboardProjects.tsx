import React, { FC, useEffect, useState } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Skeleton,
  SkeletonText,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { Project } from "../types/Project";
import { listenOnProjects } from "../services/projectServices";
import { EmptyState } from "./EmptyState";
import { WORKPLAN_COLORS } from "../constants";
import { BsChevronRight } from "react-icons/bs";
import { Link } from "react-router-dom";

type ProjectListProps = {
  project: Project;
};
const ProjectList: FC<ProjectListProps> = ({ project }) => {
  return (
    <AccordionItem my={1}>
      <AccordionButton bg="white" _hover={{ bg: "white" }} borderRadius="lg">
        <Flex
          direction="row"
          justifyContent="space-between"
          width="100%"
          bg="white"
          alignItems="center"
          borderRadius="lg"
          py={1}
        >
          <Tooltip label={project.title}>
            <Text fontWeight="bold" color="tetiary.500" isTruncated>
              {project.title}
            </Text>
          </Tooltip>
          <Badge
            bg="brand.300"
            color="white"
            rounded="lg"
            alignItems="center"
            justifyContent="center"
          >
            {project.workplans?.length || "No Workplans"}
          </Badge>
        </Flex>
      </AccordionButton>
      <AccordionPanel>
        {project.workplans?.length ? (
          project.workplans.map((workplan, i) => (
            <Flex
              key={`workplan-${project.id}-${i}`}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              bg="white"
              borderRadius="lg"
              py={1}
              px={2}
              ml={2}
            >
              <HStack>
                <Box
                  width={2}
                  height={2}
                  borderRadius={2}
                  bg={WORKPLAN_COLORS[workplan.type]}
                ></Box>
                <Text>{workplan.title}</Text>
              </HStack>

              <IconButton
                as={Link}
                to={`/dashboard/projects/${project.id}/${workplan.id}`}
                size="sm"
                aria-label="view Workplan"
                icon={<Icon as={BsChevronRight} />}
              />
            </Flex>
          ))
        ) : (
          <EmptyState
            description=""
            title="There are no workplans for this project"
          />
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export const DashboardProjects: FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [projects, setProjects] = useState<Project[]>();
  useEffect(() => {
    const unsub = listenOnProjects((data) => {
      setLoading(false);
      setProjects(data);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <Skeleton>
        <Skeleton
          bg="white"
          display="flex"
          justifyContent="space-between"
          flexDirection="row"
        >
          <SkeletonText my={3} width="30%" />
          <SkeletonText bg="tetiary.500" width="10%" />
        </Skeleton>
        <Skeleton
          bg="white"
          display="flex"
          justifyContent="space-between"
          flexDirection="row"
        >
          <SkeletonText width="30%" />
          <SkeletonText bg="tetiary.500" width="10%" />
        </Skeleton>
        <Skeleton
          bg="white"
          display="flex"
          justifyContent="space-between"
          flexDirection="row"
        >
          <SkeletonText my={2} width="30%" />
          <SkeletonText my={2} bg="tetiary.500" width="10%" />
        </Skeleton>
      </Skeleton>
    );
  }
  return projects?.length ? (
    <Accordion my={4}>
      {projects.map((project, i) => (
        <ProjectList key={`projectlist-${i}`} project={project} />
      ))}
    </Accordion>
  ) : (
    <EmptyState title="There are no projects here" />
  );
};
