import axios from "axios";
import { defaultHeaders } from ".";
import { Relation, RelationWithDates, Station } from "./types";
import { customDelay, onRetry, writeFileConditional } from "./util";
import { getAllRallyeStations } from "./stationsService";
import axiosRetry from "axios-retry";

axiosRetry(axios, {
  retries: 3,
  shouldResetTimeout: true,
  onRetry,
  retryDelay: customDelay,
  retryCondition: (error) =>
    error.code === "ECONNABORTED" || error.response?.status === 429,
});

export async function getAllRelations() {
  const allStations = await getAllRallyeStations();

  let allRelations: Relation[] = [];

  for (const startStation of allStations) {
    for (const endStationId of startStation.rallyeReturnStations) {
      allRelations.push({
        startStation: startStation.id,
        endStation: endStationId,
      });
    }
  }
  writeFileConditional("relations.json", allRelations);

  return allRelations;
}

export async function getDateRangesForRelation(
  relation: Relation
): Promise<RelationWithDates> {
  try {
    const response = await axios.get<{ startDate: string; endDate: string }[]>(
      `https://booking.roadsurfer.com/api/en/rally/timeframes/${relation.startStation}-${relation.endStation}`,
      {
        headers: {
          ...defaultHeaders,
          "X-Requested-Alias": "rally.timeframes",
        },
        timeout: 3000,
      }
    );

    const timeWindows = response.data.map((timeframe) => ({
      startDate: new Date(timeframe.startDate),
      endDate: new Date(timeframe.endDate),
    }));
    return { ...relation, timeWindows };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
