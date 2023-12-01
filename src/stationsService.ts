import axios from "axios";
import { defaultHeaders } from ".";
import { ApiStation, ApiStationDetails, Station } from "./types";
import { writeFileConditional } from "./util";
import {
  GeoResponse,
  LocationNotFoundError,
  getCoordinates,
} from "./locationService";

export let allStations: Station[] = [];

export async function getAllStations(): Promise<Station[]> {
  if (allStations.length > 0) {
    return allStations;
  }
  const allStationsResponse = await axios.get<{ items: ApiStation[] }>(
    "https://booking.roadsurfer.com/api/en/stations?size=1000&enabled=1&sort_direction=asc&sort_by=name",
    {
      headers: {
        ...defaultHeaders,
        "X-Requested-Alias": "station.fetchAll",
      },
    }
  );

  const retrievedStations = allStationsResponse.data?.items;
  if (!retrievedStations) {
    throw new Error("No stations found");
  }
  const domainStationPromises = retrievedStations.map(convertToDomainStation);
  allStations = await Promise.all(domainStationPromises);

  writeFileConditional(
    "out/stations.json",
    JSON.stringify(allStationsResponse.data, null, 2)
  );

  return allStations;
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
  };
}

async function getStationDetails(
  stationId: string
): Promise<ApiStationDetails> {
  const stationDetailsResponse = await axios.get<ApiStationDetails>(
    `https://booking.roadsurfer.com/api/en/stations/${stationId}`,
    {
      headers: {
        ...defaultHeaders,
        "X-Requested-Alias": "station.get",
      },
    }
  );
  return stationDetailsResponse.data;
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
