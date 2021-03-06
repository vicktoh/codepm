import {
  intervalToDuration,
  isAfter,
  isBefore,
  isEqual,
  isPast,
} from "date-fns";
import { Conversation } from "../types/Conversation";
import { Permission } from "../types/Permission";
import { RequisitionCurrency, RequisitionItem } from "../types/Requisition";
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
  if (adherence <= 20) return "????";
  if (adherence <= 40) return "????";
  if (adherence <= 60) return "????";
  if (adherence <= 80) return "????";
  return "????";
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
export const currencyWord: Record<RequisitionCurrency, string> = {
  NGN: "naira",
  USD: "dollars",
  GBP: "pounds",
  EUR: "euros",
};
export const currencySubWord: Record<RequisitionCurrency, string> = {
  NGN: "kobo",
  USD: "cents",
  GBP: "pence",
  EUR: "cents",
};
export const numToWords = (s: any) => {
  const th = ["", "thousand", "million", "billion", "trillion"];
  const dg = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const tn = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tw = [
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  s = (s || "").toString();
  s = s.replace(/[, ]/g, "");
  // if (s !== parseFloat(s)) return "not a number";
  let x: number = s.indexOf(".");
  if (x === -1) x = s.length;
  if (x > 15) return "too big";
  const n = s.split("");
  let str = "";
  let sk = 0;
  for (let i = 0; i < x; i++) {
    if ((x - i) % 3 === 2) {
      if (n[i] === "1") {
        str += tn[Number(n[i + 1])] + " ";
        i++;
        sk = 1;
      } else if (n[i] !== "0") {
        str += tw[n[i] - 2] + " ";
        sk = 1;
      }
    } else if (n[i] !== "0") {
      str += dg[n[i]] + " ";
      if ((x - i) % 3 === 0) str += "hundred ";
      sk = 1;
    }
    if ((x - i) % 3 === 1) {
      if (sk) str += th[(x - i - 1) / 3] + " ";
      sk = 0;
    }
  }
  if (x !== s.length) {
    const y = s.length;
    str += "point ";
    for (let i = x + 1; i < y; i++) str += dg[n[i]] + " ";
  }
  return str.replace(/\s+/g, " ");
};

export const converNumtoWord = (number: any, currency: RequisitionCurrency) => {
  const num = "" + parseFloat(number);
  const bits = num.split(".");
  const firspart = "" + numToWords(parseInt(bits[0])) + currencyWord[currency];
  const seconpart =
    bits[1] || ""
      ? ", " + numToWords(parseInt(bits[1])) + currencySubWord[currency]
      : "";

  return firspart + seconpart;
};
export const requisitonTotal = (items: RequisitionItem[]) => {
  let tots = 0;
  items.forEach((item) => {
    tots += item.amount;
  });
  return tots;
};
