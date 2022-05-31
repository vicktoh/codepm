import React, { useEffect, useState } from 'react';
import {
    Button,
    CircularProgress,
    Flex,
    Grid,
    GridItem,
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
    Text,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import { AiOutlinePlus } from 'react-icons/ai';
import { FiChevronLeft } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { DocumentCard } from '../components/DocumentCard';
import { DocumentForm } from '../components/DocumentForm';
import { editDocument, getProject, updateProject } from '../services/projectServices';
import { Project } from '../types/Project';
import { ProjectDoughnut } from './ProjectDoughnut';
import { WorkplanForm } from '../components/WorkPlanForm';
import { WorkplanRow } from '../components/WorkplanRow';

export const ProjectDetails = () => {
    const { projectId } = useParams();
    const [isLoading, setLoading] = useState<boolean>(true);
    const [project, setProject] = useState<Project>();
    console.log({ project });
    const {
        isOpen: isDocumentModalOpen,
        onClose: onCloseDocumentModal,
        onOpen: onOpenDocumentModal,
    } = useDisclosure();
    const {
        isOpen: isDeleteModalOpen,
        onClose: onCloseDeleteModal,
        onOpen: onOpenDeleteModal,
    } = useDisclosure();
    const {
        isOpen: isWorkplanModalOpen,
        onClose: onCloseWorkPlanModal,
        onOpen: onOpenWorkplanModal,
    } = useDisclosure();
    const {
        isOpen: isDeleteWorkplanOpen,
        onClose: onCloseDeleteWorkplanModal,
        onOpen: onOpenDeleteWorkplanModal,
    } = useDisclosure();
    const [isDeletingDocument, setDeletingDocument] = useState<boolean>();
    const [isDeletingWorkplan, setDeletingWorkplan] = useState<boolean>();
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [selectedDocIndex, setSelectedDocumentIndex] = useState<number>();

    const [selectedWorkPlanIndex, setWorkplanIndex] = useState<number>();

    const toast = useToast();
    // Document Actions
    const addDocumentPrompt = () => {
        setMode('add');
        setSelectedDocumentIndex(undefined);
        onOpenDocumentModal();
    };

    const editDocumentPrompt = (index: number) => {
        setSelectedDocumentIndex(index);
        setMode('edit');
        onOpenDocumentModal();
    };
    const onDelete = async () => {
        if (!project || !project?.documents || selectedDocIndex === undefined)
            return;
        const newproject = { ...project };
        setDeletingDocument(true);
        newproject.documents?.splice(selectedDocIndex, 1);
        await editDocument(newproject?.documents || [], project);
        setSelectedDocumentIndex(undefined)
        onCloseDeleteModal();
        setDeletingDocument(false);
        setProject(newproject);
    };

    const deleteDocumentPrompt = async (index: number) => {
        setSelectedDocumentIndex(index);
        onOpenDeleteModal();
    };
    // Workplan Actions

    const addWorkPlan = () => {
        setMode('add');
        setWorkplanIndex(undefined);
        onOpenWorkplanModal();
    };
    const editWorkplanPrompt = async (index: number) => {
        setMode('edit');
        setWorkplanIndex(index);
        onOpenWorkplanModal();
    };

    const deleteWorkplanPrompt = async (index: number) => {
        setWorkplanIndex(index);
        onOpenDeleteWorkplanModal();
    };

    const onDeleteWorkPlan = async () => {
        if (!project || !project?.workplans || selectedWorkPlanIndex === undefined)
            return;
        const workplans = [...project.workplans]
        setDeletingWorkplan(true);
        workplans?.splice(selectedWorkPlanIndex, 1);
        await updateProject(project.id, { workplans });
        setWorkplanIndex(undefined)
        onCloseDeleteWorkplanModal();
        setDeletingWorkplan(false);
        setProject({...project, ...{ workplans }});
    };

    useEffect(() => {
        const fetchProject = async () => {
            if (!projectId) {
                setLoading(false);
                toast({
                    title: 'No project Id found bad link ☹️',
                    status: 'error',
                    duration: 3000,
                });
                return;
            }
            try {
                const project = (await getProject(projectId)) as Project;
                setProject(project);
                setLoading(false);
            } catch (error) {
                const err: any = error;
                setLoading(false);
                toast({
                    title: 'Could not fetch project details',
                    description: err?.message || 'Unknown error',
                    status: 'error',
                });
            }
        };
        fetchProject();
    }, [toast, projectId]);

    return (
        <Flex direction="column">
            <IconButton
                onClick={() => window.history.back()}
                alignSelf="flex-start"
                aria-label="go back"
                as={FiChevronLeft}
                variant="ghost"
            />
            {isLoading ? (
                <Flex direction="column" flex="1 1 auto">
                    <CircularProgress color="blue" />
                </Flex>
            ) : !project ? (
                <Text color="red.600">No project found</Text>
            ) : (
                <Flex pt={5} direction="column">
                    <Grid
                        templateColumns={{
                            base: 'repeat(1, 1fr)',
                            lg: 'repeat(12, 1fr)',
                        }}
                        width="100%"
                    >
                        <GridItem w="100%" colSpan={9} px={5}>
                            <Heading mb={8} fontSize="3xl">
                                {project.title}
                            </Heading>

                            <Heading fontSize="md" mb={2}>
                                Description
                            </Heading>
                            <Text fontSize="sm">{project.description}</Text>

                            <HStack mt={3} mb={3}>
                                <Heading fontSize="md">Documents</Heading>
                                <IconButton
                                    onClick={addDocumentPrompt}
                                    transition="background 700ms ease-out"
                                    icon={<Icon as={AiOutlinePlus} />}
                                    aria-label="add new Documant"
                                    variant="ghost"
                                    borderRadius="full"
                                    _hover={{
                                        background: 'brand.400',
                                        color: 'white',
                                    }}
                                />
                            </HStack>
                            {project.documents?.length ? (
                                <Grid
                                    gridGap={[2, 5]}
                                    templateColumns={{
                                        base: 'repeat(2, 1fr)',
                                        md: 'repeat(3, 1fr)',
                                        lg: 'repeat(3, 1fr)',
                                    }}
                                >
                                    {project.documents.map((document, i) => (
                                        <GridItem
                                            key={`document-section-${i}`}
                                            w="100%"
                                        >
                                            <DocumentCard
                                                document={document}
                                                onEdit={() =>
                                                    editDocumentPrompt(i)
                                                }
                                                onDelete={() =>
                                                    deleteDocumentPrompt(i)
                                                }
                                                key={`document-card-${i}`}
                                            />
                                        </GridItem>
                                    ))}
                                </Grid>
                            ) : (
                                <Flex
                                    direction="column"
                                    height="5rem"
                                    bg="white"
                                    my={2}
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Text
                                        color="gray.200"
                                        fontSize="xl"
                                        fontWeight="semibold"
                                    >
                                        No documents added yet{' '}
                                    </Text>
                                </Flex>
                            )}
                            <HStack mt={3} mb={3}>
                                <Heading fontSize="md">Workplans</Heading>
                                <IconButton
                                    transition="background 700ms ease-out"
                                    icon={<Icon as={AiOutlinePlus} />}
                                    aria-label="add new Documant"
                                    variant="ghost"
                                    onClick={addWorkPlan}
                                    borderRadius="full"
                                    _hover={{
                                        background: 'brand.400',
                                        color: 'white',
                                    }}
                                />
                            </HStack>

                            {project?.workplans?.length ? (
                                project.workplans.map((workplan, i) => (
                                    <WorkplanRow
                                        key = {`workplan-row-${i}`}
                                        workplan={workplan}
                                        onEditWorkPlan={() =>
                                            editWorkplanPrompt(i)
                                        }
                                        onDeleteWorkPlan={() =>
                                            deleteWorkplanPrompt(i)
                                        }
                                        projectId={project?.id || ""}
                                    />
                                ))
                            ) : (
                                <Flex
                                    direction="column"
                                    height="5rem"
                                    bg="white"
                                    my={2}
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Text
                                        color="gray.200"
                                        fontSize="xl"
                                        fontWeight="semibold"
                                    >
                                        No Workplan added yet{' '}
                                    </Text>
                                </Flex>
                            )}
                        </GridItem>
                        <GridItem colSpan={3} w="100%" px={3}>
                            <ProjectDoughnut />
                        </GridItem>
                    </Grid>
                </Flex>
            )}
            {project ? (
                <Modal
                    isOpen={isDocumentModalOpen}
                    onClose={onCloseDocumentModal}
                    size="xs"
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalCloseButton />
                        <ModalHeader>{`${mode} document`}</ModalHeader>
                        <ModalBody>
                            <DocumentForm
                                onClose={onCloseDocumentModal}
                                mode={mode}
                                setProject={setProject}
                                project={project}
                                index={selectedDocIndex}
                            />
                        </ModalBody>
                    </ModalContent>
                </Modal>
            ) : null}
            {project && project.documents && selectedDocIndex !== undefined ? (
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={onCloseDeleteModal}
                    size="sm"
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader py={8}>{`Delete Document`}</ModalHeader>
                        <ModalCloseButton size="sm" />
                        <ModalBody>
                            <Text>{`Are you sure you want to delete this document named ${
                                project.documents[selectedDocIndex]?.title ||
                                'unknown name'
                            }`}</Text>
                        </ModalBody>
                        <ModalFooter>
                            <Flex
                                width="100%"
                                direction="row"
                                justifyContent="space-between"
                            >
                                <Button
                                    disabled={isDeletingDocument}
                                    variant="outline"
                                    colorScheme="brand"
                                    onClick={onCloseDeleteModal}
                                >
                                    No
                                </Button>
                                <Button
                                    onClick={onDelete}
                                    isLoading={isDeletingDocument}
                                    variant="solid"
                                    colorScheme="brand"
                                >
                                    Yes
                                </Button>
                            </Flex>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            ) : null}
            {project ? (
                <Modal
                    isOpen={isWorkplanModalOpen}
                    onClose={onCloseWorkPlanModal}
                    size="xs"
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalCloseButton />
                        <ModalHeader>{`${mode} workplan`}</ModalHeader>
                        <ModalBody>
                            <WorkplanForm
                                onClose={onCloseWorkPlanModal}
                                mode={mode}
                                project={project}
                                index={selectedWorkPlanIndex}
                                setProject={setProject}
                            />
                        </ModalBody>
                    </ModalContent>
                </Modal>
            ) : null}
            {project &&
            project.workplans &&
            selectedWorkPlanIndex !== undefined ? (
                <Modal
                    isOpen={isDeleteWorkplanOpen}
                    onClose={onCloseDeleteWorkplanModal}
                    size="sm"
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader py={8}>{`Delete Workplan`}</ModalHeader>
                        <ModalCloseButton size="sm" />
                        <ModalBody>
                            <Text>{`Are you sure you want to delete this workplan named ${
                                project.workplans[selectedWorkPlanIndex]
                                    .title || 'unknown name'
                            } including all assotiated tasks under this`}</Text>
                        </ModalBody>
                        <ModalFooter>
                            <Flex
                                width="100%"
                                direction="row"
                                justifyContent="space-between"
                            >
                                <Button
                                    disabled={isDeletingWorkplan}
                                    variant="outline"
                                    colorScheme="brand"
                                    onClick={onCloseDeleteWorkplanModal}
                                >
                                    No
                                </Button>
                                <Button
                                    onClick={onDeleteWorkPlan}
                                    isLoading={isDeletingWorkplan}
                                    variant="solid"
                                    colorScheme="brand"
                                >
                                    Yes
                                </Button>
                            </Flex>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            ) : null}
        </Flex>
    );
};
