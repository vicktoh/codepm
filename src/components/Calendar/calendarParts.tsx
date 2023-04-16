import { Td, Tr } from "@chakra-ui/react";
import { format, isAfter, isFuture, isSameDay, isWeekend } from "date-fns";
import React, { FC, useMemo } from "react";
import {
  FILL_DAY_COLOR,
  LEAVE_DAY_COLOR,
  MISSED_DAY_COLOR,
  PUBLIC_HOLIDAY_COLOR,
} from "../../constants";
import { useAppSelector } from "../../reducers/types";
import { Log } from "../../types/Log";
import { Permission } from "../../types/Permission";

type CalenderCellProps = {
  day?: number;
  year: number;
  month: number;
  onClick?: (date: Date) => void;
  userLogs?: Record<string, Log>;
  permission?: Permission | null;
  userDateRegistered?: string;
};
export const CalendarCell: FC<CalenderCellProps> = ({
  day,
  year,
  month,
  onClick,
  userLogs,
  permission: userPermission,
  userDateRegistered,
}) => {
  const { logs, system, permission, auth } = useAppSelector(
    ({ logs, system, permission, auth }) => ({
      system,
      logs,
      permission,
      auth,
    }),
  );
  const startCountingDate = useMemo(() => {
    if (!auth || !system?.logStartDate) return new Date();
    const dateRegistered = new Date(userDateRegistered || auth.dateRegistered);
    const logStartDate = new Date(system.logStartDate);
    return isAfter(dateRegistered, logStartDate)
      ? dateRegistered
      : logStartDate;
  }, [auth, system?.logStartDate, userDateRegistered]);
  const publicHols = useMemo(
    () => system?.publicHolidays?.map(({ date }) => date) || [],
    [system?.publicHolidays],
  );
  const bg = useMemo(() => {
    if ((!userLogs && !logs?.logMap) || !day) return "transparent";
    const dateObj = new Date(year, month, day);
    const dayString = format(dateObj, "y-MM-dd");
    if (
      !isAfter(dateObj, startCountingDate) &&
      !isSameDay(dateObj, startCountingDate)
    )
      return "transparent";

    if (
      ((userPermission || permission)?.leaveDays || [])
        .map(({ date }) => date)
        .includes(dayString)
    ) {
      return LEAVE_DAY_COLOR;
    }
    if ((userLogs || logs?.logMap || {})[dayString]) return FILL_DAY_COLOR;
    if (publicHols.includes(dayString)) return PUBLIC_HOLIDAY_COLOR;
    if (isWeekend(dateObj) || isFuture(dateObj)) return "transparent";
    return MISSED_DAY_COLOR;
  }, [
    publicHols,
    startCountingDate,
    logs,
    permission,
    day,
    month,
    year,
    userLogs,
    userPermission,
  ]);
  const onClickCell = () => {
    const date = new Date(year, month, day);
    console.log("i am being clicked");
    if (onClick) onClick(date);
  };
  return (
    <Td onClick={onClickCell} bg={bg} cursor={onClick ? "pointer" : "auto"}>
      {day || ""}
    </Td>
  );
};

// type CalendarRowProps = {};

export const CalendarRow: FC = ({ children }) => {
  return <Tr>{children}</Tr>;
};
