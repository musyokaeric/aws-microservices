import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import dynamoDbClient from "./dynamoDbClient";
import { marshall } from "@aws-sdk/util-dynamodb";

exports.handler = async function (event) {
    console.log("Received event:", JSON.stringify(event, null, 2));
    // TODO - Catch and process async EventBridge Invocation and Sync API Gateway Invocation

    const eventType = event['detail-type'];
    if (eventType) {
        await eventBridgeInvocation(event);
    } else {
        await apiGatewayInvocation(event);
    }
}

const eventBridgeInvocation = async (event) => {
    console.log("Processing EventBridge Invocation");
    // TODO - Process EventBridge Invocation
    await createOrder(event.detail);
}

const apiGatewayInvocation = async (event) => {
    console.log("Processing API Gateway Invocation");
    // TODO - Process API Gateway Invocation
}

const createOrder = async (basketCheckoutEvent) => {
    console.log("Creating order:", JSON.stringify(basketCheckoutEvent, null, 2));
    // TODO - Create order in DynamoDB

    try {
        const orderDate = new Date().toISOString();
        basketCheckoutEvent.orderDate = orderDate;
        console.log(basketCheckoutEvent)

        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            Item: marshall(basketCheckoutEvent || {})
        };

        const result = await dynamoDbClient.send(new PutItemCommand(params));
        console.log("Order created successfully:", result);
        return result;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
}