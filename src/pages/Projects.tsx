import React, { FC, useEffect, useMemo, useState } from 'react';
import {
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
    Th,
    Thead,
    Tooltip,
    Tr,
    useBreakpointValue,
    useDisclosure,
} from '@chakra-ui/react';
import { AiOutlineEdit,  AiOutlineFileText, AiOutlinePlus } from 'react-icons/ai';
import { FiChevronsRight } from 'react-icons/fi';
import {  Project } from '../types/Project';
import { deleteProject,  listenOnProjects } from '../services/projectServices';
import { BsTrash } from 'react-icons/bs';
import {
    useLoadingAnimation,
} from '../hooks/useLoadingAnimation';
import { COLOR_SPECTRUM_TAGS } from '../constants';
import { ProjectForm } from '../components/ProjectForm';
import { Link, useLocation } from 'react-router-dom';

type ProposalRowType = {
   index: number
    project: Project;
    onEdit: () => void;
    onDelete: () => void;
};
const ProjectRow: FC<ProposalRowType> = ({ project, onEdit, onDelete, index }) => {
    const { title, dateAdded, funder, documents, workplans } = project;
    const tagColor = useMemo(()=> COLOR_SPECTRUM_TAGS[index%COLOR_SPECTRUM_TAGS.length], [index]);
    const {pathname } = useLocation()
    return (
        <Tr borderRadius="md">
            <Td wordBreak="break-word" borderLeftRadius="lg" bg="white" mb={2}>
                {title}
            </Td>
            <Td bg="white" mb={2}>
                {funder}
            </Td>
            <Td bg="white" mb={2}>
                {(dateAdded as Date).toDateString()}
            </Td>
            <Td bg="white" mb={2}>
                   {documents && documents.length ? 
                   <HStack spacing={2}>
                      <Icon color="tetiary.400"  as = {AiOutlineFileText} />
                      <Text color='blue.300'>
                         {documents?.length || 0}
                      </Text>

                   </HStack>
                   :
                   <Tag>
                      0 documents 
                   </Tag>
                   }
            </Td>
            <Td bg="white" mb={2}>
                   {workplans && workplans.length ? 
                   <Tag whiteSpace='nowrap' bg = {tagColor}>
                      {`${workplans.length} workplans`}
                   </Tag>:
                   <Tag>
                      0 
                   </Tag>
                   }
            </Td>
            <Td borderRightRadius="md" bg="white" mb={2}>
                <HStack alignItems="center" spacing={2}>
                    <Tooltip
                        label="edit project "
                        bg="tetiary.200"
                        placement="top"
                    >
                        <IconButton
                            aria-label="edit project"
                            color="blue.400"
                            icon={<Icon as={AiOutlineEdit} />}
                            onClick={onEdit}
                        />
                    </Tooltip>
                    
                    <Tooltip
                        label="Delete project"
                        bg="tetiary.200"
                        placement="top"
                    >
                        <IconButton
                            aria-label="view project"
                            color="red.300"
                            icon={<Icon as={BsTrash} />}
                            onClick={onDelete}
                        />
                    </Tooltip>
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
    const [projects, setProjects] = useState<Project[]>();
    const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
    const [isDeletingProjects, setDeletingProjects] = useState<boolean>();
    const [selectedProject, setSelectedProject] = useState<Project>();
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const loadingAnimation = useLoadingAnimation();
    const addButonSize = useBreakpointValue({base: "md", md: 'md', lg: 'lg'});
    const isMobile = useBreakpointValue({base: true, md: false, lg: false})
    
    const {
        isOpen: isProposalModalOpen,
        onClose: onCloseProjectModal,
        onOpen: onOpenProposalModal,
    } = useDisclosure();
    const {
        isOpen: isDeleteModalOpen,
        onClose: onCloseDeleteModal,
        onOpen: onOpenDeleteModal,
    } = useDisclosure();

    useEffect(() => {
        const unsub = listenOnProjects((data) => {
            setLoadingProjects(false);
            setProjects(data);
        });

        return () => unsub();
    }, []);

    const addProjectPrompt = () => {
        setMode('add');
        setSelectedProject(undefined);
        onOpenProposalModal();
    };

    const editProjectPrompt = (project: Project) => {
        setMode('edit');
        setSelectedProject(project);
        onOpenProposalModal();
    };

    const deletePrompt = (project: Project) => {
        setMode('edit');
        setSelectedProject(project);
        onOpenDeleteModal();
    };

    const onDelete = async () => {
        if (!selectedProject) return;
        setDeletingProjects(true);
        await deleteProject(selectedProject);
        setDeletingProjects(false);
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
                
                <TableContainer mt={5} maxWidth="100%" whiteSpace={isMobile ? 'nowrap' : 'initial'}>
                    <Table
                        size="sm"
                        sx={{
                            borderCollapse: 'separate',
                            borderSpacing: '0 5px',
                        }}
                    >
                        <TableCaption>
                            All project pending and approved
                        </TableCaption>
                        <Thead>
                            <Tr>
                                <Th>Title</Th>
                                <Th>Funder</Th>
                                <Th>Date Added</Th>
                                <Th whiteSpace="pre-wrap">Documents</Th>
                                <Th>Workplans</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loadingProjects ? (
                                <Tr
                                    bg="white"
                                    borderRadius="xl"
                                    animation={loadingAnimation}
                                >
                                    <Td
                                        colSpan={5}
                                        bg="white"
                                        borderRadius="xl"
                                        textAlign="center"
                                    >
                                        <Text>Please wait....</Text>
                                    </Td>
                                </Tr>
                            ) : projects?.length ? 
                           
                               projects.map((project, i) => (
                                  <ProjectRow index={i} project={project} onDelete={() => deletePrompt(project)} onEdit={()=> editProjectPrompt(project)} />
                               ))
                        
                        : (
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
                        <ProjectForm project={selectedProject} onClose={onCloseProjectModal} mode = {mode}/>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={onCloseDeleteModal}
                size="sm"
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader py={8}>{`Delete Proposal ${
                        selectedProject?.title || ''
                    }`}</ModalHeader>
                    <ModalCloseButton size="sm" />
                    <ModalBody>
                        <Text>{`Are you sure you want to delete this project named ${
                            selectedProject?.title || 'unknown name' 
                        } and all associated documents, workplans and files`}</Text>
                    </ModalBody>
                    <ModalFooter>
                        <Flex
                            width="100%"
                            direction="row"
                            justifyContent="space-between"
                        >
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
