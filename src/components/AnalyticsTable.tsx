import {
  HStack,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
  useBreakpointValue,
  Flex,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  Heading,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { FC, useMemo, useState } from "react";
import {
  BiChevronLeft,
  BiChevronRight,
  BiDownload,
  BiPrinter,
} from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import { usePrintPrequisition } from "../hooks/usePrintRequisition";
import { useAppSelector } from "../reducers/types";
import { Requisition, RequisitionStatus } from "../types/Requisition";
import { RequisitionView } from "./RequisitionForm/RequisitionView";
type AnalyticsProps = {
  data: Requisition[];
  page: number;
  setPage: (page: number) => void;
  perpage?: number;
  total?: number;
};
export const AnalyticsTable: FC<AnalyticsProps> = ({
  data,
  page,
  setPage,
  perpage = 4,
  total = 0,
}) => {
  const { users } = useAppSelector(({ users }) => ({ users }));

  const pages = useMemo(() => {
    return Math.floor(total / perpage);
  }, [total, perpage]);
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
  const {
    isOpen: isRequisitionModalOpen,
    onClose: onCloseRequisitionModal,
    onOpen,
  } = useDisclosure();
  const toast = useToast();
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition>();
  const [printing, setPrinting] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const printRequisition = usePrintPrequisition();
  const onPrint = async (requisition: Requisition, download: boolean) => {
    try {
      download ? setDownloading(true) : setPrinting(true);
      setSelectedRequisition(requisition);
      await printRequisition(requisition, download);
    } catch (error) {
      console.log(error);
      const err: any = error;
      toast({
        status: "error",
        description: err?.message || "unknown error",
      });
    } finally {
      download ? setDownloading(false) : setPrinting(false);
    }
  };
  const onViewRequisition = (req: Requisition) => {
    setSelectedRequisition(req);
    onOpen();
  };
  console.log({ printing, selectedRequisition });

  return (
    <>
      <TableContainer
        maxWidth="100%"
        whiteSpace={isMobile ? "nowrap" : "initial"}
      >
        <Table>
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>User</Th>
              <Th>Checked By</Th>
              <Th>Approved By</Th>
              <Th>Amount</Th>
              <Th>Date</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.length ? (
              data.map((req, i) => (
                <Tr key={req.id}>
                  <Td>{req.title}</Td>
                  <Td>{users?.usersMap[req.creatorId]?.displayName || "-"}</Td>
                  <Td>
                    {users?.usersMap[req?.checkedById || ""]?.displayName ||
                      "-"}
                  </Td>
                  <Td>
                    {users?.usersMap[req?.approvedById || ""]?.displayName ||
                      "-"}
                  </Td>
                  <Td>{req.total.toLocaleString()}</Td>
                  <Td>{format(req.timestamp, "do LLL yyy")}</Td>
                  <Td>
                    <HStack spacing={4} alignItems="center">
                      <Tooltip title="Download">
                        <IconButton
                          onClick={() => onPrint(req, true)}
                          isLoading={
                            selectedRequisition?.id === req.id && downloading
                          }
                          disabled={
                            ![
                              RequisitionStatus.paid,
                              RequisitionStatus.approved,
                              RequisitionStatus.retired,
                              RequisitionStatus["retirement-approved"],
                            ].includes(req.status)
                          }
                          colorScheme="teal"
                          aria-label="Download button"
                          icon={<BiDownload />}
                        />
                      </Tooltip>
                      <Tooltip title="Print">
                        <IconButton
                          disabled={
                            ![
                              RequisitionStatus.paid,
                              RequisitionStatus.approved,
                              RequisitionStatus.retired,
                              RequisitionStatus["retirement-approved"],
                            ].includes(req.status)
                          }
                          isLoading={
                            selectedRequisition?.id === req.id && printing
                          }
                          onClick={() => onPrint(req, false)}
                          colorScheme="purple"
                          variant="outline"
                          aria-label="Print button"
                          icon={<BiPrinter />}
                        />
                      </Tooltip>
                      <Tooltip title="View">
                        <IconButton
                          onClick={() => onViewRequisition(req)}
                          colorScheme="cyan"
                          aria-label="View button"
                          icon={<BsEye />}
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={7}>No Data Available</Td>
              </Tr>
            )}
          </Tbody>
          <Tfoot>
            <Td colSpan={7}>
              <Flex
                justifyContent="space-between"
                width="100%"
                alignItems="center"
              >
                <Text fontSize="md" fontWeight="bold">
                  {`Showing ${page + 1} of ${pages}`}
                </Text>
                <HStack alignItems="center" ml="auto">
                  <IconButton
                    onClick={() => setPage(page - 1)}
                    icon={<BiChevronLeft />}
                    disabled={page < 2}
                    aria-label="Previous page"
                  />
                  <IconButton
                    icon={<BiChevronRight />}
                    aria-label="Previous page"
                    disabled={page >= pages}
                    onClick={() => setPage(page + 1)}
                  />
                </HStack>
              </Flex>
            </Td>
          </Tfoot>
        </Table>
      </TableContainer>
      <Modal
        size="3xl"
        isOpen={isRequisitionModalOpen}
        onClose={onCloseRequisitionModal}
      >
        <ModalOverlay />
        <ModalContent background="white">
          <ModalCloseButton />
          <ModalHeader>
            <Heading fontSize={isMobile ? "md" : "lg"}>
              View Requisition
            </Heading>
          </ModalHeader>
          <ModalBody>
            {selectedRequisition && (
              <RequisitionView
                onClose={onCloseRequisitionModal}
                requisition={selectedRequisition}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
