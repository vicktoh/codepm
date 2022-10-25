import {
  Avatar,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { useMemo } from "react";
import { useSearchIndex } from "../hooks/useSearchIndex";
import { useAppSelector } from "../reducers/types";
import {
  requisitionCategories,
  TimeFilter,
  timeSeries,
} from "../services/requisitionAnalytics";
import { Requisition } from "../types/Requisition";
import {
  Chart as ChartJs,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { COLOR_SPECTRUM_TAGS } from "../constants";
import { Project } from "../types/Project";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
// import Papa from "papaparse";
ChartJs.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
);
export const RequisitionAnalytics = () => {
  const { loading, data, pageStat, setQuery } =
    useSearchIndex<Requisition[]>("requisitions");
  const { users, projects } = useAppSelector(({ users, projects }) => ({
    users,
    projects,
  }));
  // const downloadCSV = () => {
  //   if (!data) return;
  //   const csvContent = Papa.unparse(data.map(({title, user})))
  // };
  const glassEffect = useGlassEffect(true, "lg");

  const projectsMap = useMemo(() => {
    const map: Record<string, Project> = {};
    if (projects) {
      projects.forEach((project) => (map[project.id] = project));
    }
    return map;
  }, [projects]);
  const projectCategories = useMemo(() => {
    if (data) {
      return requisitionCategories(data);
    }
  }, [data]);
  const chartData = useMemo(() => {
    if (data) {
      const { userCategories, projectCategories } = requisitionCategories(data);
      const projectLabel = Object.keys(projectCategories).map(
        (key) => projectsMap[key]?.title || "UnknownProject",
      );
      const countData = Object.values(projectCategories).map(
        ({ count }) => count,
      );
      const valueData = Object.values(projectCategories).map(
        ({ value }) => value,
      );
      const usersLabel = Object.keys(userCategories).map(
        (key) => users?.usersMap[key]?.displayName || "User not found",
      );
      const userCounts = Object.values(userCategories).map(
        ({ count }) => count,
      );
      const usersValue = Object.values(userCategories).map(
        ({ value }) => value,
      );

      return {
        project: {
          datasets: [
            {
              label: "Project Count",
              data: countData,
              backgroundColor: COLOR_SPECTRUM_TAGS,
            },
            {
              label: "Project Value",
              backgroundColor: COLOR_SPECTRUM_TAGS,
              data: valueData,
            },
          ],
          labels: projectLabel,
        },
        user: [
          {
            datasets: [
              {
                label: "User Requisition Count",
                data: userCounts,
                backgroundColor: COLOR_SPECTRUM_TAGS,
              },
            ],
            labels: usersLabel,
          },
          {
            datasets: [
              {
                label: "Total Requisition Value",
                data: usersValue,
                backgroundColor: COLOR_SPECTRUM_TAGS,
              },
            ],
            labels: usersLabel,
          },
        ],
      };
    }
  }, [data, users, projectsMap]);

  const timedata = useMemo(() => {
    if (!data) return undefined;
    const series = timeSeries(data, TimeFilter["Last 6 Months"]);
    console.log({ series });
    return series;
  }, [data]);
  return (
    <Flex direction="column">
      <Heading>Analytics</Heading>
      <Grid width="100%" templateColumns="repeat(12, 1fr)" gridGap={4}>
        <GridItem
          colSpan={12}
          bg="white"
          px={3}
          py={4}
          borderRadius="lg"
          mt={5}
        >
          <Heading fontSize="md" ml={5}>
            User Requisitions
          </Heading>
          <Flex
            direction="row"
            my={5}
            alignItems="center"
            justifyContent="space-between"
            px={3}
          >
            <Input
              maxWidth="300px"
              ml={3}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Requisition"
              alignSelf="flex-start"
            />
            <Button variant="outline" colorScheme="brand" size="md" ml="auto">
              Download CSV
            </Button>
          </Flex>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>User</Th>
                  <Th>Amount</Th>
                  <Th>Date</Th>;
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={4} textAlign="center">
                      Please wait....
                    </Td>
                  </Tr>
                ) : null}
                {!loading && data?.length ? (
                  data.map((req, i) => (
                    <Tr key={req.id}>
                      <Td>{req.title}</Td>
                      <Td>
                        {users?.usersMap[req.creatorId].displayName || ""}
                      </Td>
                      <Td>{req.total.toLocaleString()}</Td>
                      <Td>{format(req.timestamp, "do LLL yyy")}</Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={4}>No Data Available</Td>
                  </Tr>
                )}
              </Tbody>
              <Tfoot>
                {`Showing ${(pageStat?.currentPage || 0) + 1} of ${
                  pageStat?.pages
                }`}
              </Tfoot>
            </Table>
          </TableContainer>
        </GridItem>
        <GridItem colSpan={6} bg="white" {...glassEffect} p={2}>
          {chartData?.user ? <Bar data={chartData["user"][0]} /> : null}
        </GridItem>
        <GridItem colSpan={6} p={2} {...glassEffect}>
          {chartData?.user ? <Bar data={chartData["user"][1]} /> : null}
        </GridItem>
        <GridItem colSpan={8} bg="white">
          <Heading fontSize="medium" ml={5} my={5}>
            Users Info
          </Heading>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>User</Th>
                  <Th>Requisitions</Th>
                  <Th>Amount</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={4} textAlign="center">
                      Please wait...
                    </Td>
                  </Tr>
                ) : projectCategories?.userCategories ? (
                  Object.entries(projectCategories.userCategories).map(
                    ([key, data]) => (
                      <Tr key={data.id}>
                        <Td>
                          <HStack>
                            <Avatar
                              size="xs"
                              src={users?.usersMap[key]?.photoUrl || ""}
                              name={users?.usersMap[key]?.displayName || ""}
                            />
                            <Text>
                              {users?.usersMap[key]?.displayName ||
                                "Unknown user"}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>{data.count}</Td>
                        <Td>{data.value.toLocaleString()}</Td>
                      </Tr>
                    ),
                  )
                ) : null}
              </Tbody>
            </Table>
          </TableContainer>
        </GridItem>
        <GridItem colSpan={4} {...glassEffect}>
          {chartData ? <Doughnut data={chartData["user"][0]} /> : null}
        </GridItem>

        <GridItem colSpan={6} {...glassEffect} p={2}>
          {chartData ? <Bar data={chartData["project"]} /> : null}
        </GridItem>
        <GridItem colSpan={6} bg="white">
          <Heading fontSize="medium" ml={5} my={5}>
            Project Info
          </Heading>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>Project</Th>
                  <Th>Requisitions</Th>
                  <Th>Amount</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={4} textAlign="center">
                      Please wait...
                    </Td>
                  </Tr>
                ) : projectCategories?.projectCategories ? (
                  Object.entries(projectCategories.projectCategories).map(
                    ([key, data]) => (
                      <Tr key={data.id}>
                        <Td>{projectsMap[key]?.title || "Unknown Project"}</Td>
                        <Td>{data.count}</Td>
                        <Td>{data.value.toLocaleString()}</Td>
                      </Tr>
                    ),
                  )
                ) : null}
              </Tbody>
            </Table>
          </TableContainer>
        </GridItem>
        <GridItem colSpan={12} {...glassEffect} p={2}>
          {timedata ? <Line data={timedata} /> : null}
        </GridItem>
      </Grid>
    </Flex>
  );
};
