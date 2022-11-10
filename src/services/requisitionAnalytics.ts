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
  startOfYear,
  sub,
} from "date-fns";
import { DataFilters } from "../pages/RequisitionAnalytics";
import { Requisition } from "../types/Requisition";
export type CategoryData = {
  count: number;
  value: number;
  id: string;
};
export const requisitionCategories = (requisitions: Requisition[]) => {
  const userCategories: Record<string, CategoryData> = {};
  const projectCategories: Record<string, CategoryData> = {};
  let totalCount = 0;
  let totalValue = 0;
  let totalUsersCount = 0;
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
      totalUsersCount += 1;
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
    totalCount += 1;
    totalValue += requisition.total;
  });
  return {
    userCategories,
    projectCategories,
    totalCount,
    totalValue,
    totalUsersCount,
  };
};
export enum TimeFilter {
  "This Week" = "This Week",
  "This Month" = "This Month",
  "Last 3 Month" = "Last 3 Months",
  "Last 6 Months" = "Last 6 Months",
  "This year" = "This year",
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
  const output: { date: string; count: number; value: number }[] = [];
  if (!dates) return;
  dates.forEach((d) => {
    const label = format(d, "MMM yyy");
    const metrics = filterRequisitionCategory(d, requisitions, filter);
    output.push({
      date: label,
      count: metrics.totalCount,
      value: metrics.totalValue,
    });
  });
  return output;
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
export const filterToInterval = (timeFilter: TimeFilter) => {
  let start: Date;
  let end: Date;
  switch (timeFilter) {
    case TimeFilter["This Week"]:
      start = startOfWeek(new Date());
      end = endOfWeek(new Date());
      return { start, end };
    case TimeFilter["This Month"]:
      start = startOfMonth(new Date());
      end = new Date();
      return { start, end };
    case TimeFilter["Last 3 Month"]:
      end = new Date();
      start = sub(end, { months: 3 });
      return { start, end };
    case TimeFilter["Last 6 Months"]:
      end = new Date();
      start = sub(end, { months: 6 });
      return { start, end };
    case TimeFilter["This year"]:
      end = new Date();
      start = startOfYear(end);
      return { start, end };
    default:
      break;
  }
};

export const timeFilterToAlgoliaFilter = (timeFilter: TimeFilter) => {
  const { start, end } = filterToInterval(timeFilter) || {};
  if (!start || !end) return "";
  return `timestamp:${start.getTime()} TO ${end.getTime()}`;
};

export const elementToAlgoliaFilter = (element: string, values: string[]) => {
  if (!values?.length) return [];
  const data = values.map((val) => `${element}:${val}`);
  // if (join) return data.join(" AND ");
  return data;
};

export const consolidateFilter = (filter: DataFilters) => {
  const data = Object.entries(filter)
    .map(([key, value]) => {
      return elementToAlgoliaFilter(key, value);
    })
    .filter((value) => !!value?.length);
  return data;
};
