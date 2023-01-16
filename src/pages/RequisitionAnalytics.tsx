import {
  Avatar,
  Button,
  Flex,
  GridItem,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Text,
  VStack,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { useSearchIndex } from "../hooks/useSearchIndex";
import { useAppSelector } from "../reducers/types";
import {
  consolidateFilter,
  requisitionCategories,
  TimeFilter,
  timeFilterToAlgoliaFilter,
  timeSeries,
} from "../services/requisitionAnalytics";
import { Requisition } from "../types/Requisition";

import {
  VictoryArea,
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryTooltip,
} from "victory";
import { Project } from "../types/Project";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { UserListPopover } from "../components/UserListPopover";
import { BiAbacus, BiMoney } from "react-icons/bi";
import { formatNumber, requisitionsToCSV } from "../services/helpers";
import { BsPeople } from "react-icons/bs";
import { AnalyticsTable } from "../components/AnalyticsTable";
import { AnalyticsUserTable } from "../components/AnalyticsUserTable";
import { AnalyticsProjectTable } from "../components/AnalyticsProjectsTable";

export interface DataFilters {
  creatorId?: string[];
  checkById?: string[];
  approvedById?: string[];
  projectId?: string[];
}
export const RequisitionAnalytics = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>();
  const [filter, setFilter] = useState<DataFilters>({});
  const [showFilter, setShowFilter] = useState<boolean>(false);

  const {
    loading,
    data,
    pageStat,
    setQuery,
    setFacets,
    setFilters: setAlgoliaFilter,
  } = useSearchIndex<Requisition>(
    "requisitions",
    timeFilter ? timeFilterToAlgoliaFilter(timeFilter) : "",
  );

  const { users, projects } = useAppSelector(({ users, projects }) => ({
    users,
    projects,
  }));
  const downloadCSV = () => {
    if (!data) return;
    const encodedURI = requisitionsToCSV(data);
    const link = document.createElement("a");
    link.setAttribute("href", "data:text/csv;charset=utf-8," + encodedURI);
    link.setAttribute("download", "requisitions.csv");
    document.body.appendChild(link);
    link.click();
  };
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
      return {
        users: Object.entries(userCategories).map(([userId, data], i) => {
          const userName =
            users?.usersMap[userId]?.displayName || "Unknown User";
          return { ...data, user: userName };
        }),
        project: Object.entries(projectCategories).map(
          ([projectId, data], i) => {
            const projectTitle =
              projectsMap[projectId]?.title || "Unknown Project";
            return { ...data, project: projectTitle };
          },
        ),
      };
    }
  }, [data, users, projectsMap]);

  const timedata = useMemo(() => {
    if (!data) return [];
    const series = timeSeries(data, timeFilter || TimeFilter["Last 6 Months"]);
    return series;
  }, [data, timeFilter]);
  const onSelectUser = (
    userId: string,
    key: keyof Omit<DataFilters, "timestamp">,
  ) => {
    const value = filter[key];
    if (value === undefined) {
      const newFilter = { ...filter, [key]: [userId] };
      setFilter(newFilter);
      setFacets(consolidateFilter(newFilter));
      return;
    }
    const index = value.indexOf(userId);
    if (index > -1) {
      const creators = [...value];
      creators.splice(index, 1);
      const newFilter = { ...filter, [key]: creators };
      setFilter(newFilter);
      setFacets(consolidateFilter(newFilter));
    } else {
      const newFilter = {
        ...filter,
        [key]: [...(value || []), userId],
      };
      setFilter(newFilter);
      setFacets(consolidateFilter(newFilter));
    }
  };
  const onSelectTime = (timeFilter: TimeFilter | undefined) => {
    if (!timeFilter) {
      setTimeFilter(timeFilter);
      setAlgoliaFilter("");
      return;
    }
    setTimeFilter(timeFilter);
    setAlgoliaFilter(timeFilterToAlgoliaFilter(timeFilter));
  };
  const usersList = useMemo(() => {
    return Object.values(projectCategories?.userCategories || []);
  }, [projectCategories?.userCategories]);
  const projectsList = useMemo(() => {
    return Object.values(projectCategories?.projectCategories || []);
  }, [projectCategories?.projectCategories]);
  return (
    <Flex direction="column" position="relative">
      <Heading>Analytics</Heading>
      <Flex direction="column" px={4} py={10} bg="blackAlpha.100">
        <Input
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Requisition"
          alignSelf="flex-start"
        />
        <Flex justifyContent="space-between">
          <Button
            colorScheme="brand"
            variant="link"
            alignSelf="flex-start"
            size="sm"
            my={5}
            onClick={() => setShowFilter(!showFilter)}
          >
            {`${showFilter ? "Hide" : "Show"} Advanced filter`}
          </Button>

          {pageStat?.total && !loading ? (
            <HStack>
              <Text fontSize="sm" fontWeight="bold">
                Result Set:
              </Text>
              <Text fontSize="sm">{pageStat.total}</Text>
            </HStack>
          ) : (
            <Text fontSize="sm">Loading..</Text>
          )}
        </Flex>
        {showFilter ? (
          <Flex direction="column" my={4} px={5} py={4}>
            <SimpleGrid columns={[1, 2, 2]}>
              <Flex direction="column">
                <Heading fontSize="md" mb={2}>
                  Filter by Users
                </Heading>
                <HStack spacing={4}>
                  <VStack alignItems="flex-start">
                    <Text fontWeight="bold" fontSize="sm">
                      Raised By
                    </Text>
                    <UserListPopover
                      assignees={filter.creatorId || []}
                      onSelectUser={(userId: string) =>
                        onSelectUser(userId, "creatorId")
                      }
                      closeOnSelect={true}
                    >
                      <HStack
                        spacing={1}
                        overflowWrap="anywhere"
                        {...glassEffect}
                        shadow={3}
                      >
                        {filter.creatorId?.length ? (
                          filter.creatorId.map((userId) => (
                            <Tooltip
                              key={`user-${userId}`}
                              title={
                                users?.usersMap[userId]?.displayName ||
                                "Unknown User"
                              }
                            >
                              <Avatar
                                size="sm"
                                name={
                                  users?.usersMap[userId]?.displayName ||
                                  "Unknown User"
                                }
                                src={users?.usersMap[userId]?.photoUrl || ""}
                              />
                            </Tooltip>
                          ))
                        ) : (
                          <Button size="xs" variant="outline">
                            Select User
                          </Button>
                        )}
                      </HStack>
                    </UserListPopover>
                  </VStack>
                  <VStack alignItems="flex-start">
                    <Text fontWeight="bold" fontSize="sm">
                      Checked By
                    </Text>
                    <UserListPopover
                      assignees={filter.checkById || []}
                      onSelectUser={(userId: string) =>
                        onSelectUser(userId, "checkById")
                      }
                      closeOnSelect={true}
                    >
                      <HStack
                        spacing={1}
                        overflowWrap="anywhere"
                        {...glassEffect}
                        shadow={3}
                      >
                        {filter.checkById?.length ? (
                          filter.checkById.map((userId) => (
                            <Tooltip
                              key={`user-${userId}`}
                              title={
                                users?.usersMap[userId]?.displayName ||
                                "Unknown User"
                              }
                            >
                              <Avatar
                                size="sm"
                                name={
                                  users?.usersMap[userId]?.displayName ||
                                  "Unknown User"
                                }
                                src={users?.usersMap[userId]?.photoUrl || ""}
                              />
                            </Tooltip>
                          ))
                        ) : (
                          <Button size="xs" variant="outline">
                            Select User
                          </Button>
                        )}
                      </HStack>
                    </UserListPopover>
                  </VStack>
                  <VStack alignItems="flex-start">
                    <Text fontWeight="bold" fontSize="sm">
                      Approved By
                    </Text>
                    <UserListPopover
                      assignees={filter.approvedById || []}
                      onSelectUser={(userId: string) =>
                        onSelectUser(userId, "approvedById")
                      }
                      closeOnSelect={true}
                    >
                      <HStack
                        spacing={1}
                        overflowWrap="anywhere"
                        {...glassEffect}
                        shadow={3}
                      >
                        {filter.approvedById?.length ? (
                          filter.approvedById.map((userId) => (
                            <Tooltip
                              key={`user-${userId}`}
                              title={
                                users?.usersMap[userId]?.displayName ||
                                "Unknown User"
                              }
                            >
                              <Avatar
                                size="sm"
                                name={
                                  users?.usersMap[userId]?.displayName ||
                                  "Unknown User"
                                }
                                src={users?.usersMap[userId]?.photoUrl || ""}
                              />
                            </Tooltip>
                          ))
                        ) : (
                          <Button size="xs" variant="outline">
                            Select User
                          </Button>
                        )}
                      </HStack>
                    </UserListPopover>
                  </VStack>
                </HStack>
              </Flex>
              <Flex direction="column">
                <Heading fontSize="md" mb={3}>
                  Filter by Time
                </Heading>
                <Flex
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  bg="blackAlpha.200"
                  p={1}
                >
                  <Button
                    variant={timeFilter === undefined ? "solid" : "outline"}
                    onClick={() => onSelectTime(undefined)}
                    colorScheme="brand"
                    size="xs"
                  >
                    All
                  </Button>
                  {Object.entries(TimeFilter).map(([key, value]) => (
                    <Button
                      key={`time-${value}`}
                      variant={timeFilter === value ? "solid" : "outline"}
                      onClick={() => onSelectTime(value)}
                      colorScheme="brand"
                      size="xs"
                    >
                      {key}
                    </Button>
                  ))}
                </Flex>
              </Flex>
            </SimpleGrid>
          </Flex>
        ) : null}
      </Flex>
      <SimpleGrid columns={[1, 3, 3]} gap={3} my={3}>
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="center"
          borderRadius="lg"
          bg="white"
          py={4}
        >
          <Icon as={BiMoney} boxSize={10} color="green.300" mr={2} />
          <VStack alignItems="flex-start" spacing={0}>
            <Heading>
              {projectCategories?.totalValue
                ? formatNumber(projectCategories?.totalValue)
                : "-"}
            </Heading>
            <Text fontSize="sm">Total Requisitin Value</Text>
          </VStack>
        </Flex>
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="center"
          borderRadius="lg"
          bg="white"
          py={4}
        >
          <Icon as={BiAbacus} boxSize={10} color="orange.300" mr={2} />
          <VStack alignItems="flex-start" spacing={0}>
            <Heading>
              {projectCategories?.totalCount
                ? formatNumber(projectCategories?.totalCount)
                : "-"}
            </Heading>
            <Text fontSize="sm">Total Requisition Count</Text>
          </VStack>
        </Flex>
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="center"
          borderRadius="lg"
          bg="white"
          py={4}
        >
          <Icon as={BsPeople} boxSize={10} color="blue.300" mr={2} />
          <VStack alignItems="flex-start" spacing={0}>
            <Heading>
              {projectCategories?.totalUsersCount
                ? formatNumber(projectCategories?.totalUsersCount)
                : "-"}
            </Heading>
            <Text fontSize="sm">Total User Count</Text>
          </VStack>
        </Flex>
      </SimpleGrid>
      <Flex
        direction="column"
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
          <Button
            onClick={downloadCSV}
            variant="outline"
            colorScheme="brand"
            size="md"
            ml="auto"
          >
            Download CSV
          </Button>
        </Flex>
        {data ? <AnalyticsTable data={data} total={pageStat?.total} /> : null}
      </Flex>
      <SimpleGrid columns={2} spacing={3} my={3}>
        {chartData?.users ? (
          <GridItem
            colSpan={1}
            bg="white"
            borderRadius="lg"
            alignItems="center"
            px={3}
            py={4}
          >
            <Heading fontSize="md" my={2}>
              User Requisition by Value
            </Heading>
            <VictoryChart domainPadding={30}>
              <VictoryAxis dependentAxis tickFormat={(x) => `${x / 1000}k`} />
              <VictoryAxis />
              <VictoryLabel title="Total Amount by Users" x={200} y={20} />
              <VictoryBar
                animate={true}
                labels={({ datum }) => {
                  if (datum.value > 1000) {
                    return `${datum.user}
                  ${(datum.value / 1000).toFixed()}k`;
                  }
                  return `${datum.user}/n ${datum.value}`;
                }}
                style={{ data: { fill: "tomato" } }}
                labelComponent={<VictoryTooltip dy={0} />}
                data={chartData?.users || []}
                x="user"
                y="value"
              />
              <VictoryLine
                style={{ data: { stroke: "teal" } }}
                data={chartData?.users || []}
                x="user"
                y="value"
              />
            </VictoryChart>
          </GridItem>
        ) : null}
        {chartData?.users ? (
          <GridItem
            colSpan={[1, 1, 1]}
            bg="white"
            borderRadius="lg"
            alignItems="center"
            px={3}
            py={4}
          >
            <Heading fontSize="md" my={2}>
              User Requisition by Count
            </Heading>
            <VictoryChart domainPadding={30}>
              <VictoryLabel
                title="Total Value by User"
                x={225}
                y={20}
                textAnchor="middle"
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(x) => `${formatNumber(x)}`}
              />
              <VictoryAxis />
              <VictoryBar
                animate={true}
                labels={({ datum }) => {
                  if (datum.count > 1000) {
                    return `${datum.user}
                    ${(datum.count / 1000).toFixed()}k`;
                  }
                  return `${datum.user} 
                  ${datum.count}`;
                }}
                style={{ data: { fill: "teal" } }}
                labelComponent={<VictoryTooltip dy={0} />}
                data={chartData?.users || []}
                x="user"
                y="count"
              />
            </VictoryChart>
          </GridItem>
        ) : null}
      </SimpleGrid>
      <SimpleGrid columns={1} mb={3}>
        <GridItem bg="white" borderRadius="lg">
          <Heading fontSize="medium" ml={5} my={5}>
            Users Info
          </Heading>
          <AnalyticsUserTable data={usersList} total={usersList.length} />
        </GridItem>
      </SimpleGrid>
      <SimpleGrid columns={[1, 2, 2]} spacing={3} my={3}>
        {chartData?.project ? (
          <GridItem
            colSpan={1}
            bg="white"
            borderRadius="lg"
            alignItems="center"
            px={3}
            py={4}
          >
            <Heading fontSize="md" my={2}>
              Project Requisitions by Value
            </Heading>
            <VictoryChart domainPadding={30}>
              <VictoryAxis
                dependentAxis
                style={{ tickLabels: { fontSize: 10 } }}
                tickFormat={(x) => `${x / 1000}k`}
              />
              <VictoryAxis
                tickFormat={(x) => {
                  if (x.length > 10) return `${x.slice(0, 20)}...`;
                  return x;
                }}
              />
              <VictoryLabel title="Total Amount by Users" x={200} y={20} />
              <VictoryBar
                animate={true}
                labels={({ datum }) => {
                  if (datum.value > 1000) {
                    return `${datum.project}
                  ${(datum.value / 1000).toFixed()}k`;
                  }
                  return `${datum.project}/n ${datum.value}`;
                }}
                style={{ data: { fill: "tomato" } }}
                labelComponent={<VictoryTooltip dy={0} />}
                data={chartData?.project || []}
                x="project"
                y="value"
              />
              <VictoryLine
                style={{ data: { stroke: "yellow" } }}
                data={chartData?.project || []}
                x="project"
                y="value"
              />
            </VictoryChart>
          </GridItem>
        ) : null}
        {chartData?.project ? (
          <GridItem
            colSpan={[1, 1, 1]}
            bg="white"
            borderRadius="lg"
            alignItems="center"
            px={3}
            py={4}
          >
            <Heading fontSize="md" my={2}>
              Project Requisitions by Count
            </Heading>
            <VictoryChart domainPadding={30}>
              <VictoryLabel
                title="Total Value by User"
                x={225}
                y={20}
                textAnchor="middle"
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(x) => `${formatNumber(x)}`}
              />
              <VictoryAxis
                tickFormat={(x) => {
                  if (x.length > 10) return `${x.slice(0, 20)}...`;
                  return x;
                }}
              />
              <VictoryBar
                animate={true}
                labels={({ datum }) => {
                  if (datum.count > 1000) {
                    return `${datum.project}
                    ${(datum.count / 1000).toFixed()}k`;
                  }
                  return `${datum.project} 
                  ${datum.count}`;
                }}
                style={{ data: { fill: "orange" } }}
                labelComponent={<VictoryTooltip dy={0} />}
                data={chartData?.project || []}
                x="project"
                y="count"
              />
            </VictoryChart>
          </GridItem>
        ) : null}
      </SimpleGrid>
      <GridItem colSpan={4} bg="white" mb={3} borderRadius="lg">
        <Heading fontSize="medium" ml={5} my={5}>
          Project Info
        </Heading>
        <AnalyticsProjectTable
          data={projectsList}
          total={projectsList.length}
        />
      </GridItem>
      <GridItem colSpan={4} bg="white" mb={3} borderRadius="lg" px={3} py={4}>
        <Heading fontSize="md">Time series Requisition Count</Heading>
        <VictoryChart domainPadding={30}>
          <VictoryAxis
            dependentAxis
            tickFormat={(x) => `${formatNumber(x)}`}
            style={{ tickLabels: { fontSize: 8 } }}
          />
          <VictoryAxis style={{ tickLabels: { fontSize: 8 } }} />
          <VictoryArea
            animate={true}
            data={timedata || []}
            x="date"
            y="value"
            style={{ data: { fill: "orange" }, labels: { fontSize: 10 } }}
          />
        </VictoryChart>
      </GridItem>
    </Flex>
  );
};
