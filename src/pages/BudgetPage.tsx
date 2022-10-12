import {
  Button,
  CircularProgress,
  Flex,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
  VisuallyHidden,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { ChangeEvent, useState } from "react";
import { useEffect } from "react";
import { BiChevronRight } from "react-icons/bi";
import { BsListCheck } from "react-icons/bs";
import { MdTableRows } from "react-icons/md";
import { useParams } from "react-router-dom";
import { BudgetTable } from "../components/BudgetTable";
import { EmptyState } from "../components/EmptyState";
import { LoadingComponent } from "../components/LoadingComponent";
import {
  deleteBudgetItem,
  listenOnBudget,
  uploadBudgetFromData,
} from "../services/budgetServices";
import { getProject } from "../services/projectServices";
import { BudgetItem, Project } from "../types/Project";
import Papa from "papaparse";
import { DeleteDialog } from "../components/DeleteDialog";
export const BudgetPage = () => {
  const { projectId } = useParams();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isFetchingBudget, setFetchingBudget] = useState<boolean>(true);
  const [status, setStatus] = useState<string>("No budget found");
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetItem>();
  const [project, setProject] = useState<Project>();
  const [budget, setBudget] = useState<BudgetItem[]>();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
  } = useDisclosure();
  const toast = useToast();

  const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) {
      toast({ title: "You must select a file to continue", status: "error" });
      return;
    }
    const file = e.target.files[0];
    if (file.type.split("/")[1] !== "csv") {
      toast({
        title: "Only CSV files are allowed, please select another file",
        status: "error",
      });
      return;
    }

    Papa.parse(file as any, {
      header: true,
      complete: async (res: any) => {
        try {
          console.log(res);
          setStatus("Uploading File");
          setLoadingFile(true);
          await uploadBudgetFromData(res.data as any, projectId || "");
        } catch (error) {
          console.log(error);
          const err: any = error;
          toast({
            title: "Could not upload file",
            description: err?.message || "Unknown Error, Try again",
            status: "error",
          });
        } finally {
          setLoadingFile(false);
        }
      },
    });
  };

  const onDeletePrompt = (budget: BudgetItem) => {
    setSelectedBudget(budget);
    onOpenDeleteModal();
  };
  const onDelete = async () => {
    if (!selectedBudget?.id || !projectId) return;
    try {
      setDeleting(true);
      await deleteBudgetItem(selectedBudget.id || "", projectId);
    } catch (error) {
      const err: any = error;
      toast({
        title: "Could not delete item",
        description: err?.message || "Unknown error",
        status: "error",
      });
    } finally {
      setDeleting(true);
      setSelectedBudget(undefined);
      onCloseDeleteModal();
    }
  };
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setLoading(false);
        toast({
          title: "No project Id found bad link ☹️",
          status: "error",
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
          title: "Could not fetch project details",
          description: err?.message || "Unknown error",
          status: "error",
        });
      }
    };
    fetchProject();
  }, [toast, projectId]);
  useEffect(() => {
    console.log(projectId);
    if (projectId && project?.budget) {
      console.log("fetching/budgets");
      const unsub = listenOnBudget(
        projectId,
        (budg) => {
          console.log("I ran");
          setFetchingBudget(false);
          setBudget(budg);
        },
        (e) => {
          console.log(e);
          toast({
            title: "Could not fetch budget line items",
            description: e,
            status: "error",
          });
        },
      );

      return unsub;
    }
  }, [projectId, toast, project?.budget]);
  return (
    <Flex direction="column" width="100%">
      {isLoading ? (
        <LoadingComponent title="Fetching Project Details..." />
      ) : project ? (
        <>
          <Heading fontSize="lg">{`Budget ${
            project ? `for ${project.title}` : ""
          } `}</Heading>

          <HStack mt={5} flexWrap="wrap" spacing={3} alignItems="center">
            <HStack spacing={1}>
              <Text>Funder:</Text>
              <Text fontWeight="bold">{project?.funder}</Text>
            </HStack>
            <HStack spacing={1}>
              <Text>Added on:</Text>
              <Text fontWeight="bold">
                {format(project?.dateAdded as Date, "dd MMM Y")}
              </Text>
            </HStack>
          </HStack>
          <HStack my={5} spacing={[3, 5]}>
            <Button
              rightIcon={<Icon as={BiChevronRight} />}
              size="sm"
              variant="outline"
              colorScheme="blue"
            >
              Details
            </Button>
            <Button
              variant="outline"
              colorScheme="teal"
              size="sm"
              leftIcon={<Icon as={BsListCheck} />}
            >
              Project Tasks
            </Button>
          </HStack>
        </>
      ) : (
        <EmptyState title="Could not fetch project refresh" />
      )}
      <Flex direction="column" flex="1 1" overflowY="auto" height="100%">
        <Heading fontSize="lg" my={5}>
          Budget Items
        </Heading>
        {project?.budget && isFetchingBudget ? (
          <LoadingComponent title="Fetching budget items..." />
        ) : budget?.length ? (
          <BudgetTable onDeletePrompt={onDeletePrompt} budget={budget} />
        ) : (
          <Flex direction="column">
            {loadingFile ? (
              <CircularProgress alignSelf="center" isIndeterminate />
            ) : null}
            <EmptyState title={status} />
            <VisuallyHidden>
              <Input type="file" id="file-input" onChange={onFileSelected} />
            </VisuallyHidden>
            <Button
              my={2}
              as={FormLabel}
              htmlFor="file-input"
              alignSelf="center"
              leftIcon={<Icon as={MdTableRows} />}
            >
              Upload From template
            </Button>
          </Flex>
        )}
      </Flex>
      <Modal isOpen={isDeleteModalOpen} onClose={onCloseDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Budget Item</ModalHeader>
          <ModalBody>
            <DeleteDialog
              isLoading={deleting}
              title="Are you sure you want to delete this budget Item"
              onConfirm={onDelete}
              onClose={onCloseDeleteModal}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
