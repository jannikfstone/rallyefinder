import { Resource } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { requireEnv } from "../../src/util";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { ARecord, HostedZone } from "aws-cdk-lib/aws-route53";
import { ApiGateway } from "aws-cdk-lib/aws-route53-targets";

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
      cloudWatchRole: true,
    });
    const search = this.gateway.root.addResource("search");
    const searchItem = search.addResource("{id}");
    searchItem.addMethod("GET");
    search.addMethod("POST");
    const stations = this.gateway.root.addResource("stations");
    const station = stations.addResource("{id}");
    station.addMethod("GET");
    this.getApiDomainOptions();
  }

  private getApiDomainOptions() {
    if (!process.env.DOMAIN_ZONE || !process.env.CERTIFICATE_ARN) {
      console.log(
        "No custom domain name or certificate ARN provided. Skipping custom domain setup."
      );
      return undefined;
    }
    const parentDomainName = requireEnv("DOMAIN_ZONE");
    const apiDomainName = `rallyefinder.${parentDomainName}`;
    const domainCertificate = Certificate.fromCertificateArn(
      this,
      "DomainCertificate",
      requireEnv("CERTIFICATE_ARN")
    );
    this.gateway.addDomainName("CustomDomain", {
      domainName: apiDomainName,
      certificate: domainCertificate,
    });
    const hostedZone = HostedZone.fromLookup(this, "HostedZone", {
      domainName: parentDomainName,
    });
    const gatewayTarget = new ApiGateway(this.gateway);
    new ARecord(this, "ApiARecord", {
      zone: hostedZone,
      target: { aliasTarget: gatewayTarget },
      recordName: apiDomainName,
    });
  }
}
