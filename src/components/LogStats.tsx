import React, { FC, useMemo, useState } from "react";
import {
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Select,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
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
import { isAfter, isSameMonth, lastDayOfMonth } from "date-fns";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
type LogStatsProps = {
  month: number;
  currentYear: number;
};
export const LogStats: FC<LogStatsProps> = ({ month, currentYear }) => {
  const { logs, system, permission } = useAppSelector(
    ({ logs, system, permission }) => ({ logs, system, permission }),
  );
  const [logFilter, setLogFilter] = useState<"all" | "month">("all");
  const glassEffect = useGlassEffect(true);
  const currentDate = useMemo(
    () => new Date(currentYear, month, 1),
    [month, currentYear],
  );
  const loggedDays = useMemo(() => {
    if (!logs?.logs?.length) return 0;
    return logFilter === "month"
      ? logs.logs.filter(({ dateString }) => {
          const sameMonth = isSameMonth(new Date(dateString), currentDate);
          return sameMonth;
        }).length
      : logs.logs.length;
  }, [logs, logFilter, currentDate]);
  const businessDays = useMemo(() => {
    let dateLeft: Date;
    let dateRight: Date;
    if (logFilter === "all") {
      console.log("hello");
      console.log(system?.logStartDate);
      dateLeft = system?.logStartDate
        ? new Date(system.logStartDate)
        : currentDate;
      dateRight = new Date();
    } else {
      dateLeft = currentDate;
      dateRight = isSameMonth(currentDate, new Date())
        ? new Date()
        : lastDayOfMonth(currentDate);
    }

    return differenceInBusinessDays(dateRight, dateLeft);
  }, [currentDate, logFilter, system?.logStartDate]);
  const leaveDays =
    logFilter === "all"
      ? (permission?.leaveDays?.length &&
          permission.leaveDays.filter(({ date }) =>
            isAfter(new Date(date), new Date(system?.logStartDate || 0)),
          ).length) ||
        0
      : permission?.leaveDays?.filter((date) =>
          isSameMonth(new Date(date.date), currentDate),
        ).length || 0;
  const publicHolidays = system?.publicHolidays
    ? system.publicHolidays.filter((date) =>
        isBetween(
          new Date(date),
          new Date(
            logFilter === "all"
              ? system.logStartDate
              : `${currentYear}-${month}-01`,
          ),
          new Date(),
        ),
      ).length
    : 0;
  const missedDays = businessDays - leaveDays - publicHolidays - loggedDays;
  const adherence = missedDays === 0 ? 100 : (loggedDays / missedDays) * 100;
  const adColor = useMemo(() => adherenceColor(adherence), [adherence]);
  const adEmoji = useMemo(() => adherenceEmoji(adherence), [adherence]);
  const adWord = useMemo(() => adherenceWord(adherence), [adherence]);
  return (
    <Flex direction="column" mt={5}>
      <Flex direction="row" justifyContent="space-between" mb={5}>
        <Heading fontSize="lg" my={5}>
          Log Stats
        </Heading>
        <FormControl width="max-content">
          <FormLabel>Filter By</FormLabel>
          <Select
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value as "month" | "all")}
            {...glassEffect}
            size="sm"
          >
            <option value="all">all</option>
            <option value="month">Month</option>
          </Select>
        </FormControl>
      </Flex>
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
            <Heading fontSize="2xl">{loggedDays || 0}</Heading>
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
