import { APIGatewayEvent } from "aws-lambda";
import { processGetSearch, processPostSearch } from "../requestProcessor";
import { SearchNotFoundError } from "../searchService";

export async function handler(event: APIGatewayEvent) {
  if (event.resource === "/rallyefinder/search/{id}") {
    return await handlePost(event);
  }
  if (event.resource === "/rallyefinder/search") {
    return handleGet(event);
  }
}

function handleGet(event: APIGatewayEvent) {
  const body = event.body ?? {};
  const searchId = processPostSearch(body);
  return {
    statusCode: 200,
    body: searchId,
  };
}

async function handlePost(event: APIGatewayEvent) {
  if (!event.pathParameters?.id) {
    return {
      statusCode: 400,
      body: "Malformed id",
    };
  }
  const searchId = parseInt(event.pathParameters?.id);
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
      body: result,
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
