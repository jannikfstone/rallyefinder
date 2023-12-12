import * as cdk from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const handlerFunction = new NodejsFunction(this, "HandlerFunction", {
      entry: `src/servers/lambdaHandler.ts`,
      runtime: Runtime.NODEJS_20_X,
    });
    const api = new LambdaRestApi(this, "API", {
      handler: handlerFunction,
      proxy: false,
    });
    const rallyefinder = api.root.addResource("rallyefinder");
    const search = rallyefinder.addResource("search");
    const searchItem = search.addResource("{id}");
    searchItem.addMethod("GET");
    search.addMethod("POST");
  }
}
