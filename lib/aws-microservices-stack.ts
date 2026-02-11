import { Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { EcommerceDatabase } from './database';
import { EcommerceMicroservices } from './microservices';
import { EcommerceApiGateway } from './apigateway';

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Database construct
    const database = new EcommerceDatabase(this, 'Database');

    // Microservices construct (Lambda functions)
    const microservices = new EcommerceMicroservices(this, 'Microservices', {
        productTable: database.productTable,
        basketTable: database.basketTable
    });

    // API Gateway construct
    const apiGateway = new EcommerceApiGateway(this, 'ApiGateway', {
        productMicroservice: microservices.productMicroservice,
        basketMicroservice: microservices.basketMicroservice
    });
  }
}
