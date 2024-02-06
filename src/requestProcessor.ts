import { PostSearchBody, Search, SearchFilters } from "./types";
import { SearchService } from "./SearchService";
import { getStationDetails } from "./stationsService";

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

export async function processGetStation(id: string) {
  console.log("Getting station details for id: ", id);
  const stationDetails = await getStationDetails(id);
  console.log("Details for station ", id, ": ", stationDetails);
  return { name: stationDetails.name };
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

  if (
    searchBody.startLocation?.latitude &&
    searchBody.startLocation?.longitude &&
    searchBody.endLocation?.latitude &&
    searchBody.endLocation?.longitude
  ) {
    returnObj.locationFilter = {
      end: {
        coordinates: searchBody.endLocation,
        radiusKm: searchBody.endLocationRadius,
      },
      start: {
        coordinates: searchBody.startLocation,
        radiusKm: searchBody.startLocationRadius,
      },
    };
    console.log("Location filter: ", returnObj.locationFilter);
  }
  return returnObj;
}
