import dayjs from "dayjs";
import { RelationWithDates } from "./types";
import { DateFilter, filterByDateRange } from "./filtering";

describe("Date Filter", () => {
  const availableRelations: RelationWithDates[] = [
    {
      startStation: 1,
      endStation: 2,
      timeWindows: [
        { startDate: new Date("2023-06-20"), endDate: new Date("2023-06-25") },
      ],
    },
  ];

  it("returns unfiltered if the filter matches", () => {
    const filter: DateFilter = {
      earliestEnd: new Date("2023-06-25"),
      latestEnd: new Date("2023-06-30"),
      earliestStart: new Date("2023-06-19"),
      latestStart: new Date("2023-06-21"),
    };
    const filteredRelations = filterByDateRange(availableRelations, filter);
    expect(filteredRelations).toEqual(availableRelations);
  });
});
