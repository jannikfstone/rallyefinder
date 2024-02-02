import {
  APIGatewayEvent,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { processGetSearch, processPostSearch } from "../requestProcessor";
import { SearchNotFoundError } from "../SearchService";
import { PostSearchBody } from "../types";

export async function handler(event: APIGatewayEvent) {
  if (event.resource === "/rallyefinder/search/{id}") {
    return await handleGet(event);
  }
  if (event.resource === "/rallyefinder/search") {
    return await handlePost(event);
  }
}

async function handlePost(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const body: PostSearchBody = event.body ? JSON.parse(event.body) : {};
  console.log("Received body: ", body);
  try {
    const searchId = await processPostSearch(body);
    return {
      statusCode: 200,
      body: JSON.stringify({ searchId }),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: "Internal server error",
    };
  }
}

async function handleGet(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.pathParameters?.id) {
    return {
      statusCode: 400,
      body: "Malformed id",
    };
  }
  const searchId = event.pathParameters.id;
  if (Number.isNaN(searchId)) {
    return {
      statusCode: 400,
      body: "Malformed id",
    };
  }
  try {
    const result = await processGetSearch(searchId);
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    if (error instanceof SearchNotFoundError) {
      return {
        statusCode: 400,
        body: "No search found with given id",
      };
    }
    throw error;
  }
}
