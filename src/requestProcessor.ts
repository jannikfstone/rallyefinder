import {
  DateFilter,
  LocationFilter,
  PostSearchBody,
  Search,
  SearchFilters,
} from "./types";
import { SearchService } from "./SearchService";

const searchService = new SearchService();

export async function processPostSearch(body: PostSearchBody): Promise<string> {
  const searchFilters = getSearchFilters(body);
  const searchId = await searchService.createSearch(
    searchFilters.dateFilter,
    searchFilters.locationFilter
  );
  await searchService.triggerSearchRun(searchId);
  return searchId;
}

export async function processGetSearch(id: string): Promise<Search> {
  return await searchService.getSearch(id);
}

function getSearchFilters(searchBody: PostSearchBody): SearchFilters {
  const returnObj: SearchFilters = {};
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
    console.log("Date filter: ", returnObj.dateFilter);
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
    console.log("Location filter: ", returnObj.locationFilter);
  }
  return returnObj;
}
