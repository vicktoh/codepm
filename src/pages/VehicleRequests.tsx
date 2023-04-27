import {
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { ReactElement, useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import {
  BsCalendar2,
  BsChatFill,
  BsCheck2All,
  BsClock,
  BsEye,
  BsPencil,
  BsPlus,
  BsPrinter,
  BsXCircle,
} from "react-icons/bs";
import { VehicleRequestForm } from "../components/VehicleRequestForm";
import { DeleteDialog } from "../components/DeleteDialog";
import { useAppSelector } from "../reducers/types";
import {
  deleteVehicleRequest,
  listenOnMyVehicleRequests,
} from "../services/vehicleServices";
import { VehicleRequest } from "../types/VehicleRequest";
import { VehicleSchedule } from "../components/VehicleSchedule";
import { usePrintVehicleapproval } from "../hooks/usePrintRequisition";
import { RequestChat } from "../components/RequestChat";
import { VehicleRquestChat } from "../components/VehicleRequestChat";

export const REQ_STATUS_ICONS: Record<VehicleRequest["status"], ReactElement> =
  {
    approved: <BsCheck2All color="green" />,
    declined: <BsXCircle color="red" />,
    pending: <BsClock color="orange" />,
    reviewed: <BsEye color="blue" />,
  };
export const VehicleRequests = () => {
  const [myVehicleRequest, setMyVehicleRequests] = useState<VehicleRequest[]>();
  const { users } = useAppSelector(({ users }) => ({ users }));
  const { usersMap = {} } = users || {};
  const [selectedRequest, setSelectedRequest] = useState<VehicleRequest>();
  const [deleting, setDeleting] = useState<boolean>(false);
  const [printing, setPrinting] = useState(false);
  const toast = useToast();
  const [mode, setMode] = useState<"add" | "edit">("add");
  const printRequest = usePrintVehicleapproval();
  const {
    onOpen: onOpenVehModal,
    onClose: onCloseVehModal,
    isOpen: isVehModalOpen,
  } = useDisclosure();
  const {
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
    isOpen: isDeleteModalOpen,
  } = useDisclosure();
  const {
    onOpen: onOpenScheduleModal,
    onClose: onCloseScheduleModal,
    isOpen: isScheduleModalOpen,
  } = useDisclosure();
  const {
    onOpen: onOpenRequestChat,
    onClose: onCloseRequestChat,
    isOpen: isRequestChatOpen,
  } = useDisclosure();
  const { auth } = useAppSelector(({ auth }) => ({ auth }));
  const [loading, setLoading] = useState(false);

  const onMakeVehRequest = () => {
    setMode("add");
    setSelectedRequest(undefined);
    onOpenVehModal();
  };

  const onEditRequest = (request: VehicleRequest) => {
    setSelectedRequest(request);
    setMode("edit");
    onOpenVehModal();
  };

  const onPrintRequest = async (request: VehicleRequest) => {
    setSelectedRequest(request);
    try {
      setPrinting(true);
      await printRequest(request);
    } catch (error) {
      const err: any = error;
      toast({
        title: err?.message || "Could not print request",
        status: "error",
      });
    } finally {
      setPrinting(false);
    }
  };

  const deletePrompt = (request: VehicleRequest) => {
    setSelectedRequest(request);
    onOpenDeleteModal();
  };
  const onDelete = async () => {
    if (!selectedRequest) return;
    try {
      setDeleting(true);
      await deleteVehicleRequest(selectedRequest?.id);
      toast({ title: "Deleted Succesfully", status: "success" });
      onCloseDeleteModal();
    } catch (error) {
      console.log(error);
      toast({ title: "Could not delete request", status: "error" });
    } finally {
      setDeleting(false);
    }
  };
  const onOpenRequestConverstaion = (req: VehicleRequest) => {
    setSelectedRequest(req);
    onOpenRequestChat();
  };
  useEffect(() => {
    setLoading(true);
    const unsub = listenOnMyVehicleRequests(auth?.uid || "", (reqs) => {
      setLoading(false);
      setMyVehicleRequests(reqs);
    });

    return unsub;
  }, [auth?.uid]);
  return (
    <Flex direction="column" flex="1 1">
      <HStack alignItems="center" spacing={4} mb={5}>
        <Heading fontSize="lg">Vehicle Requests 🚗</Heading>
        <Tooltip label="New vehicle request">
          <IconButton
            aria-label="make request"
            onClick={onMakeVehRequest}
            borderRadius="full"
            size="sm"
            colorScheme="brand"
            icon={<BsPlus />}
          />
        </Tooltip>
        <Tooltip label="View vehicle schedule">
          <IconButton
            aria-label="view schedule"
            borderRadius="full"
            size="sm"
            colorScheme="brand"
            icon={<BsCalendar2 />}
            onClick={onOpenScheduleModal}
          />
        </Tooltip>
      </HStack>
      {loading ? (
        <Flex
          alignItems="center"
          justifyContent="center"
          direction="column"
          height="152px"
        >
          <Spinner />
          <Text>Loading....</Text>
        </Flex>
      ) : (
        <TableContainer mb={8}>
          <Table>
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Duration</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {myVehicleRequest?.length ? (
                myVehicleRequest.map((req) => (
                  <Tr key={`vehicle-request-${req.id}`}>
                    <Td>{format(req.timestamp, "do MMM Y")}</Td>
                    <Td>{`${format(req.startTime, "KK:mm aaa")} - ${format(
                      req.endTime,
                      "KK:mm aaa",
                    )}`}</Td>
                    <Td>
                      <VStack alignItems="flex-start">
                        <HStack alignItems="center" spacing={2}>
                          <Text>{req.status}</Text>
                          {REQ_STATUS_ICONS[req.status]}
                        </HStack>
                        <Text size="xs">
                          {req.status === "approved" && req.approvedBy
                            ? usersMap[req.approvedBy]?.displayName || "Unknown"
                            : ""}
                          {req.status === "reviewed" && req.reviewedBy
                            ? usersMap[req.reviewedBy]?.displayName || "Unknown"
                            : ""}
                          {req.status === "declined" && req.declinedBy
                            ? usersMap[req.declinedBy]?.displayName || "Unknown"
                            : ""}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        {req.status !== "approved" ? (
                          <>
                            <Tooltip label="Edit Request">
                              <IconButton
                                aria-label="edit Button"
                                icon={<BsPencil />}
                                size="sm"
                                bg="blue.300"
                                color="white"
                                onClick={() => onEditRequest(req)}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Request">
                              <IconButton
                                aria-label="delete Button"
                                icon={<BiTrash />}
                                size="sm"
                                bg="brand.400"
                                color="white"
                                onClick={() => deletePrompt(req)}
                              />
                            </Tooltip>
                          </>
                        ) : null}
                        {req.status === "approved" ? (
                          <Tooltip label="Print Request">
                            <IconButton
                              aria-label="print Button"
                              icon={<BsPrinter />}
                              size="sm"
                              bg="green.300"
                              color="white"
                              isLoading={
                                printing && selectedRequest?.id === req.id
                              }
                              onClick={() => onPrintRequest(req)}
                            />
                          </Tooltip>
                        ) : null}
                        <Box position="relative">
                          <IconButton
                            size="sm"
                            bg="blue.300"
                            color="white"
                            aria-label="open chat"
                            onClick={() => onOpenRequestConverstaion(req)}
                            icon={<BsChatFill />}
                          />
                          {req.chatCount &&
                          req.conversation &&
                          (req.chatCount - req.conversation[auth?.uid || ""] ||
                            0) > 0 ? (
                            <Badge
                              borderRadius="ful"
                              background="red.300"
                              color="white"
                              position="absolute"
                              top={-2}
                              right={-3}
                            >
                              {req.chatCount -
                                req.conversation[auth?.uid || ""] || 0}
                            </Badge>
                          ) : null}
                        </Box>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={5}>
                    <Flex width="100%" direction="column" alignItems="center">
                      <Heading>Empty Requests 📝</Heading>
                      <Text>
                        You do not have any request, click the + button to make
                        a vehicle request
                      </Text>
                    </Flex>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      <Modal isOpen={isVehModalOpen} onClose={onCloseVehModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign="center">VehicleRequest</ModalHeader>
          <ModalBody>
            <VehicleRequestForm
              request={selectedRequest}
              onClose={onCloseVehModal}
              mode={mode}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal size="xs" isOpen={isDeleteModalOpen} onClose={onCloseDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign="center">Delete request 🗑</ModalHeader>
          <ModalBody>
            <DeleteDialog
              onClose={onCloseDeleteModal}
              onConfirm={onDelete}
              title="Are you sure you want to delete this request?"
              isLoading={deleting}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        size="2xl"
        isOpen={isScheduleModalOpen}
        onClose={onCloseScheduleModal}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign="center">Vehicle Schedule 📆</ModalHeader>
          <ModalBody>
            <VehicleSchedule />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isRequestChatOpen} onClose={onCloseRequestChat}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign="center">🚘 Vehicle Conversations</ModalHeader>
          <ModalBody>
            {selectedRequest && <VehicleRquestChat request={selectedRequest} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
