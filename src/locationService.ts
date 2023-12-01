import axios from "axios";
import { requireEnv } from "./util";

export type GeoResponse = {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
};

export class LocationNotFoundError extends Error {}

export async function getCoordinates(
  cityName: string,
  country: string
): Promise<GeoResponse> {
  const apiBaseUrl = "https://api.api-ninjas.com/v1/geocoding";
  const apiKey = requireEnv("API_NINJAS_KEY");
  const url = `${apiBaseUrl}?city=${cityName}&country=${country}`;
  const response = await axios.get<GeoResponse[]>(url, {
    headers: { "X-Api-Key": apiKey },
  });
  if (response.data.length < 1) {
    throw new LocationNotFoundError(
      `No coordinates found for city ${cityName} in ${country}`
    );
  }
  return response.data[0];
}
