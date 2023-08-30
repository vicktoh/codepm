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
  toast,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchIndex } from "../hooks/useSearchIndex";
import { useAppSelector } from "../reducers/types";
import {
  consolidateFilter,
  requisitionCategories,
  TimeFilter,
  timeFilterToAlgoliaFilter,
  timeSeries,
} from "../services/requisitionAnalytics";
import { Requisition, RequisitionStatsData } from "../types/Requisition";

import {
  VictoryArea,
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryTooltip,
} from "victory";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Project } from "../types/Project";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { UserListPopover } from "../components/UserListPopover";
import { BiAbacus, BiCalculator, BiMoney } from "react-icons/bi";
import { formatNumber, requisitionsToCSV } from "../services/helpers";
import {
  BsCalculator,
  BsCheck2All,
  BsCheck2Circle,
  BsClockHistory,
  BsEye,
  BsFileCheckFill,
  BsFileDiff,
  BsPeople,
  BsTrash2,
} from "react-icons/bs";
import { AnalyticsTable } from "../components/AnalyticsTable";
import { AnalyticsUserTable } from "../components/AnalyticsUserTable";
import { AnalyticsProjectTable } from "../components/AnalyticsProjectsTable";
import { IconType } from "react-icons";
import { requisitionStats } from "../services/userServices";
import { J } from "@fullcalendar/core/internal-common";
import { LoadingComponent } from "../components/LoadingComponent";

export interface DataFilters {
  creatorId?: string[];
  checkById?: string[];
  approvedById?: string[];
  projectId?: string[];
}

const statusIcon: Record<
  Requisition["status"],
  { color: string; icon: IconType }
