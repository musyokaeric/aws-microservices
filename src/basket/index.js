import { GetItemCommand, ScanCommand, PutItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import dynamoDbClient from "./dynamoDbClient";
import { eventBridgeClient } from "./eventBridgeClient";
import { PutEventsCommand } from "@aws-sdk/client-eventbridge";

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

    // expected request payload: { userName: john_doe , attributes[firstName, lastName, email], items: [{ productId, productName, price, quantity }] }
    const checkoutRequest = JSON.parse(event.body)
    if (!checkoutRequest || !checkoutRequest.userName) {
        throw new Error('Invalid checkout request. userName is required.')
    }

    // 1. Get the existing basket with items
    const basket = await getBasket(checkoutRequest.userName)
    if (!basket || !basket.items || basket.items.length === 0) {
        throw new Error('Basket is empty or does not exist.')
    }

    // 2. Creating an event json with basket items, calculate total price, etc. Prepare order json data message
    var checkoutPayload = prepareOrderPayload(checkoutRequest, basket)

    // 3. Publish the event to eventbridge - this will subscribe to the order microservice and start ordering process
    const publishedEvent = await publishCheckoutEvent(checkoutPayload)

    // 4. Remove existing basket from DynamoDB
    await deleteBasket(checkoutRequest.userName)
}

const prepareOrderPayload = (checkoutRequest, basket) => {
    // TODO - implement prepareOrderPayload function to create an order payload for the checkout event
    console.log('prepareOrderPayload')

    try {
        let totalPrice = 0
        basket.items.forEach(item => totalPrice += item.price * item.quantity)
        checkoutRequest.totalPrice = totalPrice
        console.log(checkoutRequest)

        Object.assign(checkoutRequest, basket) // merge checkoutRequest and basket data into one payload
        console.log('Prepared order payload:', checkoutRequest)
        return checkoutRequest
    } catch (error) {
        console.error('Error preparing order payload:', error)
        throw error
    }
}

const publishCheckoutEvent = async (checkoutPayload) => {
    // TODO - implement publishCheckoutEvent function to publish the checkout event to EventBridge
    console.log('publishCheckoutEvent')
    try {
        const params = {
            Entries: [
                {
                    Source: process.env.EVENT_SOURCE,
                    DetailType: process.env.EVENT_DETAILTYPE,
                    Detail: JSON.stringify(checkoutPayload),
                    Resources: [], // optional - can include ARNs of related resources if needed
                    EventBusName: process.env.EVENT_BUSNAME // specify the event bus name if not using the default event bus
                }
            ]
        }
        const result = await eventBridgeClient.send(new PutEventsCommand(params))
        console.log('Published checkout event:', result)
        return result
    } catch (error) {
        console.error('Error publishing checkout event:', error)
        throw error
    }
}