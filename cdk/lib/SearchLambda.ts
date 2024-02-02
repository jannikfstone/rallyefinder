import { Duration, Resource } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { requireEnv } from "../../src/util";

export class SearchLambda extends Resource {
  function: NodejsFunction;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.function = new NodejsFunction(this, "HandlerFunction", {
      entry: `src/lambdas/searchLambda.ts`,
      runtime: Runtime.NODEJS_20_X,
      environment: {
        IS_PRODUCTION: "true",
        S3_BUCKET_NAME: requireEnv("S3_BUCKET_NAME"),
        API_NINJAS_KEY: requireEnv("API_NINJAS_KEY"),
      },
      timeout: Duration.seconds(60),
    });
  }
}
