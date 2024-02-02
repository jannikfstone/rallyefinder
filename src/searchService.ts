import { randomUUID } from "crypto";
import { DateFilter, LocationFilter, Search } from "./types";
import { StorageService } from "./StorageService";
import { requireEnv } from "./util";
import { Lambda } from "@aws-sdk/client-lambda";
import { SearchWorker } from "./SearchWorker";

export class SearchNotFoundError extends Error {
  public searchId: string;
  constructor(searchId: string) {
    super();
    this.searchId = searchId;
  }
}

export class SearchService {
  searches: {
    [id: number]: Search;
  } = {};
  storageService: StorageService;
  searchWorker: SearchWorker;
  lambda: Lambda;
  constructor() {
    this.storageService = new StorageService();
    this.lambda = new Lambda({});
    this.searchWorker = new SearchWorker();
  }

  async createSearch(
    dateFilter?: DateFilter,
    locationFilter?: LocationFilter
  ): Promise<string> {
    const currentId = randomUUID();
    console.log(`Creating search with id ${currentId}`);

    await this.storageService.save(currentId, {
      searchResult: null,
      searchState: "PENDING",
      searchFilters: {
        dateFilter,
        locationFilter,
      },
    });
    console.log(`Search with id ${currentId} created`);
    return currentId;
  }

  async triggerSearchRun(searchId: string): Promise<void> {
    if (process.env.IS_PRODUCTION === "true") {
      const searchExecutorArn = requireEnv("SEARCH_EXECUTOR_ARN");
      await this.lambda.invoke({
        FunctionName: searchExecutorArn,
        Payload: JSON.stringify({ searchId }),
        InvocationType: "Event",
      });
      return;
    }
    this.searchWorker.runSearch(searchId);
  }

  async getSearch(id: string): Promise<Search> {
    const search = await this.storageService.load(id);
    if (!search) {
      throw new SearchNotFoundError(id);
    }
    return search;
  }
}
