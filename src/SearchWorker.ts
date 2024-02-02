import { StorageService } from "./StorageService";
import { filterByDateRange, filterByLocation } from "./filtering";
import { getAllRelations, getDateRangesForRelation } from "./relations";
import { RelationWithDates, SearchFilters, SearchResults } from "./types";

export class SearchWorker {
  storageService = new StorageService();
  async runSearch(searchId: string): Promise<void> {
    const search = await this.storageService.load(searchId);
    const dateFilter = search.searchFilters.dateFilter;
    const locationFilter = search.searchFilters.locationFilter;
    let filteredRelations: RelationWithDates[];
    try {
      const allRelations = await getAllRelations();
      console.log(`${allRelations.length} relations found`);
      const relationWithDatePromises = allRelations.map(
        getDateRangesForRelation
      );
      const relationsWithDates = await Promise.all(relationWithDatePromises);
      filteredRelations = relationsWithDates;
      if (dateFilter) {
        filteredRelations = filterByDateRange(filteredRelations, dateFilter);
      }
      if (locationFilter) {
        filteredRelations = await filterByLocation(
          filteredRelations,
          locationFilter
        );
      }
      this.searchSuccess(
        searchId,
        { dateFilter, locationFilter },
        filteredRelations
      );
    } catch (error) {
      this.searchFail(searchId, { dateFilter, locationFilter }, error as Error);
    }
  }

  private async searchSuccess(
    searchId: string,
    searchFilters: SearchFilters,
    searchResult: SearchResults
  ) {
    console.log(
      `Search ${searchId} complete. Found ${searchResult.length} relations`
    );
    this.storageService.save(searchId, {
      searchResult: searchResult,
      searchState: "SUCCESS",
      searchFilters,
    });
  }

  private async searchFail(
    searchId: string,
    searchFilters: SearchFilters,
    err: Error
  ) {
    console.log("Search failed: ", err);
    this.storageService.save(searchId, {
      searchResult: null,
      searchState: "ERROR",
      searchFilters: searchFilters,
    });
  }
}
