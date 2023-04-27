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
  Icon,
  FormControl,
  FormLabel,
  Textarea,
} from "@chakra-ui/react";
import { profile } from "console";
import { format, intervalToDuration } from "date-fns";
import { Timestamp } from "firebase/firestore";
import React, { FC, useMemo, useState } from "react";
import { BiCheckDouble } from "react-icons/bi";
import { BsCheckCircle, BsStopCircle } from "react-icons/bs";
import { BASE_URL } from "../constants";
import { leaveMapper } from "../helpers";
import { useLeaveData } from "../hooks/useLeaveData";
import { useAppSelector } from "../reducers/types";
import { sendNotification } from "../services/notificationServices";
import {
  approveRequest,
  declineRequest,
  reviewRequest,
} from "../services/permissionServices";
import {
  sendEmailNotification,
  sendNotificationToGroup,
} from "../services/userServices";
import { Chat } from "../types/Chat";
import { EmailPayLoad, Notification } from "../types/Notification";
import { Request } from "../types/Permission";
import { UserRole } from "../types/Profile";
import { LeaveTypeMap } from "../types/System";
type RequestOverviewProps = {
  request: Request;
  onClose: () => void;
};
export const RequestOverview: FC<RequestOverviewProps> = ({
  request,
  onClose,
}) => {
  const { users, auth, system } = useAppSelector(({ users, auth, system }) => ({
    users,
    auth,
    system,
  }));
  const { usersMap = {} } = users || {};
  const [declining, setDeclining] = useState(false);
  const [approving, setApproving] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [comment, setComment] = useState<string>("");
  const { leaveCategory } = useLeaveData(auth?.uid || "");
  const leaveDaysAllowed = useMemo(() => {
    if (!system) return {} as LeaveTypeMap;
    return leaveMapper(system);
  }, [system]);
  const toast = useToast();
  const daysRemaining = useMemo(() => {
    return request.leaveType && system
      ? `${
          leaveDaysAllowed[request.leaveType] -
          (leaveCategory[request.leaveType]?.length || 0)
        } day(s) of ${request.leaveType} remaining`
      : null;
  }, [leaveDaysAllowed, request.leaveType, leaveCategory, system]);
  const duration = useMemo(() => {
    const interval = intervalToDuration({
      start: new Date(request.startDate),
      end: new Date(request.endDate),
    });
    return interval.days;
  }, [request.startDate, request.endDate]);
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
      const notificaiton: Notification = {
        title: "Leave Request Approval",
        description: `Head of department ${
          usersMap[request.attentionToId || ""]?.displayName
        } has approved the leave request for ${
          usersMap[request.userId]?.displayName || "Unknown"
        } and this request is  now awaiting your final approval`,
        reciepientId: "",
        read: false,
        timestamp: Timestamp.now(),
        type: "request",
        linkTo: `/requests-admin/${request.id}`,
      };
      const userNotification: Notification = {
        title: "Leave Request Reviewed 👀",
        description: `Your leave request has been reviewed by ${
          auth?.displayName || "Unknown"
        } as head of department, it is now awaiting approval from admin`,
        read: false,
        reciepientId: request.userId,
        timestamp: Timestamp.now(),
        type: "request",
        linkTo: "/requests",
      };
      sendNotification(userNotification);
      sendNotificationToGroup({ group: UserRole.admin, data: notificaiton });
      // toast({ title: "Request successfully Aproved", status: "success" });
      onClose();
    } catch (error) {
      toast({ title: "Something went wrong", status: "error" });
    } finally {
      setReviewing(false);
    }
  };
  const decline = async () => {
    // if (request.status !== "reviewed" && request.attentionToId !== auth?.uid) {
    //   toast({
    //     title: "This request has to be reviewed first",
    //     status: "error",
    //   });
    //   return;
    // }
    try {
      setDeclining(true);
      const comments: Chat[] = comment
        ? [
            ...(request.comments || []),
            {
              text: comment,
              senderId: auth?.uid || "",
              sender: {
                photoUrl: auth?.photoUrl || "",
                displayName: auth?.displayName || "",
              },
              conversationId: "",
              timestamp: new Date().getTime(),
            },
          ]
        : [];
      await declineRequest(request.id || "", comments);
      const notification: Notification = {
        title: `${
          request.type === "log" ? "Log" : "Leave"
        } Request Declined ⛔️`,
        description: "Oops your leave request was declined",
        read: false,
        reciepientId: request.userId,
        timestamp: Timestamp.now(),
        type: "request",
        linkTo: "/requests",
      };
      const email: EmailPayLoad = {
        data: {
          action: `${BASE_URL}/requests`,
          message: `Oops your leave request was declined go on the codepm platform to view more details`,
          date: `${format(new Date(), `do MMM Y`)}`,
          title: `Leave Request Declined ⛔️`,
        },
        to: usersMap[request.userId]?.email || "",
      };
      sendNotification(notification);
      sendEmailNotification(email);
      onClose();
    } catch (error) {
      toast({ title: "Something went wrong", status: "error" });
    } finally {
      setDeclining(false);
    }
  };
  const approve = async () => {
    if (
      auth?.role !== UserRole.master &&
      request.type === "leave" &&
      request.status !== "reviewed"
    ) {
      toast({
        title: "This request has to be reviewed first",
        status: "error",
      });
      return;
    }
    try {
      setApproving(true);
      await approveRequest(request);
      const notification: Notification = {
        title: `${
          request.type === "log" ? "Log" : "Leave"
        } Request Approved ✅`,
        description: `Your ${request.type} request has been approved`,
        read: false,
        reciepientId: request.userId,
        timestamp: Timestamp.now(),
        type: "request",
        linkTo: "/requests",
      };
      const email: EmailPayLoad = {
        data: {
          action: `${BASE_URL}/requests`,
          message: `Your ${request.type} request has been approved`,
          date: `${format(new Date(), `do MMM Y`)}`,
          title: `${
            request.type === "log" ? "Log" : "Leave"
          } request approval ✅`,
        },
        to: usersMap[request.userId]?.email || "",
      };

      if (request.type === "leave" && request.handoverId) {
        sendNotification({
          read: false,
          reciepientId: request.handoverId,
          description: `You have been mentioned in a leave request by ${
            usersMap[request.userId]?.displayName || "Unknown"
          }.Their duties and responsibilities will be handed over to you`,
          title: "Leave Request",
          timestamp: Timestamp.now(),
          linkTo: `/requests-admin/${request.id}`,
          type: "request",
        });
        const handoverEmail: EmailPayLoad = {
          data: {
            action: `${BASE_URL}/requests`,
            message: `This mail officially states that ${
              usersMap[request.userId]?.displayName || "Unknown"
            } is going on ${request.leaveType || "leave"} from ${format(
              new Date(request.startDate),
              "do MMM Y ",
            )} to ${format(
              new Date(request.endDate),
              "do MMM Y",
            )} and will be handing over their duties and responsility to you`,
            date: `${format(new Date(), `do MMM Y`)}`,
            title: `Leave Handover 🤝`,
          },
          to: usersMap[request.handoverId || ""]?.email || "",
        };
        sendEmailNotification(handoverEmail);
      }

      sendNotification(notification);
      sendEmailNotification(email);
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
    <Flex direction="column" px={5} py={3}>
      {request.type === "leave" && daysRemaining ? (
        <Heading textAlign="center" my={3} fontSize="sm" color="red.300">
          {daysRemaining}
        </Heading>
      ) : null}
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
      {request.memo ? (
        <VStack alignItems="flex-start" mt={4}>
          <Heading fontSize="sm">Leave Memo</Heading>
          <Text fontSize="md">{request.memo}</Text>
        </VStack>
      ) : null}
      <HStack spacing={10} alignItems="flex-start" mt={4}>
        <VStack spacing={0} alignItems="flex-start">
          <Heading fontSize="sm">Duration</Heading>
          <Text fontSize="md">{`${format(
            new Date(request.startDate),
            "dd MMM yy",
          )} - ${format(new Date(request.endDate), "dd MMM yy")}`}</Text>
          {request.type === "leave" ? (
            <Text fontSize="sm" color="brand.300">{`${duration} days`}</Text>
          ) : null}
        </VStack>
        <VStack spacing={0} alignItems="flex-start">
          <Heading fontSize="sm">Status</Heading>
          <Text fontSize="md">{request.status}</Text>
        </VStack>
        {request.type === "leave" ? (
          <VStack spacing={0} alignItems="flex-start">
            <Heading fontSize="sm">Request Type</Heading>
            <Text fontSize="md">{request.leaveType}</Text>
          </VStack>
        ) : null}
      </HStack>
      <SimpleGrid columns={[1, 2]} mt={4}>
        {request.type === "leave" && request.handoverId ? (
          <VStack alignItems="flex-start" mt={4}>
            <Heading fontSize="sm">Handing Over to</Heading>
            <HStack>
              <Tooltip
                label={
                  usersMap[request.handoverId || ""]?.displayName ||
                  "Unknown user"
                }
              >
                <Avatar
                  size="sm"
                  src={usersMap[request.handoverId || ""]?.photoUrl || ""}
                  name={usersMap[request.handoverId || ""]?.displayName || ""}
                />
              </Tooltip>
              <Text>
                {usersMap[request.handoverId || ""]?.displayName || ""}
              </Text>
            </HStack>
          </VStack>
        ) : null}
        {request.type === "leave" && request.attentionToId ? (
          <VStack alignItems="flex-start" mt={4}>
            <Heading fontSize="sm">Head of Department</Heading>
            <HStack>
              <Tooltip
                label={
                  usersMap[request.attentionToId || ""]?.displayName ||
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
              <Text>
                {usersMap[request.attentionToId || ""]?.displayName || ""}
              </Text>
            </HStack>
          </VStack>
        ) : null}
      </SimpleGrid>
      <Flex direction="column" mt={6}>
        <Heading size="sm" mb={3}>
          Comments
        </Heading>
        <Flex direction="column">
          {request.comments?.length ? (
            request.comments.map((comment, i) => (
              <HStack spacing={1} mb={1} key={`request-comment-${i}`}>
                <Avatar src={usersMap[comment.senderId]?.photoUrl} size="sm" />
                <VStack alignItems="flex-start" spacing={0}>
                  <Heading fontSize="md">
                    {usersMap[comment.senderId]?.displayName}
                  </Heading>
                  <Text fontSize="sm">{comment.text}</Text>
                </VStack>
              </HStack>
            ))
          ) : (
            <Heading fontSize="md" color="tetiary.300">
              No comments on this requests
            </Heading>
          )}
        </Flex>
      </Flex>
      <FormControl mb={3}>
        <FormLabel>Comment</FormLabel>
        <Textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </FormControl>

      <HStack alignItems="center" spacing={3} mt={5}>
        {request.status === "pending" ? (
          <>
            <Button
              onClick={decline}
              isLoading={declining}
              variant="outline"
              colorScheme="brand"
              disabled={
                (auth?.role &&
                  ![UserRole.admin, UserRole.master].includes(auth?.role)) ||
                request.userId === auth?.uid
              }
            >
              Decline
            </Button>
            {request.type === "leave" ? (
              <>
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
                {auth?.role === UserRole.master ? (
                  <Button
                    onClick={approve}
                    isLoading={approving}
                    variant="solid"
                    bg="green"
                    color="white"
                    leftIcon={<BiCheckDouble />}
                  >
                    Approve
                  </Button>
                ) : null}
              </>
            ) : (
              <Button
                variant="solid"
                onClick={approve}
                isLoading={approving}
                colorScheme="brand"
                disabled={
                  (auth?.role &&
                    !!![UserRole.admin, UserRole.master].includes(auth.role)) ||
                  request.userId === auth?.uid
                }
              >
                Approve Log
              </Button>
            )}
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
                (auth?.role &&
                  !!![UserRole.admin, UserRole.master].includes(auth.role)) ||
                request.userId === auth?.uid
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
                (auth?.role &&
                  !!![UserRole.admin, UserRole.master].includes(auth.role)) ||
                request.userId === auth?.uid
              }
            >
              Approve
            </Button>
          </>
        ) : null}
        {request.status === "approved" ? (
          <HStack>
            <Heading fontSize="md" color="green.400">
              Approved
            </Heading>
            <Icon as={BsCheckCircle} color="green.400" />
          </HStack>
        ) : null}
        {request.status === "declined" ? (
          <HStack>
            <Heading fontSize="md" color="red.400">
              Declined
            </Heading>
            <Icon as={BsStopCircle} color="red.400" />
          </HStack>
        ) : null}
      </HStack>
    </Flex>
  );
};
