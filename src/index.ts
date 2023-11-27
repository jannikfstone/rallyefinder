import dotenv from "dotenv";
dotenv.config();

import { Relation, RelationWithDates } from "./types";
import { sendRelationsViaEmail } from "./relationSender";
import { getAllRelations } from "./relations";
import { getDateRangesForRelation } from "./relations";
import { DateFilter, filterByDateRange } from "./filtering";
import dayjs from "dayjs";

export const defaultHeaders = {
  Accept: "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en",
  Connection: "keep-alive",
  Host: "booking.roadsurfer.com",
  Origin: "https://www.roadsurfer.com",
  Referer: "https://www.roadsurfer.com/en/",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "cross-site",
};

export async function handler() {
  const allRelations = await getAllRelations();

  const relationsWithDates = await getMatchingDateRelations(allRelations);
  const relationsFilteredByDate = filterByDateRange(
    relationsWithDates,
    getDateFilterTemp()
  );

  await sendRelationsViaEmail(relationsFilteredByDate);
}

async function getMatchingDateRelations(
  allRelations: Relation[]
): Promise<RelationWithDates[]> {
  const matchingRelations: RelationWithDates[] = [];

  for (const relation of allRelations) {
    const timeframes = await getDateRangesForRelation(relation);
  }
  const relationWithDatePromises = allRelations.map(getDateRangesForRelation);
  const relationsWithDates = await Promise.all(relationWithDatePromises);
  return relationsWithDates;
}

function getDateFilterTemp(): DateFilter {
  return {
    earliestStart: dayjs().add(1, "day").toDate(),
    latestStart: dayjs().add(3, "day").toDate(),
    earliestEnd: dayjs().add(3, "day").toDate(),
    latestEnd: dayjs().add(10, "day").toDate(),
  };
}
