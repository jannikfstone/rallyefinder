import { SES } from '@aws-sdk/client-ses'
import { ReadableRelationWithDate } from './types'
import { emailRecipients } from './config'
const ses = new SES({})

export async function sendRelationsViaEmail(relations: ReadableRelationWithDate[]) {

  //Send an email to the given senders using SES client

  const sendResult = await ses.sendEmail({
    Destination: {
      ToAddresses: emailRecipients
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: JSON.stringify(relations, null, 2)
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Found matching relations'
      }
    },
    Source: 'noreply@maederstein.de'
  })

}