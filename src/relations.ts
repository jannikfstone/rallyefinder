import axios, { all } from "axios";
import { defaultHeaders } from ".";
import { Relation, RelationWithDates, Station } from "./types";
import { writeFileConditional } from "./util";
import { getAllStations } from "./stationsService";

export async function getAllRelations() {
  const allStations = await getAllStations();

  const startStationIds = await getStartStationIds(allStations);
  let readableRelations: { [startStation: string]: Array<string> } = {};
  let allRelations: Relation[] = [];

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
    const endStationIds = endStationsResponse.data.map(toString);
    endStationIds.forEach((endStationId) => {
      allRelations.push({
        startStation: startStationId,
        endStation: endStationId,
      });
    });
    const endStationNames = endStationIds.map(
      (id) =>
        allStations.find((station) => station.id === id.toString())?.name ||
        "Unknown"
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

async function getStartStationIds(allStations: Station[]): Promise<string[]> {
  const startStationsResponse = await axios.get<number[]>(
    "https://booking.roadsurfer.com/api/en/rally/startstations",
    {
      headers: {
        ...defaultHeaders,
        "X-Requested-Alias": "rally.startStations",
      },
    }
  );
  const startStationIds = startStationsResponse.data.map(toString);
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
