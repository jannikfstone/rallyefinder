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
        { startDate: new Date("2023-06-21"), endDate: new Date("2023-06-24") },
      ],
    },
  ];

  it("returns unfiltered if the filter matches", () => {
    const filter: DateFilter = {
      earliestEnd: new Date("2023-06-24"),
      latestEnd: new Date("2023-06-30"),
      earliestStart: new Date("2023-06-19"),
      latestStart: new Date("2023-06-22"),
    };
    const filteredRelations = filterByDateRange(availableRelations, filter);
    expect(filteredRelations).toEqual(availableRelations);
  });

  it("filters the array of a relation if the latest start does not match", () => {
    const filter: DateFilter = {
      earliestEnd: new Date("2023-06-24"),
      latestEnd: new Date("2023-06-30"),
      earliestStart: new Date("2023-06-19"),
      latestStart: new Date("2023-06-20"),
    };
    const filteredRelations = filterByDateRange(availableRelations, filter);
    expect(filteredRelations.length).toBe(1);
    expect(filteredRelations[0].timeWindows.length).toBe(1);
    expect(filteredRelations[0].timeWindows).toContainEqual({
      startDate: new Date("2023-06-20"),
      endDate: new Date("2023-06-25"),
    });
  });
  it("filters the array of a relation if the earliest start does not match", () => {
    const filter: DateFilter = {
      earliestEnd: new Date("2023-06-24"),
      latestEnd: new Date("2023-06-24"),
      earliestStart: new Date("2023-06-21"),
      latestStart: new Date("2023-06-22"),
    };
    const filteredRelations = filterByDateRange(availableRelations, filter);
    expect(filteredRelations.length).toBe(1);
    expect(filteredRelations[0].timeWindows.length).toBe(1);
    expect(filteredRelations[0].timeWindows).toContainEqual({
      startDate: new Date("2023-06-21"),
      endDate: new Date("2023-06-24"),
    });
  });
  it("filters the array of a relation if the latest end does not match", () => {
    const filter: DateFilter = {
      earliestEnd: new Date("2023-06-24"),
      latestEnd: new Date("2023-06-24"),
      earliestStart: new Date("2023-06-19"),
      latestStart: new Date("2023-06-22"),
    };
    const filteredRelations = filterByDateRange(availableRelations, filter);
    expect(filteredRelations.length).toBe(1);
    expect(filteredRelations[0].timeWindows.length).toBe(1);
    expect(filteredRelations[0].timeWindows).toContainEqual({
      startDate: new Date("2023-06-21"),
      endDate: new Date("2023-06-24"),
    });
  });
  it("filters the array of a relation if the earliest end does not match", () => {
    const filter: DateFilter = {
      earliestEnd: new Date("2023-06-25"),
      latestEnd: new Date("2023-06-30"),
      earliestStart: new Date("2023-06-19"),
      latestStart: new Date("2023-06-22"),
    };
    const filteredRelations = filterByDateRange(availableRelations, filter);
    expect(filteredRelations.length).toBe(1);
    expect(filteredRelations[0].timeWindows.length).toBe(1);
    expect(filteredRelations[0].timeWindows).toContainEqual({
      startDate: new Date("2023-06-20"),
      endDate: new Date("2023-06-25"),
    });
  });
  it("Removes relations with no matching dates entirely", () => {
    const filter: DateFilter = {
      earliestEnd: new Date("2023-06-22"),
      latestEnd: new Date("2023-06-23"),
      earliestStart: new Date("2023-06-19"),
      latestStart: new Date("2023-06-22"),
    };
    const filteredRelations = filterByDateRange(availableRelations, filter);
    expect(filteredRelations.length).toBe(0);
  });
});
