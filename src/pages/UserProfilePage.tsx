import {
  Avatar,
  Box,
  Flex,
  Heading,
  Icon,
  IconButton,
  SimpleGrid,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { FirebaseError } from "firebase/app";
import React, { useEffect, useMemo, useState } from "react";
import { BiLeftArrow } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarMonth } from "../components/Calendar/CalendarMonth";
import { LeaveTable } from "../components/LeaveTable";
import { LoadingComponent } from "../components/LoadingComponent";
import { UserLogStats } from "../components/UserLogStats";
import { UserTaskStats } from "../components/UserTaskStats";
import {
  fetchLogOfParticularDay,
  fetchUserLogs,
} from "../services/logsServices";
import { getPermissions } from "../services/permissionServices";
import { fetchProfile } from "../services/profileServices";
import { Log } from "../types/Log";
import { Permission } from "../types/Permission";
import { Profile } from "../types/Profile";

export const UserProfilePage = () => {
  const params = useParams();
  const [loadingUser, setLoadingUser] = useState<boolean>();
  const [permission, setPermission] = useState<Permission | null>();
  const [loadingPermission, setLoadingPermission] = useState<boolean>(false);
  const [profile, setProfile] = useState<Profile>();
  const [fetchingLog, setFetchingLog] = useState<boolean>();
  const [userLogs, setUserLogs] = useState<Record<string, Log>>();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [log, setLog] = useState<Log>();
  const toast = useToast();
  const currentDate = useMemo(() => {
    const date = new Date();
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
    };
  }, []);
  const [month, setMonth] = useState<number>(currentDate.month);
  // get user profile
  useEffect(() => {
    const getUserProfile = async () => {
      if (!params.userId) return;
      try {
        setLoadingUser(true);
        const prfl = await fetchProfile(params.userId);
        setProfile(prfl);
      } catch (error) {
      } finally {
        setLoadingUser(false);
      }
    };
    getUserProfile();
  }, [params.userId]);

  // get user logs
  useEffect(() => {
    const getLogs = async () => {
      try {
        if (!params.userId) return;
        setFetchingLog(true);
        const logs = await fetchUserLogs(params.userId);
        setUserLogs(logs);
      } catch (error) {
        console.log({ error });
      } finally {
        setFetchingLog(false);
      }
    };
    getLogs();
  }, [params.userId]);

  // get user permissions
  useEffect(() => {
    const fetchUserPermission = async () => {
      if (!params.userId) return;
      try {
        setLoadingPermission(true);
        const permission = await getPermissions(params.userId);
        setPermission(permission);
      } catch (error) {
        const err = error as FirebaseError;
        console.log(error);
        toast({
          title: "Could not fetch LeaveDays for this user",
          status: "error",
          description: err.message,
        });
      } finally {
        setLoadingPermission(false);
      }
    };
    fetchUserPermission();
  }, [params.userId, toast]);

  const previousMonth = () => {
    const newmonth = month - 1 < 0 ? 0 : month - 1;
    setMonth(newmonth);
  };
  const nextMonth = () => {
    const newMonth = month + 1 > 11 ? 11 : month + 1;
    setMonth(newMonth);
  };
  const onClickCalenderCell = async (date: Date) => {
    if (!params.userId || !userLogs) return;
    setSelectedDate(date);
    const dateString = format(date, "y-MM-dd");
    const log = userLogs[dateString] || {};
    setLog(log);
  };
  return (
    <Flex direction="column" flex="1 1" height="100%">
      <IconButton
        alignSelf="flex-start"
        size="md"
        my={5}
        icon={<Icon as={BiLeftArrow} />}
        aria-label="goBack"
        onClick={() => window.history.back()}
      />
      <SimpleGrid gridGap={5} columns={[1, 2]} flex="1 1">
        {loadingUser ? (
          <LoadingComponent title="Fetching Profile" />
        ) : (
          <Flex direction="column" px={3}>
            <Heading fontSize="lg">
              {profile?.displayName || "Uknown User"}
            </Heading>
            <Flex
              px={5}
              mt={5}
              bg="white"
              borderRadius="lg"
              direction="column"
              alignItems="flex-start"
              pb={5}
            >
              <VStack spacing={2} mt={5} mb={5}>
                <Box position="relative">
                  <Avatar
                    name={profile?.displayName}
                    src={profile?.photoUrl || profile?.photoUrl || ""}
                    size="xl"
                  />
                </Box>
                <Heading fontSize="md">
                  {profile?.displayName || "Unknow User name"}
                </Heading>
              </VStack>
              <SimpleGrid columns={3} mt={5} gridGap={8}>
                <Box mb={3}>
                  <Text>Designation</Text>
                  <Heading fontSize="md">
                    {profile?.designation || "None"}
                  </Heading>
                </Box>
                <Box mb={3}>
                  <Text>Date of Birth</Text>
                  <Heading fontSize="md">
                    {profile?.dateOfBirth || "None"}
                  </Heading>
                </Box>
                <Box mb={3}>
                  <Text>Role</Text>
                  <Heading fontSize="md">{profile?.role || "User"}</Heading>
                </Box>
              </SimpleGrid>
              <SimpleGrid columns={2} mt={5} gridGap={8}>
                <Box mb={3}>
                  <Text>Phone Number</Text>
                  <Heading fontSize="md">
                    {profile?.phoneNumber || "None"}
                  </Heading>
                </Box>
                <Box mb={3}>
                  <Text>Email</Text>
                  <Heading fontSize="md">{profile?.email || "None"}</Heading>
                </Box>
                <Box mb={3}>
                  <Text>Departments</Text>
                  <Heading fontSize="md">
                    {profile?.department || "None"}
                  </Heading>
                </Box>
                <Box mb={3}>
                  <Text>Date Joined</Text>
                  <Heading fontSize="md">
                    {profile?.dateRegistered || "None"}
                  </Heading>
                </Box>
              </SimpleGrid>
            </Flex>
          </Flex>
        )}

        <UserLogStats
          userDateRegistered={profile?.dateRegistered}
          permission={permission}
          userId={params?.userId || ""}
        />
      </SimpleGrid>
      <SimpleGrid mt={5} gridGap={5} columns={[1, 2]} flex="1 1">
        <LeaveTable
          loading={loadingPermission}
          permission={permission}
          userId={params?.userId || ""}
        />
        <UserTaskStats userId={params?.userId || ""} />
      </SimpleGrid>
      <SimpleGrid mt={5} gridGap={3} columns={[1, 2]} flex="1 1">
        <Flex
          bg="white"
          direction="column"
          borderRadius="lg"
          py={5}
          px={3}
          alignItems="center"
        >
          <Heading fontSize="lg" mt={4}>
            📝User Logs
          </Heading>
          <CalendarMonth
            nextMonth={nextMonth}
            previousMonth={previousMonth}
            year={currentDate.year}
            month={month}
            onClick={onClickCalenderCell}
            userLogs={userLogs}
            permission={permission}
            userDateRegistered={profile?.dateRegistered}
          />
        </Flex>
        <Flex direction="column" px={5} bg="white" borderRadius="lg" py={5}>
          <Heading alignSelf="center" fontSize="lg" mb={1}>
            Daily Log
          </Heading>
          {selectedDate ? (
            <Text
              as="span"
              color="brand.300"
              fontSize="md"
              fontWeight="medium"
              mb={3}
              alignSelf="center"
            >
              <Text
                as="span"
                fontWeight="bold"
              >{`${profile?.displayName}  `}</Text>
              {` activities on ${format(selectedDate, "do LLL Y")}`}
            </Text>
          ) : null}
          {fetchingLog ? (
            <Text>Please wait....</Text>
          ) : log?.activity?.length ? (
            log.activity.map((activity, i) => (
              <Text key={`${params.userId}-activity-${i}`}>{`${
                i + 1
              }. ${activity}`}</Text>
            ))
          ) : (
            <Flex
              bg="white"
              direction="column"
              borderRadius="lg"
              py={5}
              px={3}
              alignItems="center"
              flex="1 1"
              width="100%"
              justifyContent="center"
            >
              <VStack>
                <Heading>📝</Heading>
                <Heading fontSize="md">No Log filled for this day</Heading>
              </VStack>
            </Flex>
          )}
        </Flex>
      </SimpleGrid>
    </Flex>
  );
};
