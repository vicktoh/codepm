import {
  Avatar,
  Flex,
  Heading,
  HStack,
  Table,
  TableContainer,
  Text,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
  useDisclosure,
  IconButton,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  toast,
  useToast,
  Box,
  Badge,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { FC, ReactElement, useEffect, useMemo, useState } from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import { BiPencil } from "react-icons/bi";
import {
  BsChat,
  BsChatDots,
  BsCheck2,
  BsClock,
  BsEye,
  BsFilter,
  BsStopCircle,
  BsTrash,
} from "react-icons/bs";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { useAppSelector } from "../reducers/types";
import {
  deleteRequest,
  listenUserRequests,
  makeLeaveRequest,
  makeRequest,
  updateRequest,
} from "../services/logsServices";
import { Request } from "../types/Permission";
import { DeleteDialog } from "./DeleteDialog";
import { LeaveRequestForm } from "./LeaveRequestForm";
import { LogRequestForm } from "./LogRequestForm";
import { RequestChat } from "./RequestChat";
const statusIcons: Record<Request["status"], ReactElement> = {
  pending: <BsClock color="orange" />,
  approved: <BsCheck2 color="green" />,
  reviewed: <BsEye color="blue" />,
  declined: <BsStopCircle color="red" />,
};

type FilterType = Request["type"] | "all";
const RequestView: FC = () => {
  const { auth, users } = useAppSelector(({ auth, users }) => ({
    auth,
    users,
  }));
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [requests, setRequests] = useState<Request[]>();
  const [deleting, setDeleting] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const toast = useToast();
  const [selectedRequest, setSelectedRequest] = useState<Request>();

  const dataToRender = useMemo(() => {
    if (selectedFilter === "all") return requests;
    return requests?.filter((value) => value.type === selectedFilter);
  }, [selectedFilter, requests]);
  const {
    onOpen: onOpenLeaveRequest,
    onClose: onCloseLeaveRequest,
    isOpen: isLeaveRequestOpen,
  } = useDisclosure();
  const {
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
    isOpen: isDeleteModalOpen,
  } = useDisclosure();
  const {
    onOpen: onOpenRequestChat,
    onClose: onCloseRequestChat,
    isOpen: isRequestChatOpen,
  } = useDisclosure();
  const {
    onOpen: onOpenAccessRequest,
    onClose: onCloseAccessRequest,
    isOpen: isAccessRequestOpen,
  } = useDisclosure();
  const [loading, setLoading] = useState<boolean>(false);
  const { usersMap = {} } = users || {};
  const glassEffect = useGlassEffect(true);
  const onRequestForLeave = async (
    values: Omit<Request, "status" | "type" | "userId" | "timestamp">,
  ) => {
    const id = await makeLeaveRequest(auth?.uid || "", values, "leave");
    onCloseLeaveRequest();
    return id;
  };
  const onAccessRequest = async (
    values: Omit<Request, "status" | "userId" | "timestamp">,
  ) => {
    // console.log({ values }, "from send");
    const id = await makeRequest(auth?.uid || "", values);
    onCloseLeaveRequest();
    return id;
  };
  const onOpenEditRequest = async (
    req: Request,
    type: Request["type"] = "leave",
  ) => {
    setSelectedRequest(req);
    setMode("edit");
    type === "leave" ? onOpenLeaveRequest() : onOpenAccessRequest();
  };

  const onOpenAddRequest = (type: Request["type"]) => {
    setSelectedRequest(undefined);
    setMode("add");
    type === "leave" && onOpenLeaveRequest();
    type === "log" && onOpenAccessRequest();
  };

  const deletePrompt = (req: Request) => {
    setSelectedRequest(req);
    onOpenDeleteModal();
  };

  const onDelete = async () => {
    if (!selectedRequest?.id) return;
    try {
      setDeleting(true);
      await deleteRequest(selectedRequest?.id);
      onCloseDeleteModal();
      toast({ title: "Request Deleted", status: "success" });
    } catch (error) {
      console.log(error);
      toast({ title: "Could delete request", status: "error" });
    } finally {
      setDeleting(false);
    }
  };
  const onOpenRequestConverstaion = (req: Request) => {
    setSelectedRequest(req);
    onOpenRequestChat();
  };
  const onEditRequest = async (req: Request) => {
    if (!req.id) return;
    try {
      await updateRequest(req);
    } catch (error) {
      toast({ title: "Could not update request", status: "error" });
    }
  };
  useEffect(() => {
    const fetchMyRequests = async () => {
      if (!auth?.uid) return;
      setLoading(true);
      const unsub = listenUserRequests(auth?.uid, (requests) => {
        setLoading(false);
        setRequests(requests);
      });
      return unsub;
    };
    fetchMyRequests();
  }, [auth?.uid]);
  return (
    <Flex direction="column" flex="1 1" width="100%" py={8} px={2}>
      <Flex
        justifyContent="space-between"
        width="100%"
        alignItems="flex-end"
        mb={5}
      >
        <HStack alignItems="center" spacing={3}>
          <Button
            leftIcon={<AiFillPlusCircle />}
            colorScheme="brand"
            aria-label="new Request"
            size="sm"
            onClick={() => onOpenAddRequest("leave")}
          >
            Leave Request
          </Button>
          <Button
            leftIcon={<AiFillPlusCircle />}
            colorScheme="brand"
            aria-label="new Request"
            size="sm"
            onClick={() => onOpenAddRequest("log")}
          >
            Log Request
          </Button>
        </HStack>

        <VStack alignItems="flext-start">
          <Heading fontSize="sm">Filter Requests</Heading>
          <HStack spacing={3}>
            {["all", "leave", "log"].map((type) => (
              <Button
                key={`filter-${type}`}
                value={type}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFilter(type as FilterType)}
                {...(type === selectedFilter ? glassEffect : {})}
              >
                {type}
              </Button>
            ))}
          </HStack>
        </VStack>
      </Flex>

      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Day of Request</Th>
              <Th>Type of Request</Th>
              <Th>Status of Request</Th>
              <Th>Dept. Head</Th>
              <Th>Comments</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={5}>Fetching Requests</Td>
              </Tr>
            ) : dataToRender?.length ? (
              dataToRender.map((req) => (
                <Tr key={req.timestamp}>
                  <Td>
                    <HStack alignItems="center">
                      {!["approve", "declined"].includes(req.status) ? (
                        <IconButton
                          size="sm"
                          aria-label="edit request"
                          onClick={() => onOpenEditRequest(req, req.type)}
                          icon={<BiPencil />}
                        />
                      ) : null}
                      <Text>
                        {format(new Date(req.timestamp), "do MMM yyyy")}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <VStack alignItems="flex-start">
                      <Text fontSize="lg" fontWeight="bold">
                        {req.type}
                      </Text>
                      {req.type === "leave" && req.leaveType ? (
                        <Text fontSize="sm" color="brand.400">
                          {req.leaveType}
                        </Text>
                      ) : null}
                    </VStack>
                  </Td>
                  <Td>
                    <HStack alignItems="center">
                      <Text fontSize="sm">{req.status}</Text>
                      {statusIcons[req.status]}
                    </HStack>
                  </Td>
                  <Td>
                    {req.attentionToId ? (
                      <Flex direction="column" alignItems="center">
                        <Avatar
                          size="sm"
                          src={usersMap[req.attentionToId]?.photoUrl}
                          name={usersMap[req.attentionToId]?.displayName}
                        />
                        <Text fontSize="xs">
                          {usersMap[req.attentionToId]?.displayName}
                        </Text>
                      </Flex>
                    ) : null}
                  </Td>
                  <Td>
                    <HStack>
                      <Box position="relative">
                        <IconButton
                          size="md"
                          aria-label="open chat"
                          onClick={() => onOpenRequestConverstaion(req)}
                          icon={<BsChatDots />}
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
                      {req.status === "pending" ? (
                        <Tooltip label="Delete request">
                          <IconButton
                            aria-label="remove"
                            bg="brand.300"
                            color="white"
                            icon={<BsTrash />}
                            onClick={() => deletePrompt(req)}
                          />
                        </Tooltip>
                      ) : null}
                    </HStack>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center">
                  You have not made any request yet
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
      <Modal isOpen={isLeaveRequestOpen} onClose={onCloseLeaveRequest}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign="center">🏝 Leave Request</ModalHeader>
          <ModalBody>
            <LeaveRequestForm
              onSubmit={onRequestForLeave}
              request={selectedRequest}
              onEdit={onEditRequest}
              mode={mode}
              onClose={onCloseLeaveRequest}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isAccessRequestOpen} onClose={onCloseAccessRequest}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign="center">
            🔓 Request Access to Past Logs
          </ModalHeader>
          <ModalBody>
            <LogRequestForm
              request={selectedRequest}
              onEdit={onEditRequest}
              mode={mode}
              onClose={onCloseAccessRequest}
              type="log"
              onSubmit={onAccessRequest}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isRequestChatOpen} onClose={onCloseRequestChat}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign="center">💬 Request Conversations</ModalHeader>
          <ModalBody>
            {selectedRequest && <RequestChat request={selectedRequest} />}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={onCloseDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign="center">🗑 Delete Request</ModalHeader>
          <ModalBody>
            <DeleteDialog
              title="Are you sure you want to delete this request?"
              onConfirm={onDelete}
              isLoading={deleting}
              onClose={onCloseDeleteModal}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default RequestView;
