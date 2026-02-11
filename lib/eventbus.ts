import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { SqsQueue } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

interface EcommerceEventBusProps {
    // Fan-out with publisher/subscriber pattern
    publisherFunction: IFunction;
    targetQueue: IQueue; 
}

export class EcommerceEventBus extends Construct {
    constructor(scope: Construct, id: string, {publisherFunction, targetQueue}: EcommerceEventBusProps) {
        super(scope, id);

        const eventBus = new EventBus(this, 'EventBus', {
            eventBusName: 'EcommerceEventBus'
        });

        // Rules to route events to microservices can be added here
        const checkoutBasketRule = new Rule(this, 'CheckoutBasketRule', {
            eventBus: eventBus,
            enabled: true,
            description: 'When the basket microservices checkout the basket',
            eventPattern: {
                source: ['com.ecommerce.basket.checkout'],
                detailType: ['CheckoutBasket']
            },
            ruleName: 'CheckoutBasketRule'
        });

        // Add targets to the rule if needed
        checkoutBasketRule.addTarget(new SqsQueue(targetQueue));

        // Grant permissions to the publisher function to put events on the event bus
        eventBus.grantPutEventsTo(publisherFunction);
    }
}