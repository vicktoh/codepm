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
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { FC, ReactElement, useEffect, useState } from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import { BiPencil } from "react-icons/bi";
import {
  BsChat,
  BsChatDots,
  BsCheck2,
  BsClock,
  BsEye,
  BsStopCircle,
} from "react-icons/bs";
import { useAppSelector } from "../reducers/types";
import {
  listenUserRequests,
  makeLeaveRequest,
  makeRequest,
  updateRequest,
} from "../services/logsServices";
import { Request } from "../types/Permission";
import { LeaveRequestForm } from "./LeaveRequestForm";
import { LogRequestForm } from "./LogRequestForm";
import { RequestChat } from "./RequestChat";
const statusIcons: Record<Request["status"], ReactElement> = {
  pending: <BsClock color="orange" />,
  approved: <BsCheck2 color="green" />,
  reviewed: <BsEye color="blue" />,
  declined: <BsStopCircle color="red" />,
};
const RequestView: FC = () => {
  const { auth, users } = useAppSelector(({ auth, users }) => ({
    auth,
    users,
  }));
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [requests, setRequests] = useState<Request[]>();
  const toast = useToast();
  const [selectedRequest, setSelectedRequest] = useState<Request>();
  const {
    onOpen: onOpenLeaveRequest,
    onClose: onCloseLeaveRequest,
    isOpen: isLeaveRequestOpen,
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
  const onRequestForLeave = async (
    values: Omit<Request, "status" | "type" | "userId" | "timestamp">,
  ) => {
    await makeLeaveRequest(auth?.uid || "", values, "leave");
    onCloseLeaveRequest();
  };
  const onAccessRequest = async (
    values: Omit<Request, "status" | "userId" | "timestamp">,
  ) => {
    // console.log({ values }, "from send");
    await makeRequest(auth?.uid || "", values);
    onCloseLeaveRequest();
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
      <HStack alignItems="center" mb={5} spacing={3}>
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
            ) : requests?.length ? (
              requests.map((req) => (
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
                    <Box position="relative">
                      <IconButton
                        size="md"
                        aria-label="open chat"
                        onClick={() => onOpenRequestConverstaion(req)}
                        icon={<BsChatDots />}
                      />
                    </Box>
                    {req.chatCount &&
                    req.conversation &&
                    (req.chatCount - req.conversation[auth?.uid || ""] || 0) >
                      0 ? (
                      <Badge
                        borderRadius="ful"
                        background="red.300"
                        color="white"
                        position="absolute"
                        top={-2}
                        right={-3}
                      >
                        {req.chatCount - req.conversation[auth?.uid || ""] || 0}
                      </Badge>
                    ) : null}
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
    </Flex>
  );
};

export default RequestView;
