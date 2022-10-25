import {
  intervalToDuration,
  isAfter,
  isBefore,
  isEqual,
  isPast,
} from "date-fns";
import { Conversation } from "../types/Conversation";
import { Permission } from "../types/Permission";
import { Task } from "../types/Project";
import { RequisitionCurrency, RequisitionItem } from "../types/Requisition";
import { User } from "../types/User";
import * as _ from "lodash";
import { WHITE_LIST } from "../constants";
import { UserRole } from "../types/Profile";
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

export const parseTasksToChartData = (tasks: Task[]) => {
  const categories = _.groupBy(tasks, "status");
  const data = [];
  const labels = [];
  for (const key in categories) {
    if (Object.prototype.hasOwnProperty.call(categories, key)) {
      data.push(categories[key].length);
      labels.push(key);
    }
  }
  return {
    labels,
    datasets: [
      {
        label: "Task break down",
        data,
        backgroundColor: [
          "rgba(196, 252, 239, 1)",
          "rgba(249, 248, 113, 1)",
          "rgba(255, 128, 102, 1)",
        ],
        borderColor: [
          "rgba(255, 255, 255, 1)",
          "rgba(255, 255, 255, 1)",
          "rgba(255, 255, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
};

export const isEmailAllowed = (email: string) => {
  return WHITE_LIST.some(
    (list) => !!email.match(`^[A-Za-z0-9._%+-]+@${list}$`),
  );
};
export const getRoleFromClaims = (claims: Record<string, any>) => {
  let userRole = UserRole.user;
  Object.values(UserRole).forEach((role) => {
    if (claims[role]) {
      userRole = role;
    }
  });
  return userRole;
};

export const validateBudgetItem = (data: []) => {
  for (let i = 1; i < data.length; i++) {
    const element = data[i];
    if (element["activity"] && element["description"] && element["amount"]) {
    } else {
      return {
        success: false,
        message: `Invalid data at row ${i} ${element["activity"]}, ${element["description"]}, ${element["amount"]}`,
      };
    }
  }
  return { success: true };
};

export const tobase64 = (url: string) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const img = document.createElement("img");
    const ctx = canvas.getContext("2d");
    console.log(url);
    img.setAttribute("src", url);
    img.crossOrigin = "anonymous";
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx && ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      resolve(dataUrl);
    };
    img.onerror = function (e) {
      console.log(e);
      reject(e?.toString() || "");
    };
  });
};

export const getBase64FromUrl = async (url: string) => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
  });
};
