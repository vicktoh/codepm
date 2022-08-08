import React, { FC, useMemo, useState } from "react";
import {
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
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
} from "@chakra-ui/react";
import { BsCalendar, BsShield } from "react-icons/bs";
import { BiStats } from "react-icons/bi";
import { LogFilterForm } from "../components/LogFilterForm";
import { LogList } from "../components/LogList";
import { LogRequestForm } from "../components/LogRequestForm";
import { Period, Request } from "../types/Permission";
import { makeLeaveRequest, makeRequest } from "../services/logsServices";
import { useAppSelector } from "../reducers/types";
import { isBetween } from "../helpers";
import { format } from "date-fns";
import { CalendarMonth } from "../components/Calendar/CalendarMonth";
import { LogStats } from "../components/LogStats";
import { LeaveRequestForm } from "../components/LeaveRequestForm";

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
    onOpen: onOpenLeaveRequest,
    onClose: onCloseLeaveRequest,
    isOpen: isLeaveRequestOpen,
  } = useDisclosure();
  const {
    onOpen: onOpenAccessRequest,
    onClose: onCloseAccessRequest,
    isOpen: isAccessRequestOpen,
  } = useDisclosure();
  const {
    onOpen: onOpenStatsModal,
    onClose: onCloseStatsModal,
    isOpen: isStatsModalOpen,
  } = useDisclosure();

  const onRequestForLeave = async (
    values: Omit<Request, "status" | "type" | "userId" | "timestamp">,
  ) => {
    await makeLeaveRequest(auth?.uid || "", values, "leave");
    onCloseLeaveRequest();
  };
  const onAccessRequest = async (period: Period) => {
    await makeRequest(auth?.uid || "", period, "log");
    onCloseLeaveRequest();
  };
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
          <VStack alignItems="flex-start" spacing={2} pb={isMobile ? 5 : 0}>
            <Heading mb={5} fontSize="lg">
              Actions
            </Heading>
            <Button
              size={isMobile ? "sm" : "md"}
              onClick={onOpenLeaveRequest}
              variant="outline"
              leftIcon={<Icon as={BsCalendar} />}
            >
              Apply for leave
            </Button>
            <Button
              size={isMobile ? "sm" : "md"}
              onClick={onOpenAccessRequest}
              variant="outline"
              leftIcon={<Icon as={BsShield} />}
            >
              Request for Access
            </Button>
            {isMobile ? (
              <Button
                size={isMobile ? "sm" : "md"}
                variant="outline"
                leftIcon={<Icon as={BiStats} />}
                onClick={onOpenStatsModal}
              >
                Show Log Stats
              </Button>
            ) : null}
          </VStack>
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
          <LogStats />
        </Flex>
      )}
      <Modal isOpen={isLeaveRequestOpen} onClose={onCloseLeaveRequest}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>🏝 Leave Request</ModalHeader>
          <ModalBody>
            <LeaveRequestForm onSubmit={onRequestForLeave} />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isAccessRequestOpen} onClose={onCloseAccessRequest}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>🔓 Request Access to Past Logs</ModalHeader>
          <ModalBody>
            <LogRequestForm type="leave" onSubmit={onAccessRequest} />
          </ModalBody>
        </ModalContent>
      </Modal>
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
              <LogStats />
            </ModalBody>
          </ModalContent>
        </Modal>
      ) : null}
    </Flex>
  );
};
