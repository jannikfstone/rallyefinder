import { SearchWorker } from "../SearchWorker";

const searchWorker = new SearchWorker();

export function handler(event: { searchId: string }) {
  if (!event.searchId) {
    throw new Error("No search id provided");
  }
  searchWorker.runSearch(event.searchId);
}
