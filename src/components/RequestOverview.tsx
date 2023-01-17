import {
  Avatar,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
  Tooltip,
  Button,
  useToast,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { FC, useState } from "react";
import { useAppSelector } from "../reducers/types";
import {
  approveRequest,
  declineRequest,
  reviewRequest,
} from "../services/permissionServices";
import { Request } from "../types/Permission";
import { UserRole } from "../types/Profile";
type RequestOverviewProps = {
  request: Request;
  onClose: () => void;
};
export const RequestOverview: FC<RequestOverviewProps> = ({
  request,
  onClose,
}) => {
  const { users, auth } = useAppSelector(({ users, auth }) => ({
    users,
    auth,
  }));
  const { usersMap = {} } = users || {};
  const [declining, setDeclining] = useState(false);
  const [approving, setApproving] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const toast = useToast();

  const review = async () => {
    if (request.attentionToId !== auth?.uid) {
      toast({
        title: "You dont have permission to approve this request",
        status: "error",
      });
      return;
    }
    try {
      setReviewing(true);
      await reviewRequest(request.id || "");
      // toast({ title: "Request successfully Aproved", status: "success" });
      onClose();
    } catch (error) {
      toast({ title: "Something went wrong", status: "error" });
    } finally {
      setReviewing(false);
    }
  };
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
      onClose();
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
      // toast({ title: "Request successfully Approved", status: "success" });
      onClose();
    } catch (error) {
      // console.log(error);
      toast({ title: "Something went wrong", status: "error" });
    } finally {
      setApproving(false);
    }
  };
  return (
    <Flex direction="column" px={5} py={5}>
      <Heading fontSize="lg" my={3}>
        {request.type}
      </Heading>
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
          <Text>{usersMap[request.userId]?.designation || "Unknown User"}</Text>
        </VStack>
      </HStack>
      {request.type === "leave" && request.memo ? (
        <VStack alignItems="flex-start" mt={4}>
          <Heading fontSize="md" mb={3}>
            Leave Memo
          </Heading>
          <Text fontSize="md">{request.memo}</Text>
        </VStack>
      ) : null}
      <HStack spacing={4}>
        <VStack spacing={0} alignItems="flex-start" mt={4}>
          <Heading fontSize="md">Duration</Heading>
          <Text fontSize="md">{`${format(
            new Date(request.startDate),
            "dd MMM yy",
          )} - ${format(new Date(request.endDate), "dd MMM yy")}`}</Text>
        </VStack>
        <VStack spacing={0}>
          <Heading fontSize="md">Status</Heading>
          <Text fontSize="md">{request.status}</Text>
        </VStack>
        <VStack spacing={0}>
          <Heading fontSize="md">Request Type</Heading>
          <Text fontSize="md">{request.type}</Text>
        </VStack>
      </HStack>
      <SimpleGrid columns={[1, 2]}>
        {request.type === "leave" && request.handoverId ? (
          <VStack alignItems="flex-start" mt={4}>
            <Heading fontSize="md">Handing Over to</Heading>
            <HStack>
              <Tooltip
                label={
                  usersMap[request.handoverId || ""]?.photoUrl || "Unknown user"
                }
              >
                <Avatar
                  size="sm"
                  src={usersMap[request.handoverId || ""]?.photoUrl || ""}
                  name={usersMap[request.handoverId || ""]?.displayName || ""}
                />
              </Tooltip>
            </HStack>
          </VStack>
        ) : null}
        {request.type === "leave" && request.attentionToId ? (
          <VStack alignItems="flex-start" mt={4}>
            <Heading fontSize="md">Head of Department</Heading>
            <HStack>
              <Tooltip
                label={
                  usersMap[request.attentionToId || ""]?.photoUrl ||
                  "Unknown user"
                }
              >
                <Avatar
                  size="sm"
                  src={usersMap[request.attentionToId || ""]?.photoUrl || ""}
                  name={
                    usersMap[request.attentionToId || ""]?.displayName || ""
                  }
                />
              </Tooltip>
            </HStack>
          </VStack>
        ) : null}
      </SimpleGrid>

      <HStack alignItems="center" spacing={3} mt={5}>
        {request.status === "pending" ? (
          <>
            <Button
              onClick={decline}
              isLoading={declining}
              variant="outline"
              colorScheme="brand"
              disabled={
                request.attentionToId !== auth?.uid ||
                request.userId === auth?.uid
              }
            >
              Decline
            </Button>
            <Button
              onClick={review}
              isLoading={reviewing}
              variant="solid"
              colorScheme="brand"
              disabled={
                request.attentionToId !== auth?.uid ||
                request.userId === auth?.uid
              }
            >
              Approve as Head of Dept
            </Button>
          </>
        ) : null}
        {request.status === "reviewed" ? (
          <>
            <Button
              variant="outline"
              onClick={decline}
              isLoading={declining}
              colorScheme="brand"
              disabled={
                auth?.role !== UserRole.admin || request.userId === auth?.uid
              }
            >
              Decline
            </Button>
            <Button
              variant="solid"
              onClick={approve}
              isLoading={approving}
              colorScheme="brand"
              disabled={
                auth?.role !== UserRole.admin || request.userId === auth?.uid
              }
            >
              Approve
            </Button>
          </>
        ) : null}
        {request.status === "approved" ? (
          <Heading my={5} color="green.400">
            APPROVED
          </Heading>
        ) : null}
      </HStack>
    </Flex>
  );
};
