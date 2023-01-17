import React, { FC, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableCaption,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tooltip,
  Tr,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import {
  AiOutlineEdit,
  AiOutlineFileText,
  AiOutlinePlus,
} from "react-icons/ai";
import { FiChevronsRight } from "react-icons/fi";
import { Project } from "../types/Project";
import { deleteProject, listenOnProjects } from "../services/projectServices";
import { BsCalculator, BsTrash } from "react-icons/bs";
import { useLoadingAnimation } from "../hooks/useLoadingAnimation";
import {
  COLOR_SPECTRUM_TAGS,
  NUMBER_OF_PROJECTS_PER_PROJECT_PAGE,
} from "../constants";
import { ProjectForm } from "../components/ProjectForm";
import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../reducers/types";
import { useDispatch } from "react-redux";
import { setProjects } from "../reducers/projectSlice";
import { useSearchIndex } from "../hooks/useSearchIndex";
import { format } from "date-fns";
import { paginationArray } from "../helpers";
import { Pagination } from "../components/Pagination";
import { BiLockAlt } from "react-icons/bi";
import { ProjectAccessForm } from "../components/ProjectAccessForm";

type ProposalRowType = {
  index: number;
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onManageAccess: () => void;
};
const ProjectRow: FC<ProposalRowType> = ({
  project,
  onEdit,
  onDelete,
  onManageAccess,
  index,
}) => {
  const { users, auth } = useAppSelector(({ users, auth }) => ({
    users,
    auth,
  }));
  const { usersMap = {} } = users || {};
  const {
    title,
    dateAdded,
    funder,
    documents,
    workplans,
    creatorId,
    writeAccess = [],
    budgetAccess = [],
  } = project;
  const tagColor = useMemo(
    () => COLOR_SPECTRUM_TAGS[index % COLOR_SPECTRUM_TAGS.length],
    [index],
  );
  const { pathname } = useLocation();
  return (
    <Tr borderRadius="md">
      <Td wordBreak="break-word" borderLeftRadius="lg" bg="white" mb={2}>
        {title}
      </Td>
      <Td bg="white" mb={2}>
        {funder}
      </Td>
      <Td bg="white" mb={2} textAlign="center">
        {format(new Date(project.dateAdded as number), "d MMM Y")}
      </Td>
      <Td bg="white" mb={2} textAlign="center">
        {documents && documents.length ? (
          <HStack spacing={2}>
            <Icon color="tetiary.400" as={AiOutlineFileText} />
            <Text color="blue.300">{documents?.length || 0}</Text>
          </HStack>
        ) : (
          <HStack spacing={2}>
            <Icon color="tetiary.400" as={AiOutlineFileText} />
            <Text>{documents?.length || 0}</Text>
          </HStack>
        )}
      </Td>
      <Td bg="white" align="center" textAlign="center">
        <Tooltip title={usersMap[creatorId]?.displayName || "Unknown user"}>
          <Avatar
            size="xs"
            src={usersMap[creatorId]?.photoUrl}
            name={usersMap[creatorId]?.displayName || ""}
          />
        </Tooltip>
      </Td>
      <Td bg="white" mb={2} textAlign="center">
        {workplans && workplans.length ? (
          <Tag whiteSpace="nowrap" bg={tagColor}>
            {`${workplans.length} workplans`}
          </Tag>
        ) : (
          <Tag>0</Tag>
        )}
      </Td>
      <Td borderRightRadius="md" bg="white" mb={2}>
        <HStack alignItems="center" spacing={2}>
          {creatorId === auth?.uid ? (
            <Tooltip label="Manage Access " bg="tetiary.200" placement="top">
              <IconButton
                aria-label="manage access"
                color="pink.400"
                icon={<Icon as={BiLockAlt} />}
                onClick={onManageAccess}
              />
            </Tooltip>
          ) : null}
          {creatorId === auth?.uid || writeAccess.includes(auth?.uid || "") ? (
            <>
              <Tooltip label="edit project " bg="tetiary.200" placement="top">
                <IconButton
                  aria-label="edit project"
                  color="blue.400"
                  icon={<Icon as={AiOutlineEdit} />}
                  onClick={onEdit}
                />
              </Tooltip>
              <Tooltip label="Delete project" bg="tetiary.200" placement="top">
                <IconButton
                  variant="outline"
                  aria-label="view project"
                  color="red.300"
                  icon={<Icon as={BsTrash} />}
                  onClick={onDelete}
                />
              </Tooltip>
            </>
          ) : null}

          {creatorId === auth?.uid || budgetAccess.includes(auth?.uid || "") ? (
            <Tooltip label="View Budget" bg="tetiary.200" placement="top">
              <IconButton
                as={Link}
                variant="outline"
                aria-label="View Budget"
                color="yellow.500"
                icon={<Icon as={BsCalculator} />}
                onClick={onDelete}
                to={`${pathname}/${project.id}/budget`}
              />
            </Tooltip>
          ) : null}
          <Tooltip
            label="View project details"
            bg="tetiary.200"
            placement="top"
          >
            <IconButton
              as={Link}
              to={`${pathname}/${project.id}`}
              aria-label="view project doc"
              color="purple.400"
              icon={<Icon as={FiChevronsRight} />}
            />
          </Tooltip>
        </HStack>
      </Td>
    </Tr>
  );
};

export const Projects: FC = () => {
  const { projects: appProjects } = useAppSelector(({ projects }) => ({
    projects,
  }));
  const {
    data: projects,
    pageStat,
    setPage,
    setData,
    search,
    setQuery,
    loading,
  } = useSearchIndex<Project>("projects");
  const pages = useMemo(() => {
    return Math.ceil(
      (pageStat?.total || 0) / NUMBER_OF_PROJECTS_PER_PROJECT_PAGE,
    );
  }, [pageStat?.total]);
  const pagination = useMemo(() => {
    return paginationArray(pageStat?.currentPage || 0, pages);
  }, [pageStat, pages]);
  const [isDeletingProjects, setDeletingProjects] = useState<boolean>();
  const [selectedProject, setSelectedProject] = useState<Project>();
  const [mode, setMode] = useState<"add" | "edit">("add");
  const loadingAnimation = useLoadingAnimation();
  const addButonSize = useBreakpointValue({ base: "md", md: "md", lg: "lg" });
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
  const dispatch = useDispatch();
  const {
    isOpen: isProposalModalOpen,
    onClose: onCloseProjectModal,
    onOpen: onOpenProposalModal,
  } = useDisclosure();
  const {
    isOpen: isAccessModalOpen,
    onClose: onCloseAccessModal,
    onOpen: onOpenAccessModal,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onClose: onCloseDeleteModal,
    onOpen: onOpenDeleteModal,
  } = useDisclosure();

  useEffect(() => {
    if (projects) return;
    const unsub = listenOnProjects((data) => {
      dispatch(setProjects(data));
    });

    return () => unsub();
  }, [projects, dispatch]);

  const addProjectPrompt = () => {
    setMode("add");
    setSelectedProject(undefined);
    onOpenProposalModal();
  };

  const editProjectPrompt = (project: Project) => {
    setMode("edit");
    setSelectedProject(project);
    onOpenProposalModal();
  };
  const manageAccessPrompt = (project: Project) => {
    setSelectedProject(project);
    onOpenAccessModal();
  };
  const onEditProjectCache = (project: Project) => {
    const index = (projects || []).findIndex((proj) => project.id === proj.id);
    if (index < 0) {
      return;
    }
    const newData = [...(projects || [])];
    newData[index] = project;
    setData(newData);
  };

  const addProjectCache = (project: Project) => {
    setData([...(projects || []), project]);
  };

  const deletePrompt = (project: Project) => {
    setMode("edit");
    setSelectedProject(project);
    onOpenDeleteModal();
  };

  const onDelete = async () => {
    if (!selectedProject) return;
    setDeletingProjects(true);
    await deleteProject(selectedProject);
    setDeletingProjects(false);
    const index = (projects || []).findIndex(
      (proj) => proj.id === selectedProject.id,
    );
    if (index < 0) return;
    const newData = [...(projects || [])];
    newData.splice(index);
    setData(newData);
    onCloseDeleteModal();
  };
  return (
    <Flex direction="column" py={5}>
      <HStack alignItems="center" spacing="2">
        <Heading fontSize="md">Projects</Heading>
        <IconButton
          borderRadius="full"
          colorScheme="brand"
          size={addButonSize}
          aria-label="add Proposal"
          icon={<Icon as={AiOutlinePlus} />}
          onClick={addProjectPrompt}
        />
      </HStack>

      <Flex direction="column" maxWidth="100%">
        <TableContainer
          mt={5}
          maxWidth="100%"
          whiteSpace={isMobile ? "nowrap" : "initial"}
        >
          <Table
            size="sm"
            sx={{
              borderCollapse: "separate",
              borderSpacing: "0 5px",
            }}
          >
            <TableCaption>All project pending and approved</TableCaption>
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Funder</Th>
                <Th>Date Added</Th>
                <Th whiteSpace="pre-wrap">Documents</Th>
                <Th>Added by</Th>
                <Th>Workplans</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr bg="white" borderRadius="xl" animation={loadingAnimation}>
                  <Td
                    colSpan={5}
                    bg="white"
                    borderRadius="xl"
                    textAlign="center"
                  >
                    <Text>Please wait....</Text>
                  </Td>
                </Tr>
              ) : projects?.length ? (
                projects.map((project, i) => (
                  <ProjectRow
                    key={`project-${i}`}
                    index={i}
                    project={project}
                    onDelete={() => deletePrompt(project)}
                    onEdit={() => editProjectPrompt(project)}
                    onManageAccess={() => manageAccessPrompt(project)}
                  />
                ))
              ) : (
                <Tr bg="white" borderRadius="xl">
                  <Td
                    colSpan={5}
                    bg="white"
                    borderRadius="xl"
                    textAlign="center"
                  >
                    <Text>No Projects Yet</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
          <Flex display="flex" justifyContent="center">
            <Pagination
              pagination={pagination}
              pages={pages}
              setPage={setPage}
              currentPage={pageStat?.currentPage || 0}
            />
          </Flex>
        </TableContainer>
      </Flex>
      <Modal
        isOpen={isProposalModalOpen}
        onClose={onCloseProjectModal}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{`${mode} project`.toUpperCase()}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ProjectForm
              search={search}
              onEdit={onEditProjectCache}
              onAddProject={addProjectCache}
              project={selectedProject}
              onClose={onCloseProjectModal}
              mode={mode}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isAccessModalOpen} onClose={onCloseAccessModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>🔐 Manage Project Access</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedProject ? (
              <ProjectAccessForm
                project={selectedProject}
                onUpdate={onEditProjectCache}
                onClose={onCloseAccessModal}
              />
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={onCloseDeleteModal} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center" py={8}>{`Delete Proposal ${
            selectedProject?.title || ""
          }`}</ModalHeader>
          <ModalCloseButton size="sm" />
          <ModalBody>
            <Text textAlign="center">{`Are you sure you want to delete this project named ${
              selectedProject?.title || "unknown name"
            } and all associated documents, workplans and files`}</Text>
          </ModalBody>
          <ModalFooter>
            <Flex width="100%" direction="row" justifyContent="space-between">
              <Button
                disabled={isDeletingProjects}
                variant="outline"
                colorScheme="brand"
              >
                No
              </Button>
              <Button
                onClick={onDelete}
                isLoading={isDeletingProjects}
                variant="solid"
                colorScheme="brand"
              >
                Yes
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
