import { PutItemCommand, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import dynamoDbClient from "./dynamoDbClient";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

exports.handler = async function (event) {
    // TODO - Catch and process async EventBridge Invocation and Sync API Gateway Invocation

    if (event.Records !== undefined) {
        // SQS Invocation
        console.log("Event.Records: ", JSON.stringify(event.Records))
        await sqsInvocation(event)
    } else if (event['detail-type'] !== undefined) {
        // EventBridge Invocation
        console.log("Event['detail-type']: ", JSON.stringify(event['detail-type']))
        await eventBridgeInvocation(event);
    } else {
        // API Gateway Invocation
        console.log("Received event:", JSON.stringify(event, null, 2));
        return await apiGatewayInvocation(event);
    }
}

const sqsInvocation = async (event) => {
    console.log("Processing SQS Invocation");
    // TODO - Process SQS Invocation

    for (const record of event.Records) {
        console.log('Record %j', record)

        // expected request : { "detail-type\": \"CheckoutBasket\", \"source\": \"com.ecommerce.basket.checkout\", ... }
        const checkoutEventRequest = JSON.parse(record.body);

        // create order item into db
        await createOrder(checkoutEventRequest.detail)
            .then(response => console.log(response))
            .catch(error => console.error(error))
    }
}

const eventBridgeInvocation = async (event) => {
    console.log("Processing EventBridge Invocation");
    // TODO - Process EventBridge Invocation
    await createOrder(event.detail);
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

const apiGatewayInvocation = async (event) => {
    console.log("Processing API Gateway Invocation");
    // TODO - Process API Gateway Invocation

    let body;
    try {
        switch (event.httpMethod) {
            case 'GET':
                if (event.pathParameters !== null) {
                    body = await getOrder(event)
                } else {
                    body = await getAllOrders()
                }
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }

        console.log(body)

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully performed operation for ${event.httpMethod} ${event.path}`,
                body: body
            }),
        };
    } catch (error) {
        console.error('Error processing event:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to perform operation. Please check the logs for more details.',
                errorMessage: error.message,
                errorStack: error.stack
            }),
        }
    }
}

const getOrder = async (event) => {
    // TODO - implement getOrder function to retrieve an order by orderId from DynamoDB
    console.log('getOrder')

    try {
        const userName = event.pathParameters.userName;
        const orderDate = event.queryStringParameters.orderDate;

        const params = {
            KeyConditionExpression: 'userName = :userName AND orderDate = :orderDate',
            ExpressionAttributeValues: {
                ':userName': { S: userName },
                ':orderDate': { S: orderDate }
            },
            TableName: process.env.DYNAMO_TABLE_NAME
        };

        const { Items } = await dynamoDbClient.send(new QueryCommand(params));
        console.log(Items)
        return Items ? Items.map(item => unmarshall(item)) : {}
    } catch (error) {
        console.error('Error getting order:', error)
        throw error
    }
}

const getAllOrders = async (event) => {
    // TODO - implement getAllOrders function to retrieve all orders from DynamoDB
    console.log('getAllOrders')

    try {
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME
        }
        const { Items } = await dynamoDbClient.send(new ScanCommand(params))
        console.log(Items)
        return Items ? Items.map(item => unmarshall(item)) : {}
    } catch (error) {
        console.error('Error getting all orders:', error)
        throw error
    }
}