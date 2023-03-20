import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { format, intervalToDuration } from "date-fns";
import { Timestamp } from "firebase/firestore";
import React, { FC, useEffect, useMemo, useState } from "react";
import { BASE_URL } from "../constants";
import { useAppSelector } from "../reducers/types";
import { sendNotification } from "../services/notificationServices";
import { sendEmailNotification } from "../services/userServices";
import {
  getVehicleRequestClashes,
  getVehicleRequestForDate,
  updateVehicleRequestStatus,
} from "../services/vehicleServices";
import { EmailPayLoad, Notification } from "../types/Notification";
import { VehicleRequest } from "../types/VehicleRequest";
type VehicleRequestsViewProps = {
  request: VehicleRequest;
  onClose: () => void;
};
export const VehicleRequestsView: FC<VehicleRequestsViewProps> = ({
  request,
  onClose,
}) => {
  const { users, auth } = useAppSelector(({ users, auth }) => ({
    users,
    auth,
  }));
  const { usersMap = {} } = users || {};
  const toast = useToast();
  const [approving, setApproving] = useState<boolean>();
  const [declining, setDeclining] = useState<boolean>(false);
  const [reviewing, setReviewing] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>();
  const [clash, setClash] = useState<VehicleRequest>();
  const duraction = useMemo(() => {
    return intervalToDuration({
      start: request.startTime,
      end: request.endTime,
    });
  }, [request.startTime, request.endTime]);

  const onApprove = async (status: VehicleRequest["status"]) => {
    try {
      if (status === "approved") setApproving(true);
      if (status === "declined") setDeclining(true);
      await updateVehicleRequestStatus(status, request.id, auth?.uid || "");
      const notification: Notification = {
        title: `Vehicle Request ${status} ${
          status === "approved" ? "✅" : "⛔️"
        }`,
        description: `Your vehicle request has been ${status}`,
        read: false,
        reciepientId: request.userId,
        timestamp: Timestamp.now(),
        type: "request",
        linkTo: "/requests/vehicle",
      };
      sendNotification(notification);
      if (status === "approved") {
        const email: EmailPayLoad = {
          to: usersMap[request.userId]?.email || "",
          data: {
            action: `${BASE_URL}/requests/vehicle`,
            date: format(new Date(), "do MMM Y"),
            message: `This is to certify that the vehicle request for ${
              usersMap[request.userId]?.displayName || "Unknown"
            }'s trip on the ${format(request.datetimestamp, "do MMM Y")} from ${
              request.origin
            } to ${request.destination} has been approved ✅`,
            title: "Vehicle Request Approval",
          },
        };
        sendEmailNotification(email);
      }
      toast({
        title: `Request has been ${status}`,
        status: "success",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Could not approve request",
        status: "error",
      });
    } finally {
      if (status === "approved") setApproving(false);
      if (status === "declined") setDeclining(false);
    }
  };
  const onReview = async () => {
    try {
      setReviewing(false);
      await updateVehicleRequestStatus("reviewed", request.id, auth?.uid || "");
      const notification: Notification = {
        title: `Vehicle Request Reviewed 👀`,
        description: `Your vehicle request has been reviewed by ${
          auth?.displayName || "Unknown"
        }`,
        read: false,
        reciepientId: request.userId,
        timestamp: Timestamp.now(),
        type: "request",
        linkTo: "/requests/vehicle",
      };
      const approverNotification: Notification = {
        title: `Vehicle Request Attention`,
        description: `${
          usersMap[request.userId]?.displayName || "Unknown"
        }'s vehicle request has been reviewed by ${
          auth?.displayName || "Unknown"
        }. It is now awaiting your approval`,
        read: false,
        reciepientId: request.approverId,
        timestamp: Timestamp.now(),
        type: "request",
        linkTo: "/requests-admin/vehicle",
      };
      sendNotification(notification);
      sendNotification(approverNotification);

      toast({
        title: `Request has been reviewed`,
        status: "success",
      });
      onClose();
    } catch (error) {
      console.log(error);
      toast({
        title: "Oops something went wrong",
        status: "error",
      });
    } finally {
      setReviewing(false);
    }
  };

  useEffect(() => {
    const checkForClashes = async () => {
      try {
        setChecking(true);
        const requests = await getVehicleRequestForDate(request.date);
        const clashes = getVehicleRequestClashes(requests, request);
        if (clashes) setClash(clashes);
      } catch (error) {
        console.log(error);
      } finally {
        setChecking(false);
      }
    };
    checkForClashes();
  }, [request]);
  return (
    <Flex direction="column" py={3}>
      <Flex justifyContent="space-between" alignItems="center">
        <HStack alignItems="center" mb={4}>
          <Avatar
            size="sm"
            src={usersMap[request.userId]?.photoUrl || ""}
            name={usersMap[request.userId]?.displayName || "Unknown users"}
          />
          <VStack alignItems="flex-start" spacing={0}>
            <Heading fontSize="lg">
              {usersMap[request.userId]?.displayName || "Unknown User"}
            </Heading>
            <Text>{usersMap[request.userId]?.designation || ""}</Text>
          </VStack>
        </HStack>

        {["approved", "declined"].includes(request.status) ? (
          <Box
            p={5}
            borderColor={
              request.status === "approved" ? "green.200" : "red.300"
            }
            color={request.status === "approved" ? "green" : "red"}
            borderWidth={4}
            fontSize="2xl"
            transform="rotate(-30deg)"
          >
            {request.status}
          </Box>
        ) : null}
      </Flex>

      <FormControl mb={4}>
        <FormLabel fontSize="sm" fontWeight="bold">
          Date of trip
        </FormLabel>
        <Text>{format(request.datetimestamp, "do MM Y")}</Text>
      </FormControl>
      <SimpleGrid columns={2}>
        <FormControl mb={4}>
          <FormLabel fontSize="sm" fontWeight="bold">
            From
          </FormLabel>
          <Text>{request.origin}</Text>
        </FormControl>
        <FormControl mb={4}>
          <FormLabel fontSize="sm" fontWeight="bold">
            Destination
          </FormLabel>
          <Text>{request.destination}</Text>
        </FormControl>
      </SimpleGrid>

      <FormControl mb={4}>
        <FormLabel fontSize="sm" fontWeight="bold">
          Purpose
        </FormLabel>
        <Text>{request.purpose}</Text>
      </FormControl>

      <SimpleGrid columns={2}>
        <FormControl mb={4}>
          <FormLabel fontSize="sm" fontWeight="bold">
            Start Time
          </FormLabel>
          <Text>{format(request.startTime, "KK:mm aaa")}</Text>
        </FormControl>
        <FormControl mb={4}>
          <FormLabel fontSize="sm" fontWeight="bold">
            End Time
          </FormLabel>
          <Text>{format(request.endTime, "KK:mm aaa")}</Text>
        </FormControl>
      </SimpleGrid>
      <FormControl mb={4}>
        <FormLabel fontSize="sm" fontWeight="bold">
          Duration
        </FormLabel>
        <Text>{`${duraction.hours}H ${
          duraction.minutes ? `${duraction.minutes} m` : ""
        } `}</Text>
      </FormControl>
      <Flex direction="column">
        {checking ? <Text color="red.400">Checking for Clashes</Text> : null}

        {clash && request.status === "pending" ? (
          <Flex
            direction="column"
            p={3}
            borderWidth={1}
            borderColor="brand.300"
            mb={4}
            borderRadius="sm"
          >
            <Text fontSize="sm" color="red.400">
              This request is clashing with...
            </Text>
            <HStack>
              <Avatar
                src={usersMap[clash.userId]?.photoUrl}
                size="sm"
                name={usersMap[clash.userId]?.displayName || ""}
              />
              <VStack alignItems="flex-start" spacing={1}>
                <Text fontWeight="bold">
                  {usersMap[clash.userId]?.displayName || "Unknown user"}
                </Text>
                <Text>{`${format(clash.startTime, "KK:mm aaa")} - ${format(
                  clash.endTime,
                  "KK:mm aaa",
                )}`}</Text>
              </VStack>
            </HStack>
            <Text my={3}>{clash.purpose}</Text>
          </Flex>
        ) : null}
      </Flex>
      {["approved", "declined"].includes(request.status) ? null : (
        <Flex>
          {request.status === "pending" ? (
            <Button
              variant="outline"
              colorScheme="brand"
              isLoading={reviewing}
              onClick={onReview}
              isFullWidth
            >
              Review
            </Button>
          ) : (
            <Button
              variant="solid"
              colorScheme="brand"
              isLoading={approving}
              onClick={() => onApprove("approved")}
              isFullWidth
              disabled={clash?.status === "approved"}
            >
              Approve
            </Button>
          )}

          <Button
            variant="outline"
            colorScheme="brand"
            isLoading={declining}
            isFullWidth
            onClick={() => onApprove("declined")}
            ml={2}
          >
            Decline
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
