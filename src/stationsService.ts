import axios, { AxiosError, AxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";

import { defaultHeaders } from ".";
import { ApiStation, ApiStationDetails, Station } from "./types";
import { onRetry, writeFileConditional } from "./util";
import {
  GeoResponse,
  LocationNotFoundError,
  getCoordinates,
} from "./locationService";

axiosRetry(axios, {
  retries: 3,
  shouldResetTimeout: true,
  onRetry,
  retryCondition: (error) =>
    error.code === "ECONNABORTED" || error.response?.status === 429,
});

export let allStations: Station[] = [];

export async function getAllRallyeStations(): Promise<Station[]> {
  if (allStations.length > 0) {
    return allStations;
  }
  const allStationsResponse = await axios.get<ApiStation[]>(
    "https://booking.roadsurfer.com/api/en/rally/stations",
    {
      headers: {
        ...defaultHeaders,
        "X-Requested-Alias": "rally.startStations",
      },
      timeout: 10000,
    }
  );

  const retrievedStations = allStationsResponse.data;
  if (retrievedStations.length === 0) {
    throw new Error("No stations found");
  }
  const domainStationPromises = retrievedStations.map(convertToDomainStation);
  allStations = await Promise.all(domainStationPromises);

  const rallyeStations = allStations.filter(
    (station) => station.rallyeReturnStations.length > 0
  );
  writeFileConditional("stations.json", rallyeStations);
  return rallyeStations;
}

async function convertToDomainStation(station: ApiStation): Promise<Station> {
  const stationDetails = await getStationDetails(station.id.toString());
  const stationCityName = stationDetails.city.name;
  const geoResponse = await getLocationWithRetry(station, stationCityName);

  return {
    ...station,
    id: station.id.toString(),
    city: {
      ...station.city,
      id: station.city.id.toString(),
      name: stationCityName,
      coordinates: {
        latitude: geoResponse.latitude,
        longitude: geoResponse.longitude,
      },
    },
    rallyeReturnStations: stationDetails.returns.map((id) => id.toString()),
  };
}

async function getStationDetails(
  stationId: string
): Promise<ApiStationDetails> {
  try {
    const stationDetailsResponse = await axios.get<ApiStationDetails>(
      `https://booking.roadsurfer.com/api/en/rally/stations/${stationId}`,
      {
        headers: {
          ...defaultHeaders,
          "X-Requested-Alias": "rally.fetchRoutes",
        },
        timeout: 3000,
      }
    );
    return stationDetailsResponse.data;
  } catch (error) {
    if (error instanceof AxiosError && error.code === "ECONNABORTED") {
      console.error("Timeout receiving details of station ", stationId);
    }
    throw error;
  }
}

async function getLocationWithRetry(
  station: ApiStation,
  stationCityName: string
): Promise<GeoResponse> {
  try {
    return await getCoordinates(stationCityName, station.city.country);
  } catch (error) {
    if (!(error instanceof LocationNotFoundError)) {
      throw error;
    }
  }
  try {
    return await getCoordinates(station.name, station.city.country);
  } catch (error) {
    if (!(error instanceof LocationNotFoundError)) {
      throw error;
    }
  }
  return getCoordinates(
    getShortenedName(stationCityName),
    station.city.country
  );
}

function getShortenedName(name: string) {
  return name.split("-")[0].split(" ")[0];
}
