import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { API } from "./API";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { requireEnv } from "../../src/util";
import { SearchLambda } from "./SearchLambda";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const searchLambda = new SearchLambda(this, "SearchLambda");
    const bucket = new Bucket(this, "Bucket", {
      bucketName: requireEnv("S3_BUCKET_NAME"),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(1),
        },
      ],
    });
    const api = new API(this, "API", {
      searchExecutorArn: searchLambda.function.functionArn,
    });
    searchLambda.function.grantInvoke(api.handlerFunction);
    bucket.grantReadWrite(api.handlerFunction);
    bucket.grantReadWrite(searchLambda.function);
  }
}
