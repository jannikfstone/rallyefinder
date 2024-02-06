import {
  APIGatewayEvent,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import {
  processGetSearch,
  processGetStation,
  processPostSearch,
} from "../requestProcessor";
import { SearchNotFoundError } from "../SearchService";
import { PostSearchBody } from "../types";
import { StationNotFoundError } from "../stationsService";

const headers = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
};
/*
const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://www.example.com",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
*/
export async function handler(event: APIGatewayEvent) {
  if (event.resource === "/search/{id}") {
    return await handleGetSearch(event);
  }
  if (event.resource === "/search") {
    return await handlePostSearch(event);
  }
  if (event.resource === "/stations/{id}") {
    return await handleGetStation(event);
  }
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "OK",
    };
  }
  return {
    statusCode: 404,
    body: "Not found",
  };
}

async function handlePostSearch(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const body: PostSearchBody = event.body ? JSON.parse(event.body) : {};
  console.log("Received body: ", body);
  try {
    const searchId = await processPostSearch(body);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ searchId }),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      headers,
      body: "Internal server error",
    };
  }
}

async function handleGetSearch(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.pathParameters?.id) {
    return {
      statusCode: 400,
      headers,
      body: "Malformed id",
    };
  }
  const searchId = event.pathParameters.id;
  if (Number.isNaN(searchId)) {
    return {
      statusCode: 400,
      headers,
      body: "Malformed id",
    };
  }
  try {
    const result = await processGetSearch(searchId);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    if (error instanceof SearchNotFoundError) {
      return {
        statusCode: 400,
        headers,
        body: "No search found with given id",
      };
    }
    throw error;
  }
}

async function handleGetStation(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.pathParameters?.id) {
    return {
      statusCode: 400,
      headers,
      body: "Malformed id",
    };
  }
  const stationId = event.pathParameters.id;
  if (Number.isNaN(stationId)) {
    return {
      statusCode: 400,
      headers,
      body: "Malformed id",
    };
  }
  try {
    const result = await processGetStation(stationId);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    if (error instanceof StationNotFoundError) {
      return {
        statusCode: 400,
        headers,
        body: "No station found with given id",
      };
    }
    console.log("Error:", error);
    throw error;
  }
}
