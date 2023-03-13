import {
  Avatar,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { add, format, sub } from "date-fns";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getVehicleRequestForDate } from "../services/vehicleServices";
import { VehicleRequest } from "../types/VehicleRequest";
import FullCalendar from "@fullcalendar/react";
import timegrid from "@fullcalendar/timegrid";
import interaction from "@fullcalendar/interaction";
import { EventContentArg } from "@fullcalendar/core";
import { useAppSelector } from "../reducers/types";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

type CaledarEvenObj = {
  title: string;
  start: Date;
  end: Date;
};
export const VehicleSchedule = () => {
  const [date, setDate] = useState<string>(format(new Date(), "Y-LL-dd"));
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<VehicleRequest[]>();
  const toast = useToast();
  const calendarRef = useRef<FullCalendar>(null);
  const { users } = useAppSelector(({ users }) => ({ users }));
  const { usersMap = {} } = users || {};
  const events = useMemo(() => {
    if (!requests) return [];
    return requests.map((value) => ({
      title: value.purpose,
      start: new Date(value.startTime),
      end: new Date(value.endTime),
      userId: value.userId,
      destination: value.destination,
      date: new Date(value.datetimestamp),
    }));
  }, [requests]);
  const onChangeDate = (value: string) => {
    setDate(value);
    calendarRef.current?.getApi().gotoDate(new Date(value));
  };

  const goForwardDate = () => {
    const newdate = add(new Date(date), { days: 1 });
    setDate(format(newdate, `Y-LL-dd`));
    calendarRef.current?.getApi().gotoDate(newdate);
  };
  const goBackwardDate = () => {
    const newdate = sub(new Date(date), { days: 1 });
    setDate(format(newdate, "Y-LL-dd"));
    calendarRef.current?.getApi().gotoDate(newdate);
  };

  const renderEvent = (option: EventContentArg) => {
    return (
      <Flex direction="row" bg="white" pt={1} height="100%" alignItems="center">
        <Avatar
          size="xs"
          src={
            usersMap[option.event.extendedProps?.userId || ""]?.photoUrl || ""
          }
          name={
            usersMap[option.event.extendedProps?.userId || ""]?.displayName ||
            ""
          }
        />
        <VStack ml={2} alignItems="flex-start" spacing={0}>
          <Text fontSize="xs">{option.timeText}</Text>
          <Text isTruncated fontSize="sm" fontWeight="bold">
            {option.event.title}
          </Text>
        </VStack>
      </Flex>
    );
  };
  useEffect(() => {
    const fetchRequestForDate = async () => {
      try {
        setLoading(true);
        const reqs = await getVehicleRequestForDate(date);
        setRequests(reqs);
      } catch (error) {
        console.log(error);
        toast({ title: "could not fetch request schedule", status: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchRequestForDate();
  }, [date, toast]);
  return (
    <Flex width="100%" px={2} py={4} direction="column">
      <Text fontSize="sm">
        Check vehicle schedule for a particular date, select a date to view
        schedule
      </Text>
      <Flex direction="column">
        <Input
          variant="filled"
          fontSize="sm"
          my={2}
          type="date"
          value={date}
          onChange={(e) => onChangeDate(e.target.value)}
        />
      </Flex>
      {loading && !requests ? (
        <Flex
          direction="column"
          height="152px"
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize="sm">Loading</Text>
          <Spinner />
        </Flex>
      ) : null}

      <Flex alignItems="center" justifyContent="center">
        <IconButton
          aria-label="left"
          icon={<BiChevronLeft />}
          colorScheme="brand"
          onClick={goBackwardDate}
        />
        <Heading fontSize="lg" my={4} textAlign="center" mx={4}>
          {format(new Date(date), "EEEE do MMM Y")}
        </Heading>
        <IconButton
          colorScheme="brand"
          aria-label="left"
          icon={<BiChevronRight />}
          onClick={goForwardDate}
        />
      </Flex>
      {requests ? (
        <FullCalendar
          ref={calendarRef}
          plugins={[timegrid, interaction]}
          initialView="timeGridDay"
          events={events}
          eventContent={renderEvent}
          headerToolbar={false}
          eventBackgroundColor="white"
        />
      ) : null}
    </Flex>
  );
};
