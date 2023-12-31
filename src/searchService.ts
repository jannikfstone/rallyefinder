import {
  DateFilter,
  LocationFilter,
  filterByDateRange,
  filterByLocation,
} from "./filtering";
import { getAllRelations, getDateRangesForRelation } from "./relations";
import { RelationWithDates, SearchState } from "./types";

export class SearchNotFoundError extends Error {
  public searchId: number;
  constructor(searchId: number) {
    super();
    this.searchId = searchId;
  }
}
export type Search = {
  searchState: SearchState;
  search: Promise<RelationWithDates[]>;
};
const searches: {
  [id: number]: Search;
} = {};

let idCounter = 0;

export function createSearch(
  dateFilter?: DateFilter,
  locationFilter?: LocationFilter
): number {
  const currentId = idCounter;
  idCounter++;
  const search = doSearch(dateFilter, locationFilter);

  searches[currentId] = { search, searchState: "PENDING" };
  search
    .then((searchResult) => searchSuccess(currentId, searchResult))
    .catch((err) => searchFail(currentId, err));
  return currentId;
}

async function doSearch(
  dateFilter?: DateFilter,
  locationFilter?: LocationFilter
): Promise<RelationWithDates[]> {
  const allRelations = await getAllRelations();
  console.log(`${allRelations.length} relations found`);
  const relationWithDatePromises = allRelations.map(getDateRangesForRelation);
  const relationsWithDates = await Promise.all(relationWithDatePromises);
  let filteredRelations = relationsWithDates;
  if (dateFilter) {
    filteredRelations = filterByDateRange(filteredRelations, dateFilter);
  }
  if (locationFilter) {
    filteredRelations = await filterByLocation(
      filteredRelations,
      locationFilter
    );
  }
  return filteredRelations;
}

export function getSearch(id: number): Search {
  const search = searches[id];
  if (!search) {
    throw new SearchNotFoundError(id);
  }
  return search;
}

function searchSuccess(searchId: number, searchResult: RelationWithDates[]) {
  console.log(
    `Search ${searchId} complete. Found ${searchResult.length} relations`
  );
  searches[searchId].searchState = "SUCCESS";
}
function searchFail(searchId: number, searchResult: RelationWithDates[]) {
  searches[searchId].searchState = "ERROR";
}
