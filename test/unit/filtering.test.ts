import { DateFilter, LocationFilter, RelationWithDates } from "../../src/types";
import { filterByDateRange, filterByLocation } from "../../src/filtering";
import { getAllStations } from "../../src/stationsService";

jest.mock("../../src/stationsService");
const getAllStationsMock = getAllStations as jest.MockedFunction<
  typeof getAllStations
>;

describe("Date Filter", () => {
  const availableRelations: RelationWithDates[] = [
    {
      startStation: "1",
      endStation: "2",
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

describe("RadiusFilter", () => {
  /*
   * Distances:
   * 1 --> 2 13.7 km
   * 1 --> 3 27,4 km
   * 2 --> 3 13.7 km
   *
   */
  const location1 = {
    latitude: 52,
    longitude: 10,
  };
  const location2 = {
    latitude: 52,
    longitude: 10.2,
  };
  const location3 = {
    latitude: 52,
    longitude: 10.4,
  };
  getAllStationsMock.mockResolvedValue([
    {
      id: "1",
      city: {
        coordinates: location1,
        name: "City 1",
        country: "DE",
        country_name: "Germany",
        country_translated: "Germany",
        id: "1",
      },
      name: "City 1",
      rallyeReturnStations: ["2"],
    },
    {
      id: "2",
      city: {
        coordinates: location2,
        name: "City 2",
        country: "DE",
        country_name: "Germany",
        country_translated: "Germany",
        id: "2",
      },
      name: "City 2",
      rallyeReturnStations: ["3"],
    },
  ]);
  const timeWindows = [
    { startDate: new Date("2023-06-20"), endDate: new Date("2023-06-25") },
    { startDate: new Date("2023-06-21"), endDate: new Date("2023-06-24") },
  ];
  it("Will not filter if start and end stations are in radius", async () => {
    const filter: LocationFilter = {
      start: { coordinates: location1 },
      end: { coordinates: location2 },
    };
    const relations: RelationWithDates[] = [
      { startStation: "1", endStation: "2", timeWindows },
    ];
    const filteredRelations = await filterByLocation(relations, filter);
    expect(filteredRelations.length).toBe(1);
  });
  it("Will filter if start station is not in radius", async () => {
    const filter: LocationFilter = {
      start: { coordinates: { latitude: 0, longitude: 0 } },
      end: { coordinates: location2 },
    };
    const relations: RelationWithDates[] = [
      { startStation: "1", endStation: "2", timeWindows },
    ];
    const filteredRelations = await filterByLocation(relations, filter);
    expect(filteredRelations.length).toBe(0);
  });
  it("Will filter if end station is not in radius", async () => {
    const filter: LocationFilter = {
      start: { coordinates: location1 },
      end: { coordinates: { latitude: 0, longitude: 0 } },
    };
    const relations: RelationWithDates[] = [
      { startStation: "1", endStation: "2", timeWindows },
    ];
    const filteredRelations = await filterByLocation(relations, filter);
    expect(filteredRelations.length).toBe(0);
  });
  it("Will overwrite the default radius if radius is given", async () => {
    const filter: LocationFilter = {
      start: { coordinates: location3, radiusKm: 30 },
      end: { coordinates: location2 },
    };
    const relations: RelationWithDates[] = [
      { startStation: "1", endStation: "2", timeWindows },
    ];
    const filteredRelations = await filterByLocation(relations, filter);
    expect(filteredRelations.length).toBe(1);
  });
});
