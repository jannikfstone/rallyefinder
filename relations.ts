import axios, { all } from "axios";
import { defaultHeaders } from ".";
import { Relation, RelationWithDates, Station } from "./types";
import { writeFileConditional } from "./util";

let allStations: Station[] = [];

export async function getAllRelations() {
  const allStations = await getAllStations();

  const startStationIds = await getStartStationIds(allStations);
  let readableRelations: { [startStation: string]: Array<string> } = {};
  let allRelations: { startStation: number; endStation: number }[] = [];

  for (const startStationId of startStationIds) {
    const startStationName = allStations.find(
      (station) => station.id === startStationId
    )?.name;
    if (!startStationName) {
      throw new Error("Start station not found");
    }
    const endStationsResponse = await axios.get<Array<number>>(
      `https://booking.roadsurfer.com/api/en/rally/endstations?startStation=${startStationId}`,
      {
        headers: {
          ...defaultHeaders,
          "X-Requested-Alias": "rally.fetchRoutes",
        },
      }
    );
    const endStationIds = endStationsResponse.data;
    endStationIds.forEach((endStationId) => {
      allRelations.push({
        startStation: startStationId,
        endStation: endStationId,
      });
    });
    const endStationNames = endStationIds.map(
      (id) =>
        allStations.find((station) => station.id === id)?.name || "Unknown"
    );
    readableRelations[startStationName] = endStationNames;
  }
  writeFileConditional(
    "out/relations.json",
    JSON.stringify(readableRelations, null, 2)
  );
  console.log("Total relations:", allRelations.length);

  return allRelations;
}

export async function getAllStations(): Promise<Station[]> {
  if (allStations.length > 0) {
    return allStations;
  }
  const allStationsResponse = await axios.get<{ items: Station[] }>(
    "https://booking.roadsurfer.com/api/en/stations?size=1000&enabled=1&sort_direction=asc&sort_by=name",
    {
      headers: {
        ...defaultHeaders,
        "X-Requested-Alias": "station.fetchAll",
      },
    }
  );
  writeFileConditional(
    "out/stations.json",
    JSON.stringify(allStationsResponse.data, null, 2)
  );
  const retrievedStations = allStationsResponse.data?.items;
  if (!retrievedStations) {
    throw new Error("No stations found");
  }
  allStations = retrievedStations;
  return retrievedStations;
}

async function getStartStationIds(allStations: Station[]) {
  const startStationsResponse = await axios.get<number[]>(
    "https://booking.roadsurfer.com/api/en/rally/startstations",
    {
      headers: {
        ...defaultHeaders,
        "X-Requested-Alias": "rally.startStations",
      },
    }
  );
  const startStationIds = startStationsResponse.data;
  if (!startStationIds) {
    throw new Error("No start stations found");
  }

  const startStations = startStationIds.map(
    (id) => allStations.find((station) => station.id === id)?.name || "Unknown"
  );
  console.log("Start stations:", startStations.join(", "));
  return startStationIds;
}

export async function getDateRangesForRelation(
  relation: Relation
): Promise<RelationWithDates> {
  const response = await axios.get<{ startDate: string; endDate: string }[]>(
    `https://booking.roadsurfer.com/api/en/rally/timeframes?startStation=${relation.startStation}&endStation=${relation.endStation}`,
    {
      headers: {
        ...defaultHeaders,
        "X-Requested-Alias": "rally.timeframes",
      },
    }
  );

  const timeWindows = response.data.map((timeframe) => ({
    startDate: new Date(timeframe.startDate),
    endDate: new Date(timeframe.endDate),
  }));
  return { ...relation, timeWindows };
}
