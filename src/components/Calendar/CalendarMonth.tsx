import {
  Box,
  Flex,
  Heading,
  Icon,
  IconButton,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { format, getDay, getDaysInMonth } from "date-fns";
import React, { FC } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { string } from "yup";
import {
  CALENDAR_HEADER,
  FILL_DAY_COLOR,
  LEAVE_DAY_COLOR,
  MISSED_DAY_COLOR,
  PUBLIC_HOLIDAY_COLOR,
} from "../../constants";
import { Log } from "../../types/Log";
import { CalendarCell, CalendarRow } from "./calendarParts";
type CalendarMonthProps = {
  year: number;
  month: number;
  nextMonth: () => void;
  previousMonth: () => void;
  onClick?: (date: Date) => void;
  userLogs?: Record<string, Log>;
};
const TABLE_KEY_COLORS = [
  {
    label: "Day logged",
    color: FILL_DAY_COLOR,
  },
  {
    label: "Missed day",
    color: MISSED_DAY_COLOR,
  },
  {
    label: "Leave day",
    color: LEAVE_DAY_COLOR,
  },
  {
    label: "Public holiday",
    color: PUBLIC_HOLIDAY_COLOR,
  },
];
export const CalendarMonth: FC<CalendarMonthProps> = ({
  year,
  month,
  nextMonth,
  previousMonth,
  onClick,
  userLogs,
}) => {
  const dateObj = new Date(year, month);
  const date = format(dateObj, "MMM Y");

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(dateObj);
    const firstDayOfMonth = getDay(new Date(year, month, 1));
    let iterDate = 1;
    const weeks = [];
    for (let row = 0; row < 6; row++) {
      const week = [];
      for (let column = 0; column < 7; column++) {
        if (iterDate > daysInMonth) break;
        if (row === 0 && column < firstDayOfMonth) {
          week.push(
            <CalendarCell
              year={year}
              month={year}
              key={`week-${row}-${column}`}
              onClick={onClick}
              userLogs={userLogs}
            />,
          );
        } else {
          week.push(
            <CalendarCell
              day={iterDate}
              year={year}
              month={month}
              key={`week-${row}-${column}`}
              onClick={onClick}
              userLogs={userLogs}
            />,
          );
          iterDate++;
        }
      }
      while (week.length < 7) {
        week.push(
          <CalendarCell
            year={year}
            month={month}
            key={`week-${row}-${week.length}`}
            onClick={onClick}
            userLogs={userLogs}
          />,
        );
      }
      weeks.push(<CalendarRow key={`week-row-${row}`}>{week}</CalendarRow>);
    }

    return weeks;
  };
  return (
    <Flex direction="column" px={2} alignItems="center">
      <Flex width="100%" alignItems="center" justifyContent="space-between">
        <IconButton
          disabled={month < 1}
          onClick={previousMonth}
          aria-label="previous month"
          variant="outline"
          icon={<Icon as={BsChevronLeft} />}
        />
        <Heading fontSize="md" my={3}>
          {date}
        </Heading>
        <IconButton
          onClick={nextMonth}
          disabled={month > 10}
          aria-label="next month"
          variant="outline"
          icon={<Icon as={BsChevronRight} />}
        />
      </Flex>
      <Table size="sm">
        <Thead>
          <Tr>
            {CALENDAR_HEADER.map((head, i) => (
              <Th key={`header-${i}`}>{head}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>{renderDays()}</Tbody>
      </Table>
      <Flex
        direction="row"
        my={3}
        alignItems="center"
        bg="white"
        borderRadius={5}
        py={2}
      >
        {TABLE_KEY_COLORS.map(({ label, color }) => (
          <Flex key={color} direction="column" alignItems="center" mx={2}>
            <Box boxSize={5} bg={color} />
            <Text fontSize="xx-small" whiteSpace="nowrap">
              {label}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};
