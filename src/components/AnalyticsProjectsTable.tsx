import {
  Flex,
  HStack,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
} from "@chakra-ui/react";
import React, { FC, useMemo } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { useTablePagination } from "../hooks/useTablePagination";
import { useAppSelector } from "../reducers/types";
import { CategoryData } from "../services/requisitionAnalytics";
import { Project } from "../types/Project";
type AnalyticsProjectTableProps = {
  total: number;
  data: CategoryData[];
  perpage?: number;
};
export const AnalyticsProjectTable: FC<AnalyticsProjectTableProps> = ({
  total,
  data,
  perpage = 4,
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
  const { projects } = useAppSelector(({ projects }) => ({
    projects,
  }));
  const projectsMap = useMemo(() => {
    const map: Record<string, Project> = {};
    if (projects) {
      projects.forEach((project) => (map[project.id] = project));
    }
    return map;
  }, [projects]);
  const { dataTorender, pages, next, prev, page } =
    useTablePagination<CategoryData>({ total, data, perpage });
  return (
    <TableContainer
      maxWidth="100%"
      whiteSpace={isMobile ? "nowrap" : "initial"}
    >
      <Table>
        <Thead>
          <Tr>
            <Th>Project</Th>
            <Th>Requisitions Count</Th>
            <Th>Requisitions Value</Th>
          </Tr>
        </Thead>
        <Tbody>
          {dataTorender.length ? (
            dataTorender.map((val) => (
              <Tr key={val.id}>
                <Td>
                  <Text>{projectsMap[val.id]?.title || "Unknown user"}</Text>
                </Td>
                <Td>{val.count}</Td>
                <Td>{val.value.toLocaleString()}</Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={3}>No Users Available</Td>
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
                  onClick={prev}
                  icon={<BiChevronLeft />}
                  disabled={page < 2}
                  aria-label="Previous page"
                />
                <IconButton
                  icon={<BiChevronRight />}
                  aria-label="Previous page"
                  disabled={page >= pages}
                  onClick={next}
                />
              </HStack>
            </Flex>
          </Td>
        </Tfoot>
      </Table>
    </TableContainer>
  );
};
