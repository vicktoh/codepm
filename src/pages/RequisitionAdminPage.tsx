import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
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
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { LoadingComponent } from "../components/LoadingComponent";
import { RequisitionAdminComponent } from "../components/RequisitionAdminComponent";
import {
  RequisitionFilterForm,
  RequisitionFilterType,
} from "../components/RequisitionFilterForm";
import { RequisitionAdminForm } from "../components/RequisitionForm/RequisitionAdminForm";
import { RequisitionChat } from "../components/RequisitionForm/RequisitionChat";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { useAppSelector } from "../reducers/types";
import { listenOnRequisitionAdmin } from "../services/requisitionServices";
import { Requisition } from "../types/Requisition";

export const RequisitionAdminPage = () => {
  const [requisitions, setRequisitions] = useState<Requisition[]>();
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition>();
  const { profile } = useAppSelector(({ profile }) => ({ profile }));
  const [loading, setLoading] = useState<boolean>(true);
  const {
    onOpen: onOpenRequisitionModal,
    onClose: onCloseRequisitionModal,
    isOpen: isRequisitionModalOpen,
  } = useDisclosure();
  const {
    onOpen: onOpenChatModal,
    onClose: onCloseChatModal,
    isOpen: isChatModalOpen,
  } = useDisclosure();
  const toast = useToast();
  const glassEffect = useGlassEffect(false);
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });

  const onViewRequisition = (requisition: Requisition) => {
    setSelectedRequisition(requisition);
    onOpenRequisitionModal();
  };
  const onOpenConversation = (requisition: Requisition) => {
    setSelectedRequisition(requisition);
    onOpenChatModal();
  };
  useEffect(() => {
    const unsubscribe = listenOnRequisitionAdmin(
      (reqs) => {
        setLoading(false);
        setRequisitions(reqs);
      },
      (err) =>
        toast({
          title: "Could not fetch requisitions",
          status: "error",
          description: err.message,
        }),
    );
    return unsubscribe;
  }, [toast]);
  const onFilterRequisition = (requisitionFilter: RequisitionFilterType) => {
    console.log(requisitionFilter);
  };
  return (
    <Flex px={5} direction="column" pt={5}>
      {profile?.signatureUrl ? null : (
        <Alert status="error">
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
      <SimpleGrid mt={4} columns={[1, 2]} gridGap={3}>
        <RequisitionFilterForm confirm={onFilterRequisition} />
      </SimpleGrid>
      <Heading fontSize="lg" my={5}>
        Requisition List
      </Heading>
      {loading ? (
        <LoadingComponent title="Fetching requisitions" />
      ) : requisitions?.length ? (
        requisitions.map((requisition, i) => (
          <RequisitionAdminComponent
            key={`requisition-${i}`}
            requisition={requisition}
            onViewRequisition={() => onViewRequisition(requisition)}
            onOpenChat={() => onOpenConversation(requisition)}
          />
        ))
      ) : (
        <EmptyState title="Empty requisition list" />
      )}
      <Modal
        size="xl"
        isOpen={isRequisitionModalOpen}
        onClose={onCloseRequisitionModal}
      >
        <ModalOverlay />
        <ModalContent {...glassEffect}>
          <ModalCloseButton />
          <ModalHeader>
            <Heading fontSize={isMobile ? "md" : "lg"}>
              Review Requisition
            </Heading>
          </ModalHeader>
          <ModalBody>
            {selectedRequisition && (
              <RequisitionAdminForm
                onClose={onCloseRequisitionModal}
                requisition={selectedRequisition}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal size="xl" isOpen={isChatModalOpen} onClose={onCloseChatModal}>
        <ModalOverlay />
        <ModalContent {...glassEffect}>
          <ModalCloseButton />
          <ModalHeader>
            <Heading fontSize={isMobile ? "md" : "lg"}>Conversation 💬</Heading>
          </ModalHeader>
          <ModalBody>
            {selectedRequisition && (
              <RequisitionChat requisition={selectedRequisition} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
