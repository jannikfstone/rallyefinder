import { SES } from "@aws-sdk/client-ses";
import { ReadableRelationWithDate } from "./types";
import { emailRecipient } from "./config";
import { requireEnv } from "./util";
const ses = new SES({});

export async function sendRelationsViaEmail(
  relations: ReadableRelationWithDate[]
) {
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
