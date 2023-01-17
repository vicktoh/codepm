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
import { is } from "immer/dist/internal";
import React, { FC, useEffect, useMemo, useState } from "react";
import { BiCheckCircle } from "react-icons/bi";
import { BsCheck2Circle, BsEye, BsEyeglasses } from "react-icons/bs";
import { FaTimes } from "react-icons/fa";
import { MdCheckCircle, MdPending } from "react-icons/md";
import { EmptyState } from "../components/EmptyState";
import { LoadingComponent } from "../components/LoadingComponent";
import { RequestOverview } from "../components/RequestOverview";
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
};

const RequestRow: FC<RequestProps> = ({ request, onViewRequest }) => {
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
              <Text fontSize="xs">Leave type</Text>
              <Heading fontSize="sm">{request.leaveType}</Heading>
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
            <Heading fontSize="md">
              {usersMap[request.userId]?.displayName || "Unknown Name"}
            </Heading>
            <Text fontSize="sm">
              {usersMap[request.userId]?.designation || "Unknown User"}
            </Text>
          </VStack>
        </HStack>
      </Td>
      <Td>
        {request.type === "leave" ? (
          <VStack spacing={0} alignItems="flex-start">
            <Text>Leave type</Text>
            <Heading fontSize="lg">{request.leaveType}</Heading>
          </VStack>
        ) : (
          <Text>Access to Log</Text>
        )}
      </Td>
      <Td>
        <VStack spacing={0} alignItems="flex-start">
          <Text>Duration</Text>
          <Heading fontSize="md">{`${format(
            new Date(request.startDate),
            "dd MMM Y",
          )} - ${format(new Date(request.endDate), "dd MMM Y")}`}</Heading>
        </VStack>
      </Td>
      <Td>{request.status}</Td>
      <Td>
        <HStack alignItems="center" spacing={3}>
          <Button variant="outline" onClick={onViewRequest} colorScheme="blue">
            View
          </Button>
          {request.status === "pending" ? (
            <>
              <Button
                size="md"
                variant="outline"
                colorScheme="success"
                disabled={request.attentionToId !== auth?.uid}
              >
                Approve
              </Button>
              <Button
                size="md"
                variant="outline"
                colorScheme="brand"
                onClick={decline}
                isLoading={delclining}
                disabled={request.attentionToId !== auth?.uid}
              >
                Decline
              </Button>
            </>
          ) : null}
          {request.status === "reviewed" ? (
            <>
              <Button
                isLoading={delclining}
                size="md"
                colorScheme="brand"
                variant="outline"
                onClick={decline}
              >
                Decline
              </Button>
              <Button
                onClick={approve}
                isLoading={approving}
                size="md"
                colorScheme="brand"
              >
                Approve
              </Button>
            </>
          ) : null}
          {request.status === "approved" ? (
            <BiCheckCircle color="green" />
          ) : null}
        </HStack>
      </Td>
    </Tr>
  );
  // return (
  //   <Flex
  //     direction="row"
  //     borderRadius="lg"
  //     bg="white"
  //     py={3}
  //     px={5}
  //     alignItems="center"
  //     justifyContent="space-around"
  //     my={1}
  //   >
  //     <HStack alignItems="center">
  //       <Avatar
  //         size="sm"
  //         src={usersMap[request.userId]?.photoUrl || ""}
  //         name={usersMap[request.userId]?.displayName}
  //       />
  //       <VStack spacing={0} alignItems="flex-start">
  //         <Heading fontSize="lg">
  //           {usersMap[request.userId]?.displayName || "Unknown Name"}
  //         </Heading>
  //         <Text>{usersMap[request.userId]?.designation || "Unknown User"}</Text>
  //       </VStack>
  //     </HStack>
  //     {request.type === "leave" ? (
  //       <VStack spacing={0} alignItems="flex-start">
  //         <Text>Leave type</Text>
  //         <Heading fontSize="lg">{request.leaveType}</Heading>
  //       </VStack>
  //     ) : (
  //       <Text>Access to Log</Text>
  //     )}
  //     <VStack spacing={0} alignItems="flex-start">
  //       <Text>Duration</Text>
  //       <Heading fontSize="md">{`${format(
  //         new Date(request.startDate),
  //         "dd MMM Y",
  //       )} - ${format(new Date(request.endDate), "dd MMM Y")}`}</Heading>
  //     </VStack>
  //     <Text>{request.status}</Text>
  //     {request.status === "pending" && request.attentionToId === auth?.uid ? (
  //       <Button size="md" variant="outline" colorScheme="brand">
  //         Approve as Dept. Head
  //       </Button>
  //     ) : null}
  //     {request.status === "reviewed" ? (
  //       <HStack spacing={4}>
  //         <Button
  //           isLoading={delclining}
  //           size="md"
  //           colorScheme="brand"
  //           variant="outline"
  //           onClick={decline}
  //         >
  //           Decline
  //         </Button>
  //         <Button
  //           onClick={approve}
  //           isLoading={approving}
  //           size="md"
  //           colorScheme="brand"
  //         >
  //           Approve
  //         </Button>
  //       </HStack>
  //     ) : null}
  //     {request.status === "approved" ? <BiCheckCircle color="green" /> : null}
  //   </Flex>
  // );
};

export const PermissionsPage: FC = () => {
  const [requests, setRequests] = useState<Request[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRequest, setSelectedRequest] = useState<Request>();
  const {
    isOpen: isViewRequestOpen,
    onClose: onCloseViewRequest,
    onOpen: onOpenViewRequest,
  } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
  const toast = useToast();
  const onViewPrompt = (request: Request) => {
    setSelectedRequest(request);
    onOpenViewRequest();
  };
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
        <TableContainer>
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
                    Please wait...
                  </Td>
                </Tr>
              ) : requests?.length ? (
                requests.map((request, i) => (
                  <RequestRow
                    onViewRequest={() => onViewPrompt(request)}
                    key={`permission-request-${i}`}
                    request={request}
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
          size="md"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Profile</ModalHeader>
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
      </>
    );
  }
  return (
    <Flex direction="column" width="100%" px={5}>
      <Heading my={3} fontSize="lg">
        Request List
      </Heading>
      {loading ? (
        <LoadingComponent title="fetching requests" />
      ) : requests?.length ? (
        requests.map((request, i) => (
          <RequestRow
            onViewRequest={() => onViewPrompt(request)}
            key={`permission-request-${i}`}
            request={request}
          />
        ))
      ) : (
        <EmptyState />
      )}
      <Modal isOpen={isViewRequestOpen} onClose={onCloseViewRequest} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
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
    </Flex>
  );
};
