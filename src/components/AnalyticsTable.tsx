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
type AnalyticsProps = {
  data: Requisition[];
  perpage?: number;
  total?: number;
};
export const AnalyticsTable: FC<AnalyticsProps> = ({
  data,
  perpage = 4,
  total = 0,
}) => {
  const [page, setPage] = useState<number>(1);
  const { users } = useAppSelector(({ users }) => ({ users }));
  const dataTorender = useMemo(() => {
    const start = (page - 1) * perpage;
    let end = start + perpage;
    end = end > total ? total : end;
    return data.slice(start, end);
  }, [page, data, perpage, total]);
  const pages = useMemo(() => {
    return Math.floor(total / perpage);
  }, [total, perpage]);
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
  const toast = useToast();
  const printRequisition = usePrintPrequisition();
  const onPrint = async (requisition: Requisition, download: boolean) => {
    try {
      await printRequisition(requisition, download);
    } catch (error) {
      console.log(error);
      const err: any = error;
      toast({
        status: "error",
        description: err?.message || "unknown error",
      });
    }
  };

  return (
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
          {dataTorender.length ? (
            dataTorender.map((req, i) => (
              <Tr key={req.id}>
                <Td>{req.title}</Td>
                <Td>{users?.usersMap[req.creatorId]?.displayName || "-"}</Td>
                <Td>
                  {users?.usersMap[req?.checkedById || ""]?.displayName || "-"}
                </Td>
                <Td>
                  {users?.usersMap[req?.approvedById || ""]?.displayName || "-"}
                </Td>
                <Td>{req.total.toLocaleString()}</Td>
                <Td>{format(req.timestamp, "do LLL yyy")}</Td>
                <Td>
                  <HStack spacing={4} alignItems="center">
                    <Tooltip title="Download">
                      <IconButton
                        onClick={() => onPrint(req, true)}
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
                        onClick={() => printRequisition(req, false)}
                        colorScheme="purple"
                        variant="outline"
                        aria-label="Print button"
                        icon={<BiPrinter />}
                      />
                    </Tooltip>
                    <Tooltip title="View">
                      <IconButton
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
                {`Showing ${page} of ${pages}`}
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
  );
};
