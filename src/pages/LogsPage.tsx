import React, { FC, useMemo, useState } from "react";
import {
  Button,
  Flex,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  useBreakpointValue,
  useDisclosure,
  VStack,
  Tooltip,
} from "@chakra-ui/react";
import { LogFilterForm } from "../components/LogFilterForm";
import { LogList } from "../components/LogList";
import { Period } from "../types/Permission";
import { useAppSelector } from "../reducers/types";
import { isBetween } from "../helpers";
import { format } from "date-fns";
import { CalendarMonth } from "../components/Calendar/CalendarMonth";
import { LogStats } from "../components/LogStats";

export const LogsPage: FC = () => {
  const currentDate = useMemo(() => {
    const date = new Date();
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
    };
  }, []);
  const { auth } = useAppSelector(({ auth }) => ({ auth }));
  const [month, setMonth] = useState<number>(currentDate.month);
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });
  const [logFilter, setLogFilter] = useState<Period>();
  const { logs } = useAppSelector(({ logs }) => ({ logs }));
  const logsTorender = useMemo(() => {
    if (!logFilter) return logs?.logs || [];
    return (logs?.logs || []).filter((log, i) =>
      isBetween(
        new Date(log.dateString),
        new Date(logFilter.startDate),
        new Date(logFilter.endDate),
        "[]",
      ),
    );
  }, [logFilter, logs]);
  const {
    onOpen: onOpenStatsModal,
    onClose: onCloseStatsModal,
    isOpen: isStatsModalOpen,
  } = useDisclosure();

  const previousMonth = () => {
    const newmonth = month - 1 < 0 ? 0 : month - 1;
    setMonth(newmonth);
  };
  const nextMonth = () => {
    const newMonth = month + 1 > 11 ? 11 : month + 1;
    setMonth(newMonth);
  };
  return (
    <Flex width="100%" direction="row" px={5} flex="1 1" height="100%">
      <Flex
        direction="column"
        flex={isMobile ? "1 1" : "5 1"}
        overflowY="auto"
        px={2}
      >
        <Heading my={2}>Logs</Heading>
        <SimpleGrid columns={[1, 1, 2]} spacing={isMobile ? 0 : 2} mt={5}>
          <LogFilterForm onFilter={setLogFilter} />
        </SimpleGrid>
        {logFilter ? (
          <HStack my={5} alignItems="center" spacing={5}>
            <Text>{`Showing logs from ${format(
              new Date(logFilter.startDate),
              "do LLL Y",
            )} to ${format(new Date(logFilter.endDate), "do LLL Y")}`}</Text>
            <Button size="xs" onClick={() => setLogFilter(undefined)}>
              Clear
            </Button>
          </HStack>
        ) : null}
        <LogList logList={logsTorender} />
      </Flex>
      {isMobile ? null : (
        <Flex direction="column" flex={2} px={5} pt={5}>
          <CalendarMonth
            nextMonth={nextMonth}
            previousMonth={previousMonth}
            year={currentDate.year}
            month={month}
          />
          <LogStats month={month} currentYear={currentDate.year} />
        </Flex>
      )}
      {isMobile ? (
        <Modal isOpen={isStatsModalOpen} onClose={onCloseStatsModal}>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>📊 Log Stats</ModalHeader>
            <ModalBody>
              <CalendarMonth
                nextMonth={nextMonth}
                previousMonth={previousMonth}
                year={currentDate.year}
                month={month}
              />
              <LogStats month={month} currentYear={currentDate.year} />
            </ModalBody>
          </ModalContent>
        </Modal>
      ) : null}
    </Flex>
  );
};
