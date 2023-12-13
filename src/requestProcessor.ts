import { DateFilter, LocationFilter } from "./filtering";
import { SearchNotFoundError, createSearch, getSearch } from "./searchService";
import { RelationWithDates, SearchState } from "./types";

type SearchBody = {
  earliestStartDate?: string;
  latestStartDate?: string;
  earliestEndDate?: string;
  latestEndDate?: string;
  startLocation?: string;
  startLocationRadius?: number;
  endLocation?: string;
  endLocationRadius?: number;
};

export function processPostSearch(body: SearchBody): { searchId: number } {
  const searchFilters = getSearchFilters(body);
  const searchId = createSearch(
    searchFilters.dateFilter,
    searchFilters.locationFilter
  );
  return { searchId };
}

export async function processGetSearch(
  id: number
): Promise<{ searchState: SearchState; result?: RelationWithDates[] }> {
  const search = getSearch(id);
  if (search.searchState !== "SUCCESS") {
    return { searchState: search.searchState };
  }
  const searchResult = await search.search;
  return { searchState: search.searchState, result: searchResult };
}

function getSearchFilters(searchBody: SearchBody): {
  dateFilter?: DateFilter;
  locationFilter?: LocationFilter;
} {
  const returnObj: {
    dateFilter?: DateFilter;
    locationFilter?: LocationFilter;
  } = {};
  if (
    searchBody.earliestStartDate &&
    searchBody.latestStartDate &&
    searchBody.earliestEndDate &&
    searchBody.latestEndDate
  ) {
    returnObj.dateFilter = {
      earliestEnd: new Date(searchBody.earliestEndDate),
      latestEnd: new Date(searchBody.latestEndDate),
      earliestStart: new Date(searchBody.earliestStartDate),
      latestStart: new Date(searchBody.latestStartDate),
    };
  }

  if (searchBody.startLocation && searchBody.endLocation) {
    const startCoordinatesSplit = searchBody.startLocation.split(",");
    const endCoordinatesSplit = searchBody.endLocation.split(",");
    returnObj.locationFilter = {
      end: {
        coordinates: {
          latitude: parseFloat(endCoordinatesSplit[0]),
          longitude: parseFloat(endCoordinatesSplit[1]),
        },
        radiusKm: searchBody.endLocationRadius,
      },
      start: {
        coordinates: {
          latitude: parseFloat(startCoordinatesSplit[0]),
          longitude: parseFloat(startCoordinatesSplit[1]),
        },
        radiusKm: searchBody.startLocationRadius,
      },
    };
  }
  return returnObj;
}
