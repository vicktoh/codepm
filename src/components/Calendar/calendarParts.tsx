import { Td, Tr } from "@chakra-ui/react";
import { format, isFuture, isWeekend } from "date-fns";
import React, { FC, useMemo } from "react";
import {
  FILL_DAY_COLOR,
  LEAVE_DAY_COLOR,
  MISSED_DAY_COLOR,
  PUBLIC_HOLIDAY_COLOR,
} from "../../constants";
import { useAppSelector } from "../../reducers/types";

type CalenderCellProps = {
  day?: number;
  year: number;
  month: number;
};
export const CalendarCell: FC<CalenderCellProps> = ({ day, year, month }) => {
  const { logs, system, permission } = useAppSelector(
    ({ logs, system, permission }) => ({
      system,
      logs,
      permission,
    }),
  );
  const bg = useMemo(() => {
    if (!logs?.logMap || !day) return "transparent";
    const dateObj = new Date(year, month, day);
    const dayString = format(dateObj, "y-MM-dd");
    if (logs.logMap[dayString]) return FILL_DAY_COLOR;
    if ((system?.publicHolidays || []).includes(dayString))
      return PUBLIC_HOLIDAY_COLOR;
    if (
      (permission?.leaveDays || []).map(({ date }) => date).includes(dayString)
    ) {
      return LEAVE_DAY_COLOR;
    }
    if (isWeekend(dateObj) || isFuture(dateObj)) return "transparent";
    return MISSED_DAY_COLOR;
  }, [system, logs, permission, day, month, year]);
  return <Td bg={bg}>{day || ""}</Td>;
};

// type CalendarRowProps = {};

export const CalendarRow: FC = ({ children }) => {
  return <Tr>{children}</Tr>;
};
