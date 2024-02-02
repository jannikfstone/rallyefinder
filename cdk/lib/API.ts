import { Resource } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { requireEnv } from "../../src/util";

export class API extends Resource {
  handlerFunction: NodejsFunction;
  gateway: LambdaRestApi;
  constructor(
    scope: Construct,
    id: string,
    props: { searchExecutorArn: string }
  ) {
    super(scope, id);
    this.handlerFunction = new NodejsFunction(this, "HandlerFunction", {
      entry: `src/servers/lambdaHandler.ts`,
      runtime: Runtime.NODEJS_20_X,
      environment: {
        IS_PRODUCTION: "true",
        S3_BUCKET_NAME: requireEnv("S3_BUCKET_NAME"),
        SEARCH_EXECUTOR_ARN: props.searchExecutorArn,
      },
    });
    this.gateway = new LambdaRestApi(this, "API", {
      handler: this.handlerFunction,
      proxy: false,
    });
    const rallyefinder = this.gateway.root.addResource("rallyefinder");
    const search = rallyefinder.addResource("search");
    const searchItem = search.addResource("{id}");
    searchItem.addMethod("GET");
    search.addMethod("POST");
  }
}
