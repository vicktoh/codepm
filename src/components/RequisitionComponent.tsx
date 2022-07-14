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
  BsCheck,
  BsDownload,
  BsPencil,
  BsPrinter,
  BsTrash,
} from "react-icons/bs";
import { Requisition } from "../types/Requisition";

type RequisitionComponentProps = {
  requisition: Requisition;
  onEdit: () => void;
  onPrint: () => void;
  onDownload: () => void;
  onDelete: () => void;
  openRetirement: () => void;
  openConversations: () => void;
};

export const RequisitionComponent: FC<RequisitionComponentProps> = ({
  requisition,
  onEdit,
  onPrint,
  onDownload,
  onDelete,
  openRetirement,
  openConversations,
}) => {
  const date = format(new Date(requisition.timestamp), "do MMM Y");
  const { status } = requisition;
  const actionButtonSize = useBreakpointValue({
    base: "sm",
    md: "md",
    lg: "md",
  });
  const isMobile = useBreakpointValue({ base: true, md: true, lg: true });
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
          <VStack>
            <Heading fontSize="sm">Approved by</Heading>
            <Text>{requisition.checkedby}</Text>
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
        <HStack justifySelf={["flex-start", "flex-end"]}>
          <Tooltip label="Conversations">
            <IconButton
              aria-label="chat icon"
              icon={<Icon color="tetiary.300" as={BsChat} />}
              size={actionButtonSize}
              onClick={openConversations}
            />
          </Tooltip>
          <Tooltip label="Edit Requisition">
            <IconButton
              onClick={onEdit}
              aria-label="edit icon"
              icon={<Icon color="blue.300" as={BsPencil} />}
              size={actionButtonSize}
            />
          </Tooltip>
          <Tooltip label="Delete Requisition">
            <IconButton
              onClick={onDelete}
              bg="red.300"
              color="white"
              aria-label="delete icon"
              icon={<Icon as={BsTrash} />}
            />
          </Tooltip>
        </HStack>
      );
    }
    if (
      status === "approved" ||
      status === "retirement-approved" ||
      status === "paid"
    ) {
      return (
        <HStack justifySelf={["flex-start", "flex-end"]}>
          <Tooltip label="Conversations">
            <IconButton
              onClick={openConversations}
              aria-label="chat icon"
              icon={<Icon color="tetiary.300" as={BsChat} />}
              size={actionButtonSize}
            />
          </Tooltip>
          {status === "retirement-approved" ? (
            <IconButton
              aria-label="retirement"
              icon={<Icon color="green" as={BsCheck} />}
            />
          ) : (
            <Tooltip label="Retire">
              <IconButton
                onClick={openRetirement}
                aria-label="retirement icon"
                icon={<Icon color="blue.300" as={BsCalculator} />}
                size={actionButtonSize}
              />
            </Tooltip>
          )}
          <Tooltip label="Print Requisition">
            <IconButton
              onClick={onPrint}
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
        <HStack justifySelf={["flex-start", "flex-end"]}>
          <Tooltip label="Conversations">
            <IconButton
              onClick={openConversations}
              aria-label="chat icon"
              icon={<Icon color="tetiary.300" as={BsChat} />}
              size={actionButtonSize}
            />
          </Tooltip>
          <Tooltip label="Print Requisition">
            <IconButton
              onClick={onPrint}
              aria-label="print icon"
              icon={<Icon color="blue.300" as={BsPrinter} />}
              size={actionButtonSize}
            />
          </Tooltip>
          <Tooltip label="Download Requisition">
            <IconButton
              onClick={onDownload}
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
    <Flex
      px={5}
      py={2}
      bg="white"
      flex="1"
      borderRadius="lg"
      borderColor="black"
      my={1}
    >
      <SimpleGrid py={[4, 0]} gridGap={[0, 5]} columns={[1, 3]} width="100%">
        <VStack spacing={0} mb={[3, 0]} alignItems="flex-star">
          <Text fontSize="xs" color="red.400">
            {date}
          </Text>
          <Tooltip label={requisition.title}>
            <Text isTruncated noOfLines={1} fontSize="lg">
              {requisition.title}
            </Text>
          </Tooltip>
        </VStack>
        {!isMobile ? (
          <>
            {getStatus(requisition.status)}
            <Heading fontSize="lg">
              {requisition.total.toLocaleString()}
            </Heading>
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

        {getActionButtons()}
      </SimpleGrid>
    </Flex>
  );
};
