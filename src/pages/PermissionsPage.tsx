import {
  Avatar,
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
  ModalHeader,
  ModalOverlay,
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
  useBreakpointValue,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { FirebaseError } from "firebase/app";
import React, { FC, useEffect, useMemo, useState } from "react";
import { BiCheckCircle } from "react-icons/bi";
import {
  BsChat,
  BsCheck,
  BsCheck2Circle,
  BsEye,
  BsEyeglasses,
} from "react-icons/bs";
import { FaCross, FaTimes } from "react-icons/fa";
import { MdCancel, MdCheckCircle, MdPending } from "react-icons/md";
import { EmptyState } from "../components/EmptyState";
import { LoadingComponent } from "../components/LoadingComponent";
import { RequestChat } from "../components/RequestChat";
import { RequestOverview } from "../components/RequestOverview";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { useAppSelector } from "../reducers/types";
import {
  approveRequest,
  declineRequest,
  listenOnPermissionRequests,
  reviewRequest,
} from "../services/permissionServices";
import { Request } from "../types/Permission";

type RequestProps = {
  request: Request;
  onViewRequest: () => void;
  onViewConversation: () => void;
};

const ModalLabel: Record<Request["type"], string> = {
  leave: "Leave Request",
  log: "Log Access",
  car: "Vehicle Request",
};

const RequestRow: FC<RequestProps> = ({
  request,
  onViewRequest,
  onViewConversation,
}) => {
  const { users, auth } = useAppSelector(({ users, auth }) => ({
    users,
    auth,
  }));
  const { usersMap = {} } = users || {};
  const isMobile = useBreakpointValue({ lg: false, base: true, md: true });
  const [delclining, setDeclining] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);
  const toast = useToast();
  const statusRender = useMemo(() => {
    if (request.status === "pending") {
      return {
        icon: MdPending,
        color: "yello.400",
      };
    }
    if (request.status === "approved") {
      return {
        icon: MdCheckCircle,
        color: "success.500",
      };
    }
    return {
      icon: BsEyeglasses,
      color: "blue.300",
    };
  }, [request.status]);
  const decline = async () => {
    if (request.status !== "reviewed" && request.attentionToId !== auth?.uid) {
      toast({
        title: "This request has to be reviewed first",
        status: "error",
      });
      return;
    }
    try {
      setDeclining(true);
      await declineRequest(request.id || "");
      toast({ title: "Request successfully declined", status: "success" });
    } catch (error) {
      toast({ title: "Something went wrong", status: "error" });
    } finally {
      setDeclining(false);
    }
  };
  const approve = async () => {
    if (request.status !== "reviewed") {
      toast({
        title: "This request has to be reviewed first",
        status: "error",
      });
      return;
    }
    try {
      setApproving(true);
      await approveRequest(request);
      toast({ title: "Request successfully Approved", status: "success" });
    } catch (error) {
      // console.log(error);
      toast({ title: "Something went wrong", status: "error" });
    } finally {
      setApproving(false);
    }
  };

  if (isMobile) {
    return (
      <Flex
        direction="column"
        bg="white"
        borderRadius="lg"
        px={5}
        my={3}
        py={3}
      >
        <HStack alignItems="center">
          <Avatar
            size="sm"
            src={usersMap[request.userId]?.photoUrl || ""}
            name={usersMap[request.userId]?.displayName}
          />
          <VStack spacing={0} alignItems="flex-start">
            <Heading fontSize="lg">
              {usersMap[request.userId]?.displayName || "Unknown Name"}
            </Heading>
            <Text>
              {usersMap[request.userId]?.designation || "Unknown User"}
            </Text>
          </VStack>
        </HStack>
        <HStack spacing={4} mt={3} alignItems="center">
          {request.type === "leave" ? (
            <VStack spacing={0} alignItems="flex-start">
              <Text fontSize="xx-small">Leave type</Text>
              <Heading fontSize="xs">{request.leaveType}</Heading>
            </VStack>
          ) : (
            <Text fontSize="md">Access to Log</Text>
          )}
          <VStack spacing={0} alignItems="flex-start">
            <Text fontSize="xs">Duration</Text>
            <Heading fontSize="sm">{`${format(
              new Date(request.startDate),
              "dd MMM yy",
            )} - ${format(new Date(request.endDate), "dd MMM yy")}`}</Heading>
          </VStack>
          <VStack spacing={0} mt={3}>
            <Icon as={statusRender.icon} color={statusRender.color} />
            <Text fontSize="md">{request.status}</Text>
          </VStack>
        </HStack>

        <HStack mt={3} spacing={3}>
          <Tooltip label="Approve Request">
            <IconButton
              isLoading={approving}
              onClick={approve}
              size="sm"
              bg={"green.50"}
              icon={<Icon as={BsCheck2Circle} color="green.600" />}
              aria-label="approve request"
            />
          </Tooltip>
          <Tooltip label="Decline Request">
            <IconButton
              isLoading={delclining}
              onClick={decline}
              size="sm"
              bg={"red.50"}
              icon={<Icon as={FaTimes} color="red.600" />}
              aria-label="decline request"
            />
          </Tooltip>

          <Tooltip label="View Request">
            <IconButton
              onClick={onViewRequest}
              size="sm"
              icon={<Icon as={BsEye} />}
              aria-label="view request"
            />
          </Tooltip>
          <Tooltip label="Conversation">
            <IconButton
              onClick={onViewConversation}
              size="sm"
              icon={<Icon as={BsChat} />}
              aria-label="view chat"
            />
          </Tooltip>
        </HStack>
      </Flex>
    );
  }
  return (
    <Tr>
      <Td>
        <HStack alignItems="center">
          <Avatar
            size="sm"
            src={usersMap[request.userId]?.photoUrl || ""}
            name={usersMap[request.userId]?.displayName}
          />
          <VStack spacing={0} alignItems="flex-start">
            <Heading fontSize="sm">
              {usersMap[request.userId]?.displayName || "Unknown Name"}
            </Heading>
            <Text fontSize="xs">
              {usersMap[request.userId]?.designation || "Unknown User"}
            </Text>
          </VStack>
        </HStack>
      </Td>
      <Td>
        {request.type === "leave" ? (
          <VStack spacing={0} alignItems="flex-start">
            <Text fontSize="xs">Leave type</Text>
            <Heading fontSize="sm">{request.leaveType}</Heading>
          </VStack>
        ) : (
          <Text fontSize="sm">{request.type}</Text>
        )}
      </Td>
      <Td>
        <VStack spacing={0} alignItems="flex-start">
          <Text fontSize="xs">Duration</Text>
          <Heading fontSize="sm">{`${format(
            new Date(request.startDate),
            "dd MMM yy",
          )} - ${format(new Date(request.endDate), "dd MMM yy")}`}</Heading>
        </VStack>
      </Td>
      <Td>{request.status}</Td>
      <Td>
        <HStack alignItems="center" spacing={3}>
          <Tooltip label="View Conversations">
            <IconButton
              aria-label="view conversation"
              borderRadius="full"
              icon={<BsChat />}
              onClick={onViewConversation}
            />
          </Tooltip>
          <Tooltip label="View Request">
            <IconButton
              colorScheme="blackAlpha"
              aria-label="view conversation"
              borderRadius="full"
              icon={<BsEye />}
              onClick={onViewRequest}
            />
          </Tooltip>
          {request.status === "pending" && request.type === "leave" ? (
            <>
              <Tooltip label="Approve request">
                <IconButton
                  aria-label="approve"
                  borderRadius="full"
                  colorScheme="green"
                  icon={<BsCheck />}
                  onClick={approve}
                  isLoading={approving}
                  disabled={request.attentionToId !== auth?.uid}
                />
              </Tooltip>
              <Tooltip label="Decline Request">
                <IconButton
                  aria-label="decline"
                  borderRadius="full"
                  colorScheme="red"
                  icon={<MdCancel />}
                  onClick={decline}
                  isLoading={delclining}
                  disabled={request.attentionToId !== auth?.uid}
                />
              </Tooltip>
              {/* <Button
                size="sm"
                variant="outline"
                colorScheme="brand"
                onClick={decline}
                isLoading={delclining}
                disabled={request.attentionToId !== auth?.uid}
              >
                Decline
              </Button> */}
            </>
          ) : null}
        </HStack>
      </Td>
    </Tr>
  );
};
type FilterType = Request["type"] | "all";

