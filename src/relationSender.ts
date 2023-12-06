import { SES } from "@aws-sdk/client-ses";
import { ReadableRelationWithDate, Relation, RelationWithDates } from "./types";
import { emailRecipient } from "../config";
import { requireEnv, writeFileConditional } from "./util";
import { getAllRallyeStations } from "./stationsService";
const ses = new SES({});

export async function sendRelationsViaEmail(relations: RelationWithDates[]) {
  //Send an email to the given senders using SES client

  const sendResult = await ses.sendEmail({
    Destination: {
      ToAddresses: [emailRecipient],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: JSON.stringify(relations, null, 2),
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Found matching relations",
      },
    },
    Source: requireEnv("EMAIL_SENDER"),
  });
}

// async function makeRelationsReadable(
//   relations: RelationWithDates[]
// ): Promise<ReadableRelationWithDate[]> {
//   const allStations = await getAllStations();
//   const readableMatchingDateRelations = relations.map((relation) => ({
//     startStation:
//       allStations.find((station) => station.id === relation.startStation)
//         ?.name ?? "Unknown",
//     endStation:
//       allStations.find((station) => station.id === relation.endStation)?.name ??
//       "Unknown",
//     timeWindows: relation.timeWindows.map((timeWindow) => ({
//       startDate: timeWindow.startDate.toISOString(),
//       endDate: timeWindow.endDate.toISOString(),
//     })),
//   }));

//   writeFileConditional(
//     "out/matchingRelationsByDate.json",
//     JSON.stringify(readableMatchingDateRelations, null, 2)
//   );
//   console.log("Found relations:", readableMatchingDateRelations.length);
//   return readableMatchingDateRelations;
// }
