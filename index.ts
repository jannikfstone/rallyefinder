import axios from "axios";
import fs from "fs";
import { RelationWithDate, Station } from "./types";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { allowedEndDate, allowedStartDate } from "./config";
import { sendRelationsViaEmail } from "./relationSender";
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const defaultHeaders = {
  Accept: "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en",
  Connection: "keep-alive",
  Host: "booking.roadsurfer.com",
  Origin: "https://www.roadsurfer.com",
  Referer: "https://www.roadsurfer.com/en/",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "cross-site",
};



export async function handler() {
  const allStations = await getAllStations();

  const startStationIds = await getStartStationIds(allStations);

  const allRelations = await getAllRelations(startStationIds, allStations);

  const matchingRelationsByDate = await getMatchingDateRelations(allRelations);

  const readableMatchingDateRelations = matchingRelationsByDate.map(
    (relation) => ({
      startStation: allStations.find(
        (station) => station.id === relation.startStation
      )?.name ?? "Unknown",
      endStation: allStations.find(
        (station) => station.id === relation.endStation
      )?.name ?? "Unknown",
      timeWindow: relation.timeWindow,
    })
  );
  writeFileConditional(
    "matchingRelationsByDate.json",
    JSON.stringify(readableMatchingDateRelations, null, 2)
  );
  console.log("Found relations:", matchingRelationsByDate.length);

  await sendRelationsViaEmail(readableMatchingDateRelations);
}

async function dateRangesForRelation(
  startStation: number,
  endStation: number
): Promise<{ start: Date; end: Date }[]> {
  const response = await axios.get<{ startDate: string; endDate: string }[]>(
    `https://booking.roadsurfer.com/api/en/rally/timeframes?startStation=${startStation}&endStation=${endStation}`,
    {
      headers: {
        ...defaultHeaders,
        "X-Requested-Alias": "rally.timeframes",
      },
    }
  );

  return response.data.map((timeframe) => ({
    start: new Date(timeframe.startDate),
    end: new Date(timeframe.endDate),
  }));
}

function isDateMatch(timeframe: { start: Date; end: Date }) {
  return (
    dayjs(timeframe.start).isSameOrAfter(allowedStartDate, "day") &&
    dayjs(timeframe.end).isSameOrBefore(allowedEndDate, "day")
  );
}

async function getAllStations(): Promise<Station[]> {
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
    "stations.json",
    JSON.stringify(allStationsResponse.data, null, 2)
  );
  const allStations = allStationsResponse.data?.items;
  if (!allStations) {
    throw new Error("No stations found");
  }
  return allStations;
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

async function getAllRelations(
  startStationIds: number[],
  allStations: Station[]
) {
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
    "relations.json",
    JSON.stringify(readableRelations, null, 2)
  );
  console.log("Total relations:", allRelations.length);

  return allRelations;
}

async function getMatchingDateRelations(
  allRelations
): Promise<RelationWithDate[]> {
  const matchingRelations: RelationWithDate[] = [];

  for (const relation of allRelations) {
    const timeframes = await dateRangesForRelation(
      relation.startStation,
      relation.endStation
    );
    for (const timeframe of timeframes) {
      if (isDateMatch(timeframe)) {
        matchingRelations.push({
          startStation: relation.startStation,
          endStation: relation.endStation,
          timeWindow: {
            startDate: timeframe.start.toISOString(),
            endDate: timeframe.end.toISOString(),
          },
        });
      }
    }
  }
  return matchingRelations;
}

function writeFileConditional(filename: string, content: string) {
  if (process.env.WRITE_JSON === "true") {
    fs.writeFileSync(filename, content);
  }
}