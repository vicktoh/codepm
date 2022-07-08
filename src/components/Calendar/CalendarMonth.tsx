import {
  Flex,
  Heading,
  Icon,
  IconButton,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { format, getDay, getDaysInMonth } from "date-fns";
import React, { FC } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { CALENDAR_HEADER } from "../../constants";
import { CalendarCell, CalendarRow } from "./calendarParts";
type CalendarMonthProps = {
  year: number;
  month: number;
  nextMonth: () => void;
  previousMonth: () => void;
};
export const CalendarMonth: FC<CalendarMonthProps> = ({
  year,
  month,
  nextMonth,
  previousMonth,
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
            />,
          );
        } else {
          week.push(
            <CalendarCell
              day={iterDate}
              year={year}
              month={month}
              key={`week-${row}-${column}`}
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
    </Flex>
  );
};
