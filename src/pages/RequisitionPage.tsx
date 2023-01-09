import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
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
  Text,
  useBreakpointValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { isAfter, isBefore, isEqual } from "date-fns";
import React, { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { DeleteDialog } from "../components/DeleteDialog";
import { EmptyState } from "../components/EmptyState";
import { LoadingComponent } from "../components/LoadingComponent";
import { RequisitionComponent } from "../components/RequisitionComponent";
import {
  RequisitionFilterForm,
  RequisitionFilterType,
} from "../components/RequisitionFilterForm";
import { RequisitionForm } from "../components/RequisitionForm";
import { RequisitionChat } from "../components/RequisitionForm/RequisitionChat";
import { RetirementForm } from "../components/RequisitionForm/RetirementForm";
import RequisitionStatsComponent from "../components/RequisitionStatsComponent";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { setRequisition } from "../reducers/requisitionsSlice";
import { useAppSelector } from "../reducers/types";
import { setVendors } from "../reducers/vendorSlice";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import codeLogo from "../assets/images/logo.png";

import {
  deleteRequisition,
  listenOnRequisition,
  listenOnVendors,
} from "../services/requisitionServices";
import { Requisition } from "../types/Requisition";
import { getBase64FromUrl, tobase64 } from "../helpers";
import { requisitionPrintDefinition } from "../services/requisitonPrint";
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

export const RequisitionPage: FC = () => {
  const { auth, requisitions, profile, vendors, users } = useAppSelector(
    ({ auth, requisitions, profile, vendors, users }) => ({
      requisitions,
      auth,
      profile,
      vendors,
      users,
    }),
  );
  const usersMap = users?.usersMap || {};
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
  const glassEffect = useGlassEffect();
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
  const editRequisition = (requisition: Requisition) => {
    const req = { ...requisition };
    setSelectedReq(req);
    setMode("edit");
    onOpen();
  };
  const printRequisition = async (requisition: Requisition) => {
    const {
      creatorId,
      budgetHolderId = "",
      checkedById = "",
      approvedById = "",
    } = { ...requisition };
    const signatures = [
      requisition.creator.signatureUrl || usersMap[creatorId]?.signatureUrl,
      requisition.budgetHolderCheck?.signatureUrl ||
        usersMap[budgetHolderId]?.signatureUrl,
      requisition.checkedby?.signatureUrl ||
        usersMap[checkedById]?.signatureUrl,
      requisition.approvedBy?.signatureUrl ||
        usersMap[approvedById]?.signatureUrl,
    ];
    const signatureDataUrls = [];
    for (const sig of signatures) {
      if (!sig) {
        signatureDataUrls.push(null);
        continue;
      }
      const dataUrl = (await getBase64FromUrl(sig)) as string;
      signatureDataUrls.push(dataUrl);
    }
    const logoImage = await tobase64(codeLogo);
    const docDefinition = requisitionPrintDefinition(
      { ...requisition },
      logoImage as string,
      signatureDataUrls,
    );
    pdfMake.createPdf(docDefinition as any).open();
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
      setDeleting(false);
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
  useEffect(() => {
    if (!auth?.uid || vendors) return;
    const unsub = listenOnVendors(auth.uid, (vend) => {
      dispatch(setVendors(vend));
    });
    return unsub;
  }, [auth?.uid, vendors, dispatch]);
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
      {profile?.signatureUrl ? null : (
        <Alert status="error" my={5}>
          <AlertIcon />
          <AlertTitle>Upload your signature</AlertTitle>
          <AlertDescription>
            Your signature is needed for any requisition action. Update profile{" "}
            <Text
              as={Link}
              textDecor="underline"
              color="brand.500"
              to="/profile"
            >
              Here
            </Text>
          </AlertDescription>
        </Alert>
      )}
      <SimpleGrid columns={[1, 2]} columnGap={[3, 1]} gridGap={[3, 5]}>
        <RequisitionFilterForm confirm={setFilterFilter} />
        <RequisitionStatsComponent />
      </SimpleGrid>
      <Button
        onClick={addNewRequisition}
        alignSelf="flex-start"
        mt={5}
        colorScheme="brand"
        disabled={!!!profile?.signatureUrl}
      >
        New Requisiton
      </Button>
      {requisitions?.length ? (
        <Flex direction="column" flex="1 1" mt={5}>
          {requisitions.filter(onFilter).map((requisition, i) => (
            <RequisitionComponent
              openConversations={() => openConversationModal(requisition)}
              openRetirement={() => openRetirementModal(requisition)}
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
            <Heading fontSize="2xl">Retirement 🧮</Heading>
          </ModalHeader>
          <ModalBody>
            {selectedReq ? (
              <RetirementForm
                onClose={onCloseRetirementModal}
                requisition={selectedReq}
              />
            ) : null}
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
        <ModalContent {...glassEffect}>
          <ModalCloseButton />
          <ModalHeader>
            <Heading fontSize={isMobile ? "md" : "lg"}>Conversation 💬</Heading>
          </ModalHeader>
          <ModalBody>
            {selectedReq && <RequisitionChat requisition={selectedReq} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