> = {
  approved: {
    color: "green.500",
    icon: BsCheck2All,
  },
  checked: {
    color: "yellow.500",
    icon: BsCheck2Circle,
  },
  pending: {
    color: "orange.500",
    icon: BsClockHistory,
  },
  retired: {
    color: "blue.500",
    icon: BsCalculator,
  },
  reviewed: {
    color: "green.300",
    icon: BsEye,
  },
  budgetholder: {
    color: "orange.700",
    icon: BsFileDiff,
  },
  "retirement-approved": {
    color: "green.300",
    icon: BsCheck2Circle,
  },
  abandoned: {
    color: "red.500",
    icon: BsTrash2,
  },
  paid: {
    color: "green.500",
    icon: BiMoney,
  },
};
const USER_PERPAGE = 10;
export const RequisitionAnalytics = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>();
  const [statusFilter, setStatusFilter] = useState<string>();
  const [filter, setFilter] = useState<DataFilters>({});
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [stats, setStats] = useState<RequisitionStatsData>();
  const toast = useToast();

  const {
    loading,
    data,
    pageStat,
    page,
    setPage,
    setQuery,
    setFacets,
    setFilters: setAlgoliaFilter,
    groups,
  } = useSearchIndex<Requisition>(
    "requisitions",
    timeFilter ? timeFilterToAlgoliaFilter(timeFilter) : "",
    USER_PERPAGE,
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
  const statusCategories = useMemo(() => {
    return groups ? groups["status"] || {} : {};
  }, [groups]);
  const chartData = useMemo(() => {
    if (stats) {
      return {
        users: Object.entries(stats?.stats.userCategories || []).map(
          ([userId, data], i) => {
            const userName =
              users?.usersMap[userId]?.displayName || "Unknown User";
            return { ...data, user: userName };
          },
        ),
        project: Object.entries(stats?.stats.projectCategories || []).map(
          ([projectId, data], i) => {
            const projectTitle =
              projectsMap[projectId]?.title || "Unknown Project";
            return { ...data, project: projectTitle };
          },
        ),
      };
    }
  }, [users, projectsMap, stats]);

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
  const onSelectStatus = (value?: string) => {
    if (value) {
      const newFilter: DataFilters & { status: string[] } = {
        ...filter,
        status: [value],
      };
      setStatusFilter(value);
      setFacets(consolidateFilter(newFilter));
    } else {
      setStatusFilter(undefined);
      setFacets(consolidateFilter(filter));
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
    return Object.values(stats?.stats.userCategories || []);
  }, [stats?.stats.userCategories]);
  const projectsList = useMemo(() => {
    return Object.values(stats?.stats.projectCategories || []);
  }, [stats?.stats.projectCategories]);
  useEffect(() => {
    const fetchRequisitionStats = async () => {
      try {
        setLoadingStats(true);
        const facets = consolidateFilter(filter);
        const requsetFilter = timeFilter
          ? timeFilterToAlgoliaFilter(timeFilter)
          : "";
        const response = await requisitionStats({
          filter: requsetFilter,
          facets: facets as any,
          timeframe: timeFilter,
        });
        setStats(response.data);
      } catch (error) {
        toast({ title: "Could not retrieve stats", status: "error" });
      } finally {
        setLoadingStats(false);
      }
    };
    fetchRequisitionStats();
  }, [filter, timeFilter, toast]);
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
                <Heading fontSize="md" my={3}>
                  Filter by Status
                </Heading>
                <Flex alignItems="center">
                  <Button
                    key={`status-filter-all`}
                    variant={statusFilter === undefined ? "solid" : "outline"}
                    onClick={() => onSelectStatus(undefined)}
                    colorScheme="brand"
                    size="xs"
                  >
                    All
                  </Button>
                  {Object.entries(statusCategories).map(
                    ([status, count], i) => (
                      <Button
                        key={`status-filter-${status}-${i}`}
                        variant={statusFilter === status ? "solid" : "outline"}
                        onClick={() => onSelectStatus(status)}
                        colorScheme="brand"
                        size="xs"
                      >
                        {status}
                      </Button>
                    ),
                  )}
                </Flex>
              </Flex>
            </SimpleGrid>
          </Flex>
        ) : null}
      </Flex>
      {loadingStats ? (
        <LoadingComponent />
      ) : (
        <Flex width="100%" justifyContent="space-between">
          <Flex
            alignItems="center"
            justifyContent="center"
            borderRadius="lg"
            bg="white"
            p={5}
            gap={2}
          >
            <Icon as={BiMoney} color="green.400" boxSize={10} />
            <VStack alignItems="flex-start" spacing={0}>
              <Heading>
                {stats?.stats?.totalValue
                  ? formatNumber(stats.stats.totalValue)
                  : "-"}
              </Heading>
              <Text mt={0}>Total Requisition Value</Text>
            </VStack>
          </Flex>
          <Flex
            alignItems="center"
            justifyContent="center"
            borderRadius="lg"
            bg="white"
            p={5}
            gap={2}
          >
            <Icon as={BiCalculator} color="orange.400" boxSize={10} />
            <VStack alignItems="flex-start" spacing={0}>
              <Heading>
                {stats?.stats?.totalValue
                  ? formatNumber(stats.stats.totalCount)
                  : "-"}
              </Heading>
              <Text mt={0}>Total Requisition Count</Text>
            </VStack>
          </Flex>
          <Flex
            alignItems="center"
            justifyContent="center"
            borderRadius="lg"
            bg="white"
            p={5}
            gap={2}
          >
            <Icon as={BsPeople} color="blue.400" boxSize={10} />
            <VStack alignItems="flex-start" spacing={0}>
              <Heading>
                {stats?.stats?.totalValue
                  ? formatNumber(stats.stats.totalUsersCount)
                  : "-"}
              </Heading>
              <Text mt={0}>Total User Count</Text>
            </VStack>
          </Flex>
        </Flex>
      )}
      <Flex justifyContent="space-between" gap={3} my={3} flexWrap="wrap">
        {Object.entries(statusCategories).map(([key, value]) => (
          <Flex
            direction="row"
            alignItems="center"
            justifyContent="center"
            borderRadius="lg"
            bg="white"
            py={4}
            key={`status-{key}`}
            maxWidth="150px"
            width="100%"
          >
            <VStack spacing={0}>
              <Icon
                as={statusIcon[key as Requisition["status"]].icon}
                boxSize={5}
                color={statusIcon[key as Requisition["status"]].color}
                mb={2}
              />
              <Heading fontSize="lg">{value}</Heading>
              <Text fontSize="sm">{key}</Text>
            </VStack>
          </Flex>
        ))}
      </Flex>
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
        {data ? (
          <AnalyticsTable
            page={page}
            setPage={setPage}
            data={data}
            perpage={USER_PERPAGE}
            total={pageStat?.total}
          />
        ) : null}
      </Flex>
      <SimpleGrid columns={[1, 2]} spacing={3} my={3}>
        {chartData?.users ? (
          <GridItem
            colSpan={1}
            bg="whiteAlpha.400"
            borderRadius="lg"
            alignItems="center"
            px={3}
            py={4}
            height="500px"
          >
            <Heading fontSize="md" my={2}>
              User Requisition by Value
            </Heading>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.users}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 40,
                }}
              >
                <XAxis dataKey="user" />
                <YAxis />
                <RechartTooltip
                  formatter={(value) => formatNumber(value as any)}
                />
                <Bar dataKey="value" fill="#17B9E8" />
              </BarChart>
            </ResponsiveContainer>
          </GridItem>
        ) : null}
        {chartData?.users ? (
          <GridItem
            colSpan={[1, 1, 1]}
            bg="whiteAlpha.400"
            borderRadius="lg"
            alignItems="center"
            px={3}
            py={4}
            height="500px"
          >
            <Heading fontSize="md" my={2}>
              User Requisition by Count
            </Heading>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.users}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 40,
                }}
              >
                <XAxis dataKey="user" />
                <YAxis />
                <RechartTooltip />
                <Bar dataKey="count" fill="#A15E9D" />
              </BarChart>
            </ResponsiveContainer>
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
            bg="whiteAlpha.400"
            borderRadius="lg"
            alignItems="center"
            px={3}
            py={4}
            height="500px"
          >
            <Heading fontSize="md" my={2}>
              Project Requisitions by Value
            </Heading>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.project}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 40,
                }}
              >
                <XAxis dataKey="project" />
                <YAxis />
                <RechartTooltip
                  formatter={(value) => formatNumber(value as any)}
                />
                <Bar dataKey="value" fill="#99D42B" />
              </BarChart>
            </ResponsiveContainer>
          </GridItem>
        ) : null}
        {chartData?.project ? (
          <GridItem
            colSpan={[1, 1, 1]}
            bg="whiteAlpha.400"
            borderRadius="lg"
            alignItems="center"
            px={3}
            py={4}
            height="500px"
          >
            <Heading fontSize="md" my={2}>
              Project Requisitions by Count
            </Heading>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.project}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 40,
                }}
              >
                <XAxis dataKey="project" />
                <YAxis />
                <RechartTooltip
                  formatter={(value) => formatNumber(value as any)}
                />
                <Bar dataKey="count" fill="#DD22BF" />
              </BarChart>
            </ResponsiveContainer>
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
      <GridItem
        colSpan={4}
        bg="white"
        mb={3}
        borderRadius="lg"
        px={3}
        py={4}
        height="500px"
      >
        <Heading fontSize="md">Time series Requisition Count</Heading>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={stats?.series || []}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 40,
            }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" fontSize={10} />
            <YAxis />
            <RechartTooltip formatter={(value) => formatNumber(value as any)} />
            <Area
              type="natural"
              dataKey="value"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </GridItem>
    </Flex>
  );
};
