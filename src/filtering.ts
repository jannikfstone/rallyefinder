import dayjs from "dayjs";
import { getDistance } from "geolib";

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import {
  Coordinates,
  DateFilter,
  LocationFilter,
  RelationWithDates,
  Station,
} from "./types";
import { getAllStations } from "./stationsService";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const DEFAULT_FILTER_RADUIS_KM = 30;

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

export async function filterByLocation(
  unfilteredRelations: RelationWithDates[],
  locationFilter: LocationFilter
): Promise<RelationWithDates[]> {
  const allStations = await getAllStations();
  const filteredRelations = unfilteredRelations.filter((relation) => {
    return (
      isStationInRadius(
        allStations,
        locationFilter.start.coordinates,
        relation.startStation,
        locationFilter.start.radiusKm
      ) &&
      isStationInRadius(
        allStations,
        locationFilter.end.coordinates,
        relation.endStation,
        locationFilter.end.radiusKm
      )
    );
  });
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

function isStationInRadius(
  allStations: Station[],
  desiredLocation: Coordinates,
  stationCandidate: string,
  radiusKm = DEFAULT_FILTER_RADUIS_KM
): boolean {
  const stationDetails = allStations.find(
    (station) => station.id === stationCandidate
  );
  if (!stationDetails) {
    throw new Error(
      `Cannot find details for station with ID ${stationCandidate}. Aborting Filtering.`
    );
  }
  const distanceMeters = getDistance(
    desiredLocation,
    stationDetails.city.coordinates
  );
  return distanceMeters / 1000 < radiusKm;
}
