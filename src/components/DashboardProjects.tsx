/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, KeyboardEvent, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  Skeleton,
  SkeletonText,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { Project } from "../types/Project";
import { listenOnProjects } from "../services/projectServices";
import { EmptyState } from "./EmptyState";
import { NUMBER_OF_PROJECTS_PERPAGE, WORKPLAN_COLORS } from "../constants";
import { BsChevronRight } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useSearchIndex } from "../hooks/useSearchIndex";

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
  const {
    loading,
    data: projects,
    search,
    page,
    setQuery,
    setPage,
    pageStat,
  } = useSearchIndex<Project[]>("projects", "", NUMBER_OF_PROJECTS_PERPAGE);
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const unsub = listenOnProjects((data) => {
      search();
    });
    return unsub;
  }, []);

  const paginationArray = useMemo(() => {
    const pages = Math.ceil(
      (pageStat?.total || 0) / NUMBER_OF_PROJECTS_PERPAGE,
    );
    const outputArray: number[] = [];
    const currentPage = (pageStat?.currentPage || 0) + 1;
    let counter = currentPage;
    while (counter > 0 && counter >= currentPage - 3) {
      outputArray.unshift(counter);
      counter--;
    }
    let endCounter = currentPage;
    const remaining = currentPage + 3 > pages ? pages : currentPage + 3;
    while (endCounter <= remaining) {
      if (endCounter > currentPage) {
        outputArray.push(endCounter);
      }
      endCounter++;
    }
    return outputArray;
  }, [pageStat]);

  const onSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      setQuery(searchInput);
    }
  };

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
      <Input
        onKeyUp={onSearch}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        mb={5}
        mt={2}
        variant="filled"
        placeholder="search"
      />
      {projects.map((project, i) => (
        <ProjectList key={`projectlist-${i}`} project={project} />
      ))}
      <Flex alignItems="center" justifyContent="center" width="100%" mt={3}>
        {paginationArray.map((number, i) => (
          <Button
            variant="link"
            size="sm"
            mx={2}
            disabled={loading}
            onClick={() => setPage(number - 1)}
            bg={
              (pageStat?.currentPage || 0) === number - 1
                ? "brand.500"
                : "white"
            }
            color={
              (pageStat?.currentPage || 0) === number - 1
                ? "white"
                : "brand.500"
            }
            key={`pagination-link-${number}`}
          >
            {number}
          </Button>
        ))}
      </Flex>
    </Accordion>
  ) : (
    <EmptyState title="There are no projects here" />
  );
};
