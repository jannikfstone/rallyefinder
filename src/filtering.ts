import dayjs from "dayjs";

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import { Relation, RelationWithDates } from "./types";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export type DateFilter = {
  earliestStart: Date;
  latestStart: Date;
  earliestEnd: Date;
  latestEnd: Date;
};

export function filterByDateRange(
  unfilteredRelations: RelationWithDates[],
  dateFilter: DateFilter
): RelationWithDates[] {
  for (const relation of unfilteredRelations) {
    const filteredTimeWindows = relation.timeWindows.filter((timeWindow) =>
      isDateRangeMatchingFilter(
        dateFilter,
        timeWindow.startDate,
        timeWindow.endDate
      )
    );
    relation.timeWindows = filteredTimeWindows;
  }
  const filteredRelations = unfilteredRelations.filter(
    (relation) => relation.timeWindows.length > 0
  );
  return filteredRelations;
}

function isDateRangeMatchingFilter(
  dateFilter: DateFilter,
  startDate: Date,
  endDate: Date
): boolean {
  return (
    dayjs(startDate).isSameOrAfter(dateFilter.earliestStart, "day") &&
    dayjs(startDate).isSameOrBefore(dateFilter.latestStart, "day") &&
    dayjs(endDate).isSameOrAfter(dateFilter.earliestEnd, "day") &&
    dayjs(endDate).isSameOrBefore(dateFilter.latestEnd, "day")
  );
}
