import { GetItemCommand, ScanCommand, PutItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import dynamoDbClient from "./dynamoDbClient";

exports.handler = async function (event) {
    console.log("Received event:", JSON.stringify(event, null, 2));

    let body;

    try {
        // TODO - switch on event.httpMethod and event.path to implement CRUD operations for different API endpoints
        switch (event.httpMethod) {
            case 'GET':
                if (event.pathParameters !== null) {
                    body = await getBasket(event.pathParameters.userName) // GET /basket/{userName}
                } else {
                    body = await getAllBaskets() // GET /basket
                }
                break;
            case 'POST':
                if (event.path === '/basket/checkout') {
                    body = await checkoutBasket(event) // POST /basket/checkout
                } else {
                    body = await createBasket(event) // POST /basket
                }
                break;
            case 'DELETE':
                body = await deleteBasket(event.pathParameters.userName) // DELETE /basket/{userName}
                break;
            default:
                body = `Unsupported method "${event.httpMethod}"`;
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

const getBasket = async (userName) => {
    // TODO - implement getBasket function to retrieve a basket by userName from DynamoDB
    console.log('getBasket')

    try {
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            Key: marshall({ userName: userName })
        }
        const { Item } = await dynamoDbClient.send(new GetItemCommand(params))
        console.log(Item)
        return Item ? unmarshall(Item) : {}
    } catch (error) {
        console.error('Error getting basket:', error)
        throw error
    }
}

const getAllBaskets = async () => {
    // TODO - implement getAllBaskets function to retrieve all baskets from DynamoDB
    console.log('getAllBaskets')

    try {
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME
        }
        const { Items } = await dynamoDbClient.send(new ScanCommand(params))
        console.log(Items)
        return Items ? Items.map(item => unmarshall(item)) : []
    } catch (error) {
        console.error('Error getting all baskets:', error)
        throw error
    }
}

const createBasket = async (event) => {
    // TODO - implement createBasket function to create a new basket in DynamoDB
    console.log('createBasket')

    try {
        const basket = JSON.parse(event.body)
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            Item: marshall(basket || {})
        }
        const result = await dynamoDbClient.send(new PutItemCommand(params))
        console.log(result)
        return result
    } catch (error) {
        console.error('Error creating basket:', error)
        throw error
    }
}

const deleteBasket = async (userName) => {
    // TODO - implement deleteBasket function to delete a basket by userName from DynamoDB
    console.log('deleteBasket')

    try {
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            Key: marshall({ userName: userName })
        }
        const result = await dynamoDbClient.send(new DeleteItemCommand(params))
        console.log(result)
        return result
    } catch (error) {
        console.error('Error deleting basket:', error)
        throw error
    }
}

const checkoutBasket = async (event) => {
    // TODO - implement checkoutBasket function to perform checkout operation for a basket (e.g. send message to SQS, SNS, etc.)
    console.log('checkoutBasket')

    // Publish checkout event to eventbridge: This will subscribe to the order microservice to create an order based on the basket details and perform further processing (e.g. payment, inventory update, etc.)
}