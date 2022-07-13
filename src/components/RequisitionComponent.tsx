import {
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Text,
  Tooltip,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { FC } from "react";
import {
  BsCalculator,
  BsChat,
  BsDownload,
  BsPencil,
  BsPrinter,
  BsTrash,
} from "react-icons/bs";
import { Requisition } from "../types/Requisition";

type RequisitionComponentProps = {
  requisition: Requisition;
};

export const RequisitionComponent: FC<RequisitionComponentProps> = ({
  requisition,
}) => {
  const date = format(new Date(requisition.timestamp), "do MMM Y");
  const { status } = requisition;
  const actionButtonSize = useBreakpointValue({
    base: "sm",
    md: "md",
    lg: "md",
  });
  const getStatus = (status: Requisition["status"]) => {
    switch (status) {
      case "pending":
        return <Text>Pending</Text>;
      case "approved":
        return (
          <VStack>
            <Text>Approved by</Text>
            <Heading fontSize="lg">{requisition.checkedby}</Heading>
          </VStack>
        );
      case "budgetholder":
        return (
          <VStack>
            <Text>Bugetholder Check</Text>
            <Heading fontSize="lg">
              {requisition.budgetHolderCheck?.displayName}
            </Heading>
          </VStack>
        );
      case "checked":
        return (
          <VStack>
            <Text>Checked by</Text>
            <Heading fontSize="lg">
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
  const getActionButtons = () => {
    if (
      status === "pending" ||
      status === "budgetholder" ||
      status === "checked"
    ) {
      return (
        <HStack>
          <Tooltip label="Conversations">
            <IconButton
              aria-label="chat icon"
              icon={<Icon color="tetiary.300" as={BsChat} />}
              size={actionButtonSize}
            />
          </Tooltip>
          <Tooltip label="Edit Requisition">
            <IconButton
              aria-label="edit icon"
              icon={<Icon color="blue.300" as={BsPencil} />}
            />
            size={actionButtonSize}
          </Tooltip>
          <Tooltip label="Delete Requisition">
            <IconButton
              bg="red.300"
              color="white"
              aria-label="delete icon"
              icon={<Icon as={BsTrash} />}
            />
          </Tooltip>
        </HStack>
      );
    }
    if (status === "approved" || status === "paid") {
      return (
        <HStack>
          <Tooltip label="Conversations">
            <IconButton
              aria-label="chat icon"
              icon={<Icon color="tetiary.300" as={BsChat} />}
              size={actionButtonSize}
            />
          </Tooltip>
          <Tooltip label="Retire">
            <IconButton
              aria-label="edit icon"
              icon={<Icon color="blue.300" as={BsCalculator} />}
            />
            size={actionButtonSize}
          </Tooltip>
          <Tooltip label="Print Requisition">
            <IconButton
              color="white"
              aria-label="delete icon"
              icon={<Icon color="yellow.300" as={BsPrinter} />}
            />
          </Tooltip>
        </HStack>
      );
    }
    if (status === "retired") {
      return (
        <HStack>
          <Tooltip label="Conversations">
            <IconButton
              aria-label="chat icon"
              icon={<Icon color="tetiary.300" as={BsChat} />}
              size={actionButtonSize}
            />
          </Tooltip>
          <Tooltip label="Print Requisition">
            <IconButton
              aria-label="edit icon"
              icon={<Icon color="blue.300" as={BsPrinter} />}
            />
            size={actionButtonSize}
          </Tooltip>
          <Tooltip label="Download Requisition">
            <IconButton
              bg="green.300"
              color="white"
              aria-label="delete icon"
              icon={<Icon as={BsDownload} />}
            />
          </Tooltip>
        </HStack>
      );
    }
  };
  return (
    <Flex px={5} py={2} bg="white">
      <SimpleGrid columns={[1, 4]}>
        <VStack alignItems="center">
          <Text fontSize="xs" color="red.100">
            {date}
          </Text>
          <Text fontSize="md">{requisition.title}</Text>
        </VStack>
        <HStack spacing={6}>
          {getStatus(requisition.status)}
          <Heading fontSize="lg">{requisition.total.toLocaleString()}</Heading>
        </HStack>
        {getActionButtons()}
      </SimpleGrid>
    </Flex>
  );
};
