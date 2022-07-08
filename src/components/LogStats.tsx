import React, { useMemo } from "react";
import {
  Flex,
  Heading,
  HStack,
  Icon,
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
export const LogStats = () => {
  const { logs, system, permission } = useAppSelector(
    ({ logs, system, permission }) => ({ logs, system, permission }),
  );
  const loggedDays = logs?.logs.length || 0;
  console.log("system start", system?.logStartDate);
  const businessDays = system
    ? differenceInBusinessDays(new Date(), new Date(system?.logStartDate))
    : 0;
  const leaveDays = permission?.leaveDays?.length || 0;
  const publicHolidays = system?.publicHolidays
    ? system.publicHolidays.filter((date) =>
        isBetween(new Date(date), new Date(system.logStartDate), new Date()),
      ).length
    : 0;
  const missedDays = businessDays - leaveDays - publicHolidays - loggedDays;
  const adherence = missedDays === 0 ? 100 : (loggedDays / missedDays) * 100;
  const adColor = useMemo(() => adherenceColor(adherence), [adherence]);
  const adEmoji = useMemo(() => adherenceEmoji(adherence), [adherence]);
  const adWord = useMemo(() => adherenceWord(adherence), [adherence]);
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
            <Heading fontSize="2xl">{logs?.logs.length || 0}</Heading>
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
