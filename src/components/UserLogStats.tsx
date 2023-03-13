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
import { isWeekend } from "date-fns";
type UserLogStatsProps = {
  userId: string;
};
export const UserLogStats: FC<UserLogStatsProps> = ({ userId }) => {
  const { system, permission } = useAppSelector(({ system, permission }) => ({
    system,
    permission,
  }));
  const [logs, setLogs] = useState<Log[]>();
  const loggedDays =
    (logs?.length &&
      logs.filter((log) => !isWeekend(new Date(log.dateString))).length) ||
    0;
  const businessDays = system
    ? differenceInBusinessDays(new Date(), new Date(system?.logStartDate))
    : 0;
  const leaveDays = permission?.leaveDays?.length || 0;
  const publicHolidays = system?.publicHolidays
    ? system.publicHolidays.filter((date) =>
        isBetween(new Date(date), new Date(system.logStartDate), new Date()),
      ).length
    : 0;
  const missedDays = Math.max(
    businessDays - leaveDays - publicHolidays - loggedDays,
  );
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
            <Heading fontSize="2xl">{logs?.length || 0}</Heading>
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
