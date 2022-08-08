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
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { FC } from "react";
import { BsChat, BsEye } from "react-icons/bs";
import { useAppSelector } from "../reducers/types";
import { Requisition } from "../types/Requisition";
type RequisitionAdminComponentProps = {
  requisition: Requisition;
  onViewRequisition: () => void;
  onOpenChat: () => void;
};
export const RequisitionAdminComponent: FC<RequisitionAdminComponentProps> = ({
  requisition,
  onViewRequisition,
  onOpenChat,
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
              {requisition.checkedby?.displayName}
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

  return (
    <Flex
      bg="white"
      px={5}
      borderRadius="lg"
      py={[5, 2]}
      alignItems={isMobile ? "flex-start" : "center"}
      gridGap={3}
      direction={isMobile ? "column" : "row"}
      justifyContent="space-between"
      position="relative"
    >
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
      {isMobile ? (
        <Text
          position="absolute"
          top={3}
          right={4}
          fontSize="sm"
          color="red.300"
        >
          {timeString}
        </Text>
      ) : null}
      <Box>
        <Tooltip alignSelf="center" label={requisition.title}>
          <Text isTruncated noOfLines={1} fontSize="lg">
            {requisition.title}
          </Text>
        </Tooltip>
      </Box>
      {!isMobile ? (
        <>
          {getStatus(requisition.status)}
          <Heading fontSize="lg">{`${
            requisition.currency
          } ${requisition.total.toLocaleString()}`}</Heading>
        </>
      ) : (
        <Flex
          alignItems="center"
          mb={[5, 0]}
          width="100%"
          justifyContent="space-between"
        >
          {getStatus(requisition.status)}
          <Heading fontSize="xl">
            {`${requisition.currency} ${requisition.total.toLocaleString()}`}
          </Heading>
        </Flex>
      )}
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
      </HStack>
    </Flex>
  );
};
