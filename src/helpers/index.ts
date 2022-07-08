import {
  intervalToDuration,
  isAfter,
  isBefore,
  isEqual,
  isPast,
} from "date-fns";
import { Conversation } from "../types/Conversation";
import { Permission } from "../types/Permission";
import { User } from "../types/User";

export const conversationExist = (
  userId: string,
  conversations: Conversation[],
) => {
  let conversation = null;
  for (let i = 0; i < conversations.length; i++) {
    if (
      conversations[i].members.includes(userId) &&
      conversations[i].type === "private"
    ) {
      conversation = conversations[i];
      return conversation;
    }
  }
};

export const isInConversation = (
  search: string,
  members: string[],
  users: Record<string, User>,
  title?: string,
) => {
  let truthValue = false;
  if (title) {
    const i = title.toLowerCase().indexOf(search.toLowerCase());
    if (i > -1) return true;
    else return false;
  }
  members.forEach((memberid) => {
    const index = users[memberid].displayName
      .toLowerCase()
      .indexOf(search.toLowerCase());
    if (index > -1) {
      truthValue = truthValue || true;
    }
  });
  return truthValue;
};
export const isBetween = (
  date: Date | number,
  from: Date | number,
  to: Date | number,
  inclusivity = "()",
) => {
  if (!["()", "[]", "(]", "[)"].includes(inclusivity)) {
    throw new Error("Inclusivity parameter must be one of (), [], (], [)");
  }

  const isBeforeEqual = inclusivity[0] === "[";
  const isAfterEqual = inclusivity[1] === "]";

  return (
    (isBeforeEqual
      ? isEqual(from, date) || isBefore(from, date)
      : isBefore(from, date)) &&
    (isAfterEqual ? isEqual(to, date) || isAfter(to, date) : isAfter(to, date))
  );
};
export const canfillLogOnThisDay = (
  dateString: string,
  daysAllowance: number,
  logAllowance: Permission["logAllowance"] | null,
) => {
  const requestDate = new Date(dateString);
  const today = new Date();
  if (!isPast(requestDate)) {
    return true;
  }
  const interval = intervalToDuration({ start: requestDate, end: today });
  if ((interval.days || 0) <= daysAllowance) return true;
  const permitted = logAllowance
    ? !isPast(new Date(logAllowance.expires)) &&
      isBetween(
        requestDate,
        new Date(logAllowance.period.startDate),
        new Date(logAllowance.period.endDate),
        "[]",
      )
    : false;
  return permitted;
};

export const adherenceEmoji = (adherence: number) => {
  if (adherence <= 20) return "😢";
  if (adherence <= 40) return "😕";
  if (adherence <= 60) return "😐";
  if (adherence <= 80) return "🙂";
  return "😃";
};
export const adherenceWord = (adherence: number) => {
  if (adherence <= 20) return "very poor";
  if (adherence <= 40) return "poor";
  if (adherence <= 60) return "good";
  if (adherence <= 80) return "very good";
  return "Excellent";
};
export const adherenceColor = (adherence: number) => {
  if (adherence <= 20) return "red.500";
  if (adherence <= 40) return "orange.400";
  if (adherence <= 60) return "yellow.300";
  if (adherence <= 80) return "#8FC25E";
  return "green.500";
};