export const PermissionsPage: FC = () => {
  const [requests, setRequests] = useState<Request[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRequest, setSelectedRequest] = useState<Request>();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  const dataToRender = useMemo(() => {
    if (selectedFilter === "all") return requests;
    return requests?.filter((value) => value.type === selectedFilter);
  }, [selectedFilter, requests]);
  const glassEffect = useGlassEffect(true);
  const {
    isOpen: isViewRequestOpen,
    onClose: onCloseViewRequest,
    onOpen: onOpenViewRequest,
  } = useDisclosure();
  const {
    isOpen: isRequestChatOpen,
    onClose: onCloseRequestChat,
    onOpen: onOpenRequestChat,
  } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
  const toast = useToast();
  const onViewPrompt = (request: Request) => {
    setSelectedRequest(request);
    onOpenViewRequest();
  };
  const onViewConversation = (request: Request) => {
    console.log("here", request);
    setSelectedRequest(request);
    onOpenRequestChat();
  };
  console.log({ selectedRequest, isRequestChatOpen });
  useEffect(() => {
    try {
      const unsub = listenOnPermissionRequests((rqts) => {
        setLoading(false);
        setRequests(rqts);
      });
      return unsub;
    } catch (error) {
      const { message: description } = error as FirebaseError;
      toast({ title: "Could not fetch Request", description, status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  if (!isMobile) {
    return (
      <>
        <VStack alignItems="flext-start" mb={3}>
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
        <TableContainer mb={5}>
          <Table>
            <Thead>
              <Tr>
                <Th>Requested By</Th>
                <Th>Type of Request</Th>
                <Th>Duration</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={5} textAlign="center">
                    <Flex
                      alignItems="center"
                      direction="column"
                      justifyContent="center"
                    >
                      <Spinner />
                      <Text>Please wait...</Text>
                    </Flex>
                  </Td>
                </Tr>
              ) : dataToRender?.length ? (
                dataToRender.map((request, i) => (
                  <RequestRow
                    onViewRequest={() => onViewPrompt(request)}
                    key={`permission-request-${i}`}
                    request={request}
                    onViewConversation={() => onViewConversation(request)}
                  />
                ))
              ) : (
                <Tr>
                  <Td colSpan={5} textAlign="center">
                    There are no requests Yet
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
        <Modal
          isOpen={isViewRequestOpen}
          onClose={onCloseViewRequest}
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader textAlign="center">
              {selectedRequest?.type ? ModalLabel[selectedRequest.type] : ""}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedRequest ? (
                <RequestOverview
                  request={selectedRequest}
                  onClose={onCloseViewRequest}
                />
              ) : null}
            </ModalBody>
          </ModalContent>
        </Modal>
        <Modal isOpen={isRequestChatOpen} onClose={onCloseRequestChat}>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader textAlign="center">
              💬 Request Conversations
            </ModalHeader>
            <ModalBody>
              {selectedRequest && <RequestChat request={selectedRequest} />}
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  }
  return (
    <Flex direction="column" width="100%" px={5} pb={5}>
      <Flex direction="row" justifyContent="space-between">
        <Heading my={3} fontSize="lg">
          Request List
        </Heading>
        <VStack alignItems="flext-start">
          <Heading fontSize="sm">Filter Requests</Heading>
          <HStack spacing={3}>
            {["all", "leave", "log"].map((type) => (
              <Button
                key={`filter-${type}`}
                value={type}
                variant="ghost"
                size="xs"
                onClick={() => setSelectedFilter(type as FilterType)}
                {...(type === selectedFilter ? glassEffect : {})}
              >
                {type}
              </Button>
            ))}
          </HStack>
        </VStack>
      </Flex>
      {loading ? (
        <LoadingComponent title="fetching requests" />
      ) : dataToRender?.length ? (
        dataToRender.map((request, i) => (
          <RequestRow
            onViewRequest={() => onViewPrompt(request)}
            key={`permission-request-${i}`}
            request={request}
            onViewConversation={() => onViewConversation(request)}
          />
        ))
      ) : (
        <EmptyState />
      )}
      <Modal isOpen={isViewRequestOpen} onClose={onCloseViewRequest} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedRequest?.type ? ModalLabel[selectedRequest?.type] : ""}{" "}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRequest ? (
              <RequestOverview
                request={selectedRequest}
                onClose={onCloseViewRequest}
              />
            ) : null}
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
