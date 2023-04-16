import {
  Flex,
  Heading,
  SimpleGrid,
  HStack,
  Icon,
  Text,
} from "@chakra-ui/react";
import React, { FC, useEffect, useMemo, useState } from "react";
import { differenceInBusinessDays } from "date-fns/esm";
import { BsCheckAll } from "react-icons/bs";
import { FaBusinessTime } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { GiPalmTree } from "react-icons/gi";
import {
  adherenceColor,
  adherenceEmoji,
  adherenceWord,
  isBetween,
} from "../helpers";
import { useAppSelector } from "../reducers/types";
import { Log } from "../types/Log";
import { fetchLogs } from "../services/logsServices";
import { isAfter, isBefore, isWeekend } from "date-fns";
import { Permission } from "../types/Permission";
type UserLogStatsProps = {
  userId: string;
  permission?: Permission | null;
  userDateRegistered?: string;
};
export const UserLogStats: FC<UserLogStatsProps> = ({
  userId,
  permission,
  userDateRegistered,
}) => {
  const { system, auth } = useAppSelector(({ system, auth }) => ({
    system,
    auth,
  }));
  const [logs, setLogs] = useState<Log[]>();
  const startCountingDate = useMemo(() => {
    if (!userDateRegistered || !system?.logStartDate) return new Date();
    const dateRegistered = new Date(userDateRegistered);
    const logStartDate = new Date(system.logStartDate);
    return isAfter(dateRegistered, logStartDate)
      ? dateRegistered
      : logStartDate;
  }, [userDateRegistered, system?.logStartDate]);
  const publicHols = useMemo(
    () => system?.publicHolidays?.map(({ date }) => date) || [],
    [system?.publicHolidays],
  );
  const loggedDays = useMemo(() => {
    return (
      (logs?.length &&
        logs.filter(
          (log) =>
            !isWeekend(new Date(log.dateString)) &&
            !publicHols.includes(log.dateString) &&
            !permission?.leaveDays
              ?.map(({ date }) => date)
              .includes(log.dateString) &&
            !isBefore(new Date(log.dateString), startCountingDate),
        ).length) ||
      0
    );
  }, [startCountingDate, publicHols, permission?.leaveDays, logs]);

  const leaveDays = useMemo(() => {
    return (
      (permission?.leaveDays?.length &&
        permission.leaveDays.filter(
          ({ date }) => !isBefore(new Date(date), startCountingDate),
        ).length) ||
      0
    );
  }, [startCountingDate, permission?.leaveDays]);
  const publicHolidays = system?.publicHolidays
    ? publicHols.filter((date) =>
        isBetween(new Date(date), new Date(startCountingDate), new Date()),
      ).length
    : 0;

  const businessDays = system
    ? differenceInBusinessDays(new Date(), new Date(startCountingDate)) -
      publicHolidays
    : 0;
  const missedDays = Math.max(businessDays - loggedDays - leaveDays, 0);
  const adherence = missedDays === 0 ? 100 : (loggedDays / businessDays) * 100;
  const adColor = useMemo(() => adherenceColor(adherence), [adherence]);
  const adEmoji = useMemo(() => adherenceEmoji(adherence), [adherence]);
  const adWord = useMemo(() => adherenceWord(adherence), [adherence]);
  useEffect(() => {
    const fetchUserLogs = async () => {
      if (userId && system?.logStartDate) {
        try {
          const logs = await fetchLogs(userId, system?.logStartDate);
          setLogs(logs);
        } catch (error) {
          console.log(error);
        } finally {
        }
      }
    };
    fetchUserLogs();
  }, [userId, system?.logStartDate]);
  return (
    <Flex direction="column" mt={5}>
      <Heading fontSize="lg" my={5}>
        Log Stats
      </Heading>
      <SimpleGrid rowGap={5} columns={2} columnGap={5}>
        <Flex
          direction="column"
          p={3}
          bg="white"
          borderRadius="md"
          alignItems="center"
          justifyContent="center"
        >
          <HStack>
            <Icon boxSize={8} color="green.300" as={BsCheckAll} />
            <Heading fontSize="2xl">{loggedDays}</Heading>
          </HStack>
          <Text>Days Logged</Text>
        </Flex>
        <Flex
          direction="column"
          p={3}
          bg="white"
          borderRadius="md"
          alignItems="center"
          justifyContent="center"
        >
          <HStack>
            <Icon boxSize={8} color="red.300" as={MdOutlineCancel} />
            <Heading fontSize="2xl">{missedDays}</Heading>
          </HStack>
          <Text>Missed Days</Text>
        </Flex>
        <Flex
          direction="column"
          p={3}
          bg="white"
          borderRadius="md"
          alignItems="center"
          justifyContent="center"
        >
          <HStack>
            <Icon boxSize={8} color="blue.300" as={FaBusinessTime} />
            <Heading fontSize="2xl">{businessDays}</Heading>
          </HStack>
          <Text>Bussiness Days</Text>
        </Flex>
        <Flex
          direction="column"
          p={3}
          bg="white"
          borderRadius="md"
          alignItems="center"
          justifyContent="center"
        >
          <HStack>
            <Icon boxSize={8} color="yellow.300" as={GiPalmTree} />
            <Heading fontSize="2xl">{leaveDays}</Heading>
          </HStack>
          <Text>Leave Days</Text>
        </Flex>
      </SimpleGrid>
      <Heading fontSize="lg" my={5}>
        Adherence
      </Heading>
      <SimpleGrid columns={2} columnGap={5}>
        <Flex
          direction="column"
          alignItems="center"
          bg="white"
          p={2}
          borderRadius="md"
        >
          <HStack>
            <Heading fontSize="2xl">{adEmoji}</Heading>
            <Heading
              fontSize="2xl"
              color={adColor}
            >{`${adherence.toFixed()}%`}</Heading>
          </HStack>
          <Text textAlign="center">{`${adWord} adherence`}</Text>
        </Flex>
      </SimpleGrid>
    </Flex>
  );
};
