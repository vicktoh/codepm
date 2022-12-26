import {
  Avatar,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
  Tooltip,
  IconButton,
  Icon,
  useBreakpointValue,
  Box,
  Badge,
  Tr,
  Td,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { FC } from "react";
import { BsCalculator, BsChat, BsEye } from "react-icons/bs";
import { useAppSelector } from "../reducers/types";
import { Requisition, RequisitionStatus } from "../types/Requisition";
type RequisitionAdminComponentProps = {
  requisition: Requisition;
  onViewRequisition: () => void;
  onOpenChat: () => void;
  onOpenRetirement: () => void;
};
export const RequisitionAdminComponent: FC<RequisitionAdminComponentProps> = ({
  requisition,
  onViewRequisition,
  onOpenChat,
  onOpenRetirement,
}) => {
  const { users, auth } = useAppSelector(({ users, auth }) => ({
    users,
    auth,
  }));
  const { usersMap = {} } = users || {};
  const userDetails = usersMap[requisition.creatorId];
  const timeString = format(requisition.timestamp, "do MMM Y");
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
  const unReadChat =
    requisition.chatCount && requisition.conversation
      ? requisition.chatCount - (requisition.conversation[auth?.uid || ""] || 0)
      : 0;
  const getStatus = (status: Requisition["status"]) => {
    switch (status) {
      case "pending":
        return (
          <VStack spacing={0} alignItems="flex-start">
            <Heading fontSize="sm">status</Heading>
            <Text>Pending</Text>;
          </VStack>
        );
      case "approved":
        return (
          <VStack spacing={0} alignItems="flex-start">
            <Text fontSize="sm">Approved by</Text>
            <Heading fontSize="md">
              {requisition.approvedBy?.displayName}
            </Heading>
          </VStack>
        );
      case "budgetholder":
        return (
          <VStack spacing={0} alignItems="flex-start">
            <Text fontSize="sm">Bugetholder Check</Text>
            <Heading fontSize="md">
              {requisition.budgetHolderCheck?.displayName}
            </Heading>
          </VStack>
        );
      case "checked":
        return (
          <VStack spacing={0} alignItems="flex-start">
            <Text fontSize="sm">Checked by</Text>
            <Heading fontSize="md">
              {requisition.checkedby?.displayName}
            </Heading>
          </VStack>
        );
      case "paid":
        return <Text>Paid</Text>;
      case "retired":
        return <Text>Retired</Text>;
      case "abandoned":
        return <Text color="red.200">Abandoned</Text>;
      default:
        return null;
    }
  };

  return isMobile ? (
    <Flex direction="column" padding={3} my={3} borderRadius="md" bg="white">
      <HStack spacing={3} alignItems="center">
        <Avatar
          src={userDetails?.photoUrl}
          name={userDetails?.displayName}
          size="sm"
        />
        <VStack alignItems="flex-start" spacing={0}>
          <Heading fontSize="sm">{userDetails?.displayName}</Heading>
          <Text fontSize="xs" color="red.300">
            {timeString}
          </Text>
        </VStack>
      </HStack>
      <Text mt={3}>{requisition.title}</Text>
      <Flex direction="row" justifyContent="space-between" mt={3}>
        <Heading fontSize="lg">
          {`${requisition.currency} ${requisition.total.toLocaleString()}`}
        </Heading>
        {getStatus(requisition.status)}
      </Flex>
      <HStack mt={3}>
        <Tooltip title="View Requisition">
          <IconButton
            onClick={onViewRequisition}
            color="blue.300"
            icon={<Icon as={BsEye} />}
            aria-label="view Requisition"
          />
        </Tooltip>
        <Tooltip title="Conversations">
          <Box position="relative">
            <IconButton
              onClick={onOpenChat}
              color="blue.300"
              icon={<Icon as={BsChat} />}
              aria-label="Requisition Converstation"
            />
            {unReadChat ? (
              <Box position="absolute" top={0} right="-3px">
                <Badge
                  bg="brand.500"
                  color="white"
                  borderRadius="full"
                  fontSize="xs"
                >
                  {unReadChat}
                </Badge>
              </Box>
            ) : null}
          </Box>
        </Tooltip>
        {requisition.status === RequisitionStatus.retired ? (
          <Tooltip title="View Retirement">
            <IconButton
              onClick={onOpenRetirement}
              color="yellow.300"
              icon={<Icon as={BsCalculator} />}
              aria-label="View Retirement"
            />
          </Tooltip>
        ) : null}
      </HStack>
    </Flex>
  ) : (
    <Tr bg="white">
      <Td>
        <HStack spacing={3} alignItems="center">
          <Avatar
            src={userDetails?.photoUrl}
            name={userDetails?.displayName}
            size={isMobile ? "md" : "sm"}
          />
          <VStack alignItems="flex-start" spacing={0}>
            <Heading fontSize={isMobile ? "md" : "md"}>
              {userDetails?.displayName}
            </Heading>
            {isMobile ? null : (
              <Text fontSize="sm" color="red.300">
                {timeString}
              </Text>
            )}
          </VStack>
        </HStack>
      </Td>
      <Td>
        <Text isTruncated noOfLines={1} fontSize="lg">
          {requisition.title}
        </Text>
      </Td>
      <Td>{getStatus(requisition.status)}</Td>
      <Td>
        <Heading fontSize="lg">
          {`${requisition.currency} ${requisition.total.toLocaleString()}`}
        </Heading>
      </Td>
      <Td>
        <HStack>
          <Tooltip title="View Requisition">
            <IconButton
              onClick={onViewRequisition}
              color="blue.300"
              icon={<Icon as={BsEye} />}
              aria-label="view Requisition"
            />
          </Tooltip>
          <Tooltip title="Conversations">
            <Box position="relative">
              <IconButton
                onClick={onOpenChat}
                color="blue.300"
                icon={<Icon as={BsChat} />}
                aria-label="Requisition Converstation"
              />
              {unReadChat ? (
                <Box position="absolute" top={0} right="-3px">
                  <Badge
                    bg="brand.500"
                    color="white"
                    borderRadius="full"
                    fontSize="xs"
                  >
                    {unReadChat}
                  </Badge>
                </Box>
              ) : null}
            </Box>
          </Tooltip>
          {requisition.status === RequisitionStatus.retired ? (
            <Tooltip title="View Retirement">
              <IconButton
                onClick={onOpenRetirement}
                color="yellow.300"
                icon={<Icon as={BsCalculator} />}
                aria-label="View Retirement"
              />
            </Tooltip>
          ) : null}
        </HStack>
      </Td>
    </Tr>
  );
};
