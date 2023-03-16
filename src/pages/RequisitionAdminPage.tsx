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
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { isAfter, isBefore, isEqual } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
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
import { RetirementForm } from "../components/RequisitionForm/RetirementForm";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { useAppSelector } from "../reducers/types";
import { listenOnRequisitionAdmin } from "../services/requisitionServices";
import { UserRole } from "../types/Profile";
import { Requisition, RequisitionStatus } from "../types/Requisition";
const roleMap: Record<UserRole, RequisitionStatus | ""> = {
  admin: RequisitionStatus.checked,
  finance: RequisitionStatus.reviewed,
  reviewer: RequisitionStatus.budgetholder,
  budgetHolder: RequisitionStatus.pending,
  master: "",
  user: "",
};
export const RequisitionAdminPage = () => {
  const [requisitions, setRequisitions] = useState<Requisition[]>();
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition>();
  const { profile, auth } = useAppSelector(({ profile, auth }) => ({
    profile,
    auth,
  }));
  const [requisitionFilter, setRequisitionFilter] =
    useState<RequisitionFilterType>({
      type: "",
      endDate: "",
      startDate: "",
      status: auth ? roleMap[auth.role] : "",
    });
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
  const {
    isOpen: isRetirementModalOpen,
    onOpen: onOnpenRetirementModal,
    onClose: onCloseRetirementModal,
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

  const openRetirementModal = (requisition: Requisition) => {
    const req = { ...requisition };
    setSelectedRequisition(req);
    onOnpenRetirementModal();
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
    setRequisitionFilter(requisitionFilter);
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
        <RequisitionFilterForm
          confirm={onFilterRequisition}
          filter={requisitionFilter}
        />
      </SimpleGrid>
      <Heading fontSize="lg" my={5}>
        Requisition List
      </Heading>
      {isMobile ? (
        <Flex direction="column">
          {loading ? (
            <LoadingComponent title="Fetching requisitions" />
          ) : requisitions?.length ? (
            <>
              {requisitions
                .filter(onFilter)
                .map((requisition, i) => (
                  <RequisitionAdminComponent
                    key={`requisition-${i}`}
                    requisition={requisition}
                    onOpenRetirement={() => openRetirementModal(requisition)}
                    onViewRequisition={() => onViewRequisition(requisition)}
                    onOpenChat={() => onOpenConversation(requisition)}
                  />
                )) || (
                <Tr>
                  <Td colSpan={5}>
                    <EmptyState
                      title="No requisition to show"
                      description="Note❗️ showing filtered requisitions"
                    />
                  </Td>
                </Tr>
              )}
            </>
          ) : (
            <Tr>
              <Td colSpan={5}>
                <EmptyState title="Empty requisition list" />
              </Td>
            </Tr>
          )}
        </Flex>
      ) : (
        <TableContainer maxWidth="100%" whiteSpace="break-spaces">
          <Table whiteSpace="break-spaces">
            <Thead>
              <Tr>
                <Th>Requested By</Th>
                <Th>Title</Th>
                <Th>Status</Th>
                <Th>Amount</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            {loading ? (
              <LoadingComponent title="Fetching requisitions" />
            ) : requisitions?.filter(onFilter)?.length ? (
              <Tbody>
                {requisitions
                  .filter(onFilter)
                  .map((requisition, i) => (
                    <RequisitionAdminComponent
                      key={`requisition-${i}`}
                      requisition={requisition}
                      onOpenRetirement={() => openRetirementModal(requisition)}
                      onViewRequisition={() => onViewRequisition(requisition)}
                      onOpenChat={() => onOpenConversation(requisition)}
                    />
                  )) || (
                  <Tr>
                    <Td colSpan={5}>
                      <EmptyState
                        title="No requisition to show"
                        description="Note❗️ showing filtered requisitions"
                      />
                    </Td>
                  </Tr>
                )}
              </Tbody>
            ) : (
              <Tbody>
                <Tr>
                  <Td colSpan={5}>
                    <EmptyState
                      title="No requisition to show"
                      description="Note❗️ showing filtered requisitions"
                    />
                  </Td>
                </Tr>
              </Tbody>
            )}
          </Table>
        </TableContainer>
      )}

      <Modal
        size="3xl"
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
            {selectedRequisition ? (
              <RetirementForm
                onClose={onCloseRetirementModal}
                requisition={selectedRequisition}
                mode="approve"
              />
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
