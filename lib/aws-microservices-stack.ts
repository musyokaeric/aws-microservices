import { Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { EcommerceDatabase } from './database';
import { EcommerceMicroservices } from './microservices';
import { EcommerceApiGateway } from './apigateway';
import { EcommerceEventBus } from './eventbus';
import { EcommerceQueue } from './queue';

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Database construct
    const database = new EcommerceDatabase(this, 'Database');

    // Microservices construct (Lambda functions)
    const microservices = new EcommerceMicroservices(this, 'Microservices', {
        productTable: database.productTable,
        basketTable: database.basketTable,
        orderTable: database.orderTable
    });

    // API Gateway construct
    const apiGateway = new EcommerceApiGateway(this, 'ApiGateway', {
        productMicroservice: microservices.productMicroservice,
        basketMicroservice: microservices.basketMicroservice,
        orderingMicroservice: microservices.orderingMicroservice
    });

    // SQS Queue construct
    const queue = new EcommerceQueue(this, 'Queue', {
      consumer: microservices.orderingMicroservice
    })

    // Eventbus construct
    const eventBus = new EcommerceEventBus(this, 'EventBus', {
        publisherFunction: microservices.basketMicroservice,
        targetQueue: queue.orderQueue
    });
  }
}
