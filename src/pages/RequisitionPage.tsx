import {
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { isAfter, isBefore, isEqual } from "date-fns";
import React, { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DeleteDialog } from "../components/DeleteDialog";
import { EmptyState } from "../components/EmptyState";
import { LoadingComponent } from "../components/LoadingComponent";
import { RequisitionComponent } from "../components/RequisitionComponent";
import {
  RequisitionFilterForm,
  RequisitionFilterType,
} from "../components/RequisitionFilterForm";
import { RequisitionForm } from "../components/RequisitionForm";
import RequisitionStatsComponent from "../components/RequisitionStatsComponent";
import { setRequisition } from "../reducers/requisitionsSlice";
import { useAppSelector } from "../reducers/types";
import {
  deleteRequisition,
  listenOnRequisition,
} from "../services/requisitionServices";
import { Requisition } from "../types/Requisition";

export const RequisitionPage: FC = () => {
  const { auth, requisitions } = useAppSelector(({ auth, requisitions }) => ({
    requisitions,
    auth,
  }));
  console.log({ requisitions });
  const dispatch = useDispatch();
  const toast = useToast();
  const [requisitionFilter, setFilterFilter] =
    useState<RequisitionFilterType>();
  const [loading, setLoading] = useState<boolean>();
  const [deleting, setDeleting] = useState<boolean>();
  const [mode, setMode] = useState<"add" | "edit">("add");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isConversationModalOpen,
    onOpen: onOnpenConversationModal,
    onClose: onCloseConversationalModal,
  } = useDisclosure();
  const {
    isOpen: isRetirementModalOpen,
    onOpen: onOnpenRetirementModal,
    onClose: onCloseRetirementModal,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
  } = useDisclosure();
  const [selectedReq, setSelectedReq] = useState<Requisition>();

  const editRequisition = (requisition: Requisition) => {
    const req = { ...requisition };
    setSelectedReq(req);
    setMode("edit");
    onOpen();
  };
  const printRequisition = (requisition: Requisition) => {
    const req = { ...requisition };
    setSelectedReq(req);
  };
  const downloadRequisition = (requisition: Requisition) => {
    const req = { ...requisition };
    setSelectedReq(req);
  };
  const openConversationModal = (requisition: Requisition) => {
    const req = { ...requisition };
    setSelectedReq(req);
    onOnpenConversationModal();
  };
  const openRetirementModal = (requisition: Requisition) => {
    const req = { ...requisition };
    setSelectedReq(req);
    onOnpenRetirementModal();
  };
  const openDeleteModal = (requisition: Requisition) => {
    const req = { ...requisition };
    setSelectedReq(req);
    onOpenDeleteModal();
  };
  const onFilter = (requisition: Requisition, i: number) => {
    if (!requisitionFilter) return true;
    const isStartDate = requisitionFilter.startDate
      ? isAfter(requisition.timestamp, new Date(requisitionFilter.startDate)) ||
        isEqual(requisition.timestamp, new Date(requisitionFilter.startDate))
      : true;
    const isEndDate = requisitionFilter.endDate
      ? isBefore(requisition.timestamp, new Date(requisitionFilter.endDate)) ||
        isEqual(requisition.timestamp, new Date(requisitionFilter.endDate))
      : true;
    const isStatus = requisitionFilter.status
      ? requisitionFilter.status === requisition.status
      : true;
    const isType = requisitionFilter.type
      ? requisitionFilter.type === requisition.type
      : true;

    return isStartDate && isEndDate && isStatus && isType;
  };
  const deleteReq = async () => {
    try {
      setDeleting(true);
      deleteRequisition(auth?.uid || "", selectedReq?.id || "");
    } catch (error) {
      const err: any = error;
      toast({
        title: "Could not delete",
        description: err?.message || "Unexpected error",
        status: "error",
      });
    } finally {
      onCloseDeleteModal();
    }
  };
  useEffect(() => {
    if (!requisitions && auth) {
      setLoading(true);
      listenOnRequisition(
        auth.uid,
        (reqs) => {
          setLoading(false);
          dispatch(setRequisition(reqs));
        },
        (message) => {
          console.log(message);
          setLoading(false);
          toast({
            title: "Could not fetch requisitions",
            description: message,
            status: "error",
          });
        },
      );
    }
  }, [auth, requisitions, dispatch, toast]);

  if (!requisitions && loading) {
    return <LoadingComponent title="loading requisitions..." />;
  }

  const addNewRequisition = () => {
    setSelectedReq(undefined);
    setMode("add");
    onOpen();
  };
  return (
    <Flex direction="column">
      <Heading fontSize="lg" my={5}>
        My requisitions
      </Heading>
      <SimpleGrid columns={[1, 2]}>
        <RequisitionFilterForm confirm={setFilterFilter} />
        <RequisitionStatsComponent />
      </SimpleGrid>
      <Button
        onClick={addNewRequisition}
        alignSelf="flex-start"
        mt={5}
        colorScheme="brand"
      >
        New Requisiton
      </Button>
      {requisitions?.length ? (
        <Flex direction="column" flex="1 1" mt={5}>
          {requisitions.filter(onFilter).map((requisition, i) => (
            <RequisitionComponent
              openConversations={() => openConversationModal(requisition)}
              openRetirement={() => openRetirementModal}
              onEdit={() => editRequisition(requisition)}
              key={`requisition-${i}`}
              requisition={requisition}
              onPrint={() => printRequisition(requisition)}
              onDownload={() => downloadRequisition(requisition)}
              onDelete={() => openDeleteModal(requisition)}
            />
          ))}
        </Flex>
      ) : (
        <EmptyState title="You dont have any requisitions yet" />
      )}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>
            <Heading fontSize="2xl">Requisition🤑</Heading>
          </ModalHeader>
          <ModalBody>
            <RequisitionForm
              requisition={selectedReq}
              mode={mode}
              onClose={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isRetirementModalOpen}
        onClose={onCloseRetirementModal}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>
            <Heading fontSize="2xl">Retirements 🧮</Heading>
          </ModalHeader>
          <ModalBody>
            <Heading>Retirement</Heading>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={onCloseDeleteModal} size="xs">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>
            <Heading fontSize="lg">Delete Requisition 🗑</Heading>
          </ModalHeader>
          <ModalBody>
            <DeleteDialog
              title="Are you sure want to delete this requisition"
              isLoading={deleting}
              onClose={onCloseDeleteModal}
              onConfirm={deleteReq}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isConversationModalOpen}
        onClose={onCloseConversationalModal}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>
            <Heading fontSize="2xl">Converstations 💬 </Heading>
          </ModalHeader>
          <ModalBody>
            <Heading>Conversations</Heading>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
