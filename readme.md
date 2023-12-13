## Roadsurfer Rallye-Finder

This project aims at improving the search functionality of roadsurfer rallyes (a one-way rental product of a camper van rental company).
The native search works in a way where you have to select a start station, then an end station and only then you can see available dates.
This search API instead takes date ranges and locations for start and end as an input and returns all available relations that match the criteria.

### Starting the API

You can start the API by runing `npm i` and `npm run dev`.
This will start an express server listening on port 8080.

### Using the API

The API currently has 2 endpoints: One for triggering a new search and one for retrieving a search result.

#### New search

You can trigger a search by calling POST `/rallyfinder/search`.
Filters must be sent in the POST body following this schema:

```
{
  "earliestStartDate": string (ISO Date),
  "latestStartDate": string (ISO Date),
  "earliestEndDate": string (ISO Date),
  "latestEndDate": string (ISO Date),
  "startLocation": string (Lat, Lon),
  "startLocationRadius": number (in km),
  "endLocation": string (Lat, Lon),
  "endLocationRadius": number (in km)
}
```

Currently, you can specify location and/or date filters or none of them.
If the date filter is set, all of the fields belonging to it MUST be set (earliest and latest start or end date).
If the location filter is set, start and end coordinates MUST be set.
The radius can be left out for any of them and will default to 30km in this case.

The API will return a JSON with a searchId. You can use this ID to query the results of the search.

#### Get search results

You can retrieve the results of your search by calling GET `/rallyefinder/search/{id}`.
You will get a JSON back with a field `searchState` which can be "PENDING", "SUCCESS" or "ERROR".
If the search is in state "SUCCESS" you will additionally get the search results as an array under the key `result`.

### Requirements

- You need to have node 20 installed. Earlier versions will probably work but are not tested.
- You will need a valid API ninjas API key.
  This must be set either manually as an environment variable or placed in a .env file under the name `API_NINJAS_KEY`.

### Deployment

Automatic deployment to AWS lambda is working if you have an account that is enabled for AWS-CDK.
You can deploy by setting the environment variable `CDK_DEFAULT_ACCOUNT` to the target account and running `npm run deploy`.
You can destroy the app by running `npm run destroy`.
Note however, that currently the code deployed to a lambda function does not work because the API stores search results in-memory which is incompatible with the lambda architecture.
