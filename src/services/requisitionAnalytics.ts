import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  sub,
} from "date-fns";
import { COLOR_SPECTRUM_TAGS } from "../constants";
import { Requisition } from "../types/Requisition";
type CategoryData = {
  count: number;
  value: number;
  id: string;
};
export const requisitionCategories = (requisitions: Requisition[]) => {
  const userCategories: Record<string, CategoryData> = {};
  const projectCategories: Record<string, CategoryData> = {};
  requisitions.forEach((requisition) => {
    if (userCategories[requisition.creatorId]) {
      userCategories[requisition.creatorId].count += 1;
      userCategories[requisition.creatorId].value += requisition.total;
    } else {
      userCategories[requisition.creatorId] = {
        count: 1,
        value: requisition.total,
        id: requisition.creatorId,
      };
    }
    if (projectCategories[requisition.projectId]) {
      projectCategories[requisition.projectId].count += 1;
      projectCategories[requisition.projectId].value += requisition.total;
    } else {
      projectCategories[requisition.projectId] = {
        count: 1,
        value: requisition.total,
        id: requisition.projectId,
      };
    }
  });
  return {
    userCategories,
    projectCategories,
  };
};
export enum TimeFilter {
  "This Week",
  "This Month",
  "Last 3 Month",
  "Last 6 Months",
  "This year",
}

const filterRequisitionCategory = (
  date: Date,
  requisitions: Requisition[],
  filter: TimeFilter,
) => {
  let totalCount = 0;
  let totalValue = 0;
  requisitions.forEach((req, i) => {
    const shouldAdd = [
      TimeFilter["This Week"],
      TimeFilter["This Month"],
    ].includes(filter)
      ? isSameDay(date, req.timestamp)
      : isSameMonth(date, req.timestamp);
    totalCount += shouldAdd ? 1 : 0;
    totalValue += shouldAdd ? req.total : 0;
  });
  return {
    totalCount,
    totalValue,
  };
};
export const timeSeries = (requisitions: Requisition[], filter: TimeFilter) => {
  const dates = filterToDates(filter);
  const counts: number[] = [];
  const values: number[] = [];
  const labels: string[] = [];
  if (!dates) return;
  dates.forEach((d) => {
    labels.push(format(d, "MMM yyy"));
    const metrics = filterRequisitionCategory(d, requisitions, filter);
    counts.push(metrics.totalCount);
    values.push(metrics.totalValue);
  });
  return {
    datasets: [
      {
        label: "Project Count",
        data: counts,
        borderColor: "rgb(53, 162, 235)",
      },
      {
        label: "Project Value",
        borderColor: COLOR_SPECTRUM_TAGS[0],
        data: values,
      },
    ],
    labels: labels,
  };
};

export const filterToDates = (timeFilter: TimeFilter) => {
  let start: Date;
  let end: Date;
  switch (timeFilter) {
    case TimeFilter["This Week"]:
      start = startOfWeek(new Date());
      end = endOfWeek(new Date());
      return eachDayOfInterval({ start, end });
    case TimeFilter["This Month"]:
      start = startOfMonth(new Date());
      end = startOfMonth(new Date());
      return eachDayOfInterval({ start, end });
    case TimeFilter["Last 3 Month"]:
      end = new Date();
      start = sub(end, { months: 3 });
      return eachWeekOfInterval({ start, end });
    case TimeFilter["Last 6 Months"]:
      end = new Date();
      start = sub(end, { months: 6 });
      return eachMonthOfInterval({ start, end });
    default:
      break;
  }
};
