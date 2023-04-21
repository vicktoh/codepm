import {
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Text,
  Tooltip,
  useBreakpointValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { FC, useState } from "react";
import {
  BsCalculator,
  BsChat,
  BsCheck,
  BsDownload,
  BsPencil,
  BsPrinter,
  BsTrash,
} from "react-icons/bs";
import { useAppSelector } from "../reducers/types";
import { Requisition, RequisitionStatus } from "../types/Requisition";

type RequisitionComponentProps = {
  requisition: Requisition;
  onEdit: () => void;
  onPrint: () => Promise<void>;
  onDownload: () => Promise<void>;
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
  const { auth } = useAppSelector(({ auth }) => ({ auth }));
  const [isPrinting, setPrinting] = useState<boolean>();
  const [downloading, setDownloading] = useState<boolean>();
  // const [isDowloading, setDownloading] = useState<boolean>();
  const toast = useToast();
  const { status } = requisition;
  const actionButtonSize = useBreakpointValue({
    base: "sm",
    md: "md",
    lg: "md",
  });
  const isMobile = useBreakpointValue({ base: true, md: true, lg: true });
  const printDocument = async () => {
    try {
      setPrinting(true);
      await onPrint();
    } catch (error) {
      const err: any = error;
      toast({
        title: "Could not print document",
        description: err?.message || "unkown error",
        status: "error",
      });
    } finally {
      setPrinting(false);
    }
  };
  const downloadDocument = async () => {
    try {
      setDownloading(true);
      await onDownload();
    } catch (error) {
      const err: any = error;
      toast({
        title: "Could not print document",
        description: err?.message || "unkown error",
        status: "error",
      });
    } finally {
      setDownloading(false);
    }
  };
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
      case "reviewed":
        return (
          <VStack spacing={0} alignItems="flex-start">
            <Text fontSize="sm">Reviewed By</Text>
            <Heading fontSize="md">
              {requisition.reviewedBy?.displayName}
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
        return (
          <VStack spacing={0} alignItems="flex-start">
            <Text>Retired</Text>;
            <Text fontSize="xs" color="brand.300">
              Awaiting Approval
            </Text>
            ;
          </VStack>
        );
      case RequisitionStatus["retirement-approved"]:
        return (
          <VStack spacing={0} alignItems="flex-start">
            <Text>Retired</Text>;
            <Text fontSize="xs" color="green.300">
              Approved
            </Text>
            ;
          </VStack>
        );
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
      status === "reviewed" ||
      status === "checked"
    ) {
      return (
        <HStack justifySelf={["flex-start", "flex-end"]}>
          <Tooltip label="Conversations">
            <Box position="relative">
              <IconButton
                aria-label="chat icon"
                icon={<Icon color="tetiary.300" as={BsChat} />}
                size={actionButtonSize}
                onClick={openConversations}
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
    if (status === "approved" || status === "retired" || status === "paid") {
      return (
        <HStack justifySelf={["flex-start", "flex-end"]}>
          <Tooltip label="Conversations">
            <Box position="relative">
              <IconButton
                aria-label="chat icon"
                icon={<Icon color="tetiary.300" as={BsChat} />}
                size={actionButtonSize}
                onClick={openConversations}
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
          <Tooltip label="Retire">
            <IconButton
              onClick={openRetirement}
              aria-label="retirement icon"
              icon={<Icon color="blue.300" as={BsCalculator} />}
              size={actionButtonSize}
            />
          </Tooltip>
          <Tooltip label="Print Requisition">
            <IconButton
              onClick={onPrint}
              color="white"
              aria-label="delete icon"
              icon={<Icon color="purple.300" as={BsPrinter} />}
            />
          </Tooltip>
          <Tooltip label="Download Requisition">
            <IconButton
              onClick={downloadDocument}
              bg="green.300"
              color="white"
              aria-label="delete icon"
              isLoading={downloading}
              disabled={downloading}
              icon={<Icon as={BsDownload} />}
            />
          </Tooltip>
        </HStack>
      );
    }
    if (status === RequisitionStatus["retirement-approved"]) {
      return (
        <HStack justifySelf={["flex-start", "flex-end"]}>
          <Tooltip label="Conversations">
            <Box position="relative">
              <IconButton
                aria-label="chat icon"
                icon={<Icon color="tetiary.300" as={BsChat} />}
                size={actionButtonSize}
                onClick={openConversations}
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
          <Tooltip label="Print Requisition">
            <IconButton
              onClick={printDocument}
              aria-label="print icon"
              icon={<Icon color="blue.300" as={BsPrinter} />}
              size={actionButtonSize}
              disabled={isPrinting}
              isLoading={isPrinting}
            />
          </Tooltip>
          <Tooltip label="Download Requisition">
            <IconButton
              onClick={downloadDocument}
              bg="green.300"
              color="white"
              aria-label="delete icon"
              isLoading={downloading}
              disabled={downloading}
              icon={<Icon as={BsDownload} />}
            />
          </Tooltip>
          <Tooltip label="Retirement Approved">
            <IconButton
              aria-label="retirement"
              icon={<Icon color="green" as={BsCheck} />}
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
