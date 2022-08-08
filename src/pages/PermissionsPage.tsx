import {
  Avatar,
  Button,
  Flex,
  Heading,
  HStack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { FirebaseError } from "firebase/app";
import React, { FC, useEffect, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { LoadingComponent } from "../components/LoadingComponent";
import { useAppSelector } from "../reducers/types";
import {
  approveRequest,
  declineRequest,
  listenOnPermissionRequests,
} from "../services/permissionServices";
import { Request } from "../types/Permission";

type RequestProps = {
  request: Request;
};

const RequestRow: FC<RequestProps> = ({ request }) => {
  const { users } = useAppSelector(({ users }) => ({
    users,
  }));
  const { usersMap = {} } = users || {};
  const [delclining, setDeclining] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);
  const toast = useToast();

  const decline = async () => {
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
    try {
      setApproving(true);
      await approveRequest(request);
      toast({ title: "Request successfully Approved", status: "success" });
    } catch (error) {
      console.log(error);
      toast({ title: "Something went wrong", status: "error" });
    } finally {
      setApproving(false);
    }
  };
  return (
    <Flex
      direction="row"
      borderRadius="lg"
      bg="white"
      py={3}
      px={5}
      alignItems="center"
      justifyContent="space-around"
      my={1}
    >
      <HStack alignItems="center">
        <Avatar
          size="sm"
          src={usersMap[request.userId]?.photoUrl || ""}
          name={usersMap[request.userId].displayName}
        />
        <VStack spacing={0} alignItems="flex-start">
          <Heading fontSize="lg">
            {usersMap[request.userId]?.displayName || "Unknown Name"}
          </Heading>
          <Text>{usersMap[request.userId].designation || "Unknown User"}</Text>
        </VStack>
      </HStack>
      {request.type === "leave" ? (
        <VStack spacing={0} alignItems="flex-start">
          <Text>Leave type</Text>
          <Heading fontSize="lg">{request.leaveType}</Heading>
        </VStack>
      ) : (
        <Text>Access to Log</Text>
      )}
      <VStack spacing={0} alignItems="flex-start">
        <Text>Duration</Text>
        <Heading fontSize="md">{`${format(
          new Date(request.startDate),
          "dd MMM Y",
        )} - ${format(new Date(request.endDate), "dd MMM Y")}`}</Heading>
      </VStack>
      <Text>{request.status}</Text>
      {request.status === "pending" ? (
        <HStack spacing={4}>
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
        </HStack>
      ) : null}
    </Flex>
  );
};

export const PermissionsPage: FC = () => {
  const [requests, setRequests] = useState<Request[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();
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
  return (
    <Flex direction="column" width="100%" px={5}>
      <Heading my={3} fontSize="lg">
        Request List
      </Heading>
      {loading ? (
        <LoadingComponent title="fetching requests" />
      ) : requests?.length ? (
        requests.map((request, i) => (
          <RequestRow key={`permission-request-${i}`} request={request} />
        ))
      ) : (
        <EmptyState />
      )}
    </Flex>
  );
};
