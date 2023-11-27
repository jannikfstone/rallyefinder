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
  const filteredRelations = unfilteredRelations
    .map((relation) => {
      const filteredTimeWindows = relation.timeWindows.filter((timeWindow) =>
        isDateRangeMatchingFilter(
          dateFilter,
          timeWindow.startDate,
          timeWindow.endDate
        )
      );
      return { ...relation, timeWindows: filteredTimeWindows };
    })
    .filter((relation) => relation.timeWindows.length > 0);
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
