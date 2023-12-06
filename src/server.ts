import express from "express";
import dotenv from "dotenv";

import { SearchNotFoundError, createSearch, getSearch } from "./searchService";
import { DateFilter, LocationFilter } from "./filtering";

dotenv.config();

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

const app = express();
const port = 8080;

app.listen(port);
app.use(express.json());
app.use((request, response, next) => {
  console.log(`Received ${request.method} ${request.path}`);
  next();
});

console.log("Listening");
app.post("/rallyefinder/search", (request, response) => {
  const searchFilters = getSearchFilters(request.body);
  const searchId = createSearch(
    searchFilters.dateFilter,
    searchFilters.locationFilter
  );
  response.send({ searchId });
});

//TODO: Times out if GET 0 sent before creating search
app.get("/rallyefinder/search/:id", async (request, response) => {
  try {
    const searchId = parseInt(request.params.id);
    if (Number.isNaN(searchId)) {
      response.status(400).send("Malformed id");
      return;
    }
    const search = getSearch(searchId);
    if (search.searchState !== "SUCCESS") {
      response.send({ searchState: search.searchState });
      return;
    }
    const searchResult = await search.search;
    response.send({ searchState: search.searchState, result: searchResult });
  } catch (error) {
    if (Error instanceof SearchNotFoundError) {
      response.status(404).send("No search found with given id");
    }
  }
});

// TODO: Handle incomplete filters, handle malformatted filters
//possible malformattings: malformatted date, extra symbols in coordinates (like spaces), type mismatches (string instead of number for distance)
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
