import { DeleteItemCommand, GetItemCommand, PutItemCommand, QueryCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import dynamoDbClient from "./dynamoDbClient";
import { randomUUID } from 'crypto';

export async function handler(event) {
    console.log('Received event:', JSON.stringify(event, null, 2));
    let body;

    try {

        // TODO - switch on event.httpMethod and event.path to implement CRUD operations for different API endpoints

        switch (event.httpMethod) {
            case 'GET':
                if (event.queryStringParameters !== null) {
                    body = await getProductsByCategory(event) // GET /product/1234?category={category}
                } else
                    if (event.pathParameters !== null) {
                        body = await getProduct(event.pathParameters.id) // GET /product/{id}
                    } else {
                        body = await getAllProducts() // GET /product
                    }
                break;
            case 'POST':
                body = await createProduct(event) // POST /product
                break;
            case 'PUT':
                body = await updateProduct(event) // PUT /product/{id}
                break;
            case 'DELETE':
                body = await deleteProduct(event.pathParameters.id) // DELETE /product/{id}
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

const getProduct = async (productId) => {
    // TODO - implement getProduct function to retrieve a product by its id from DynamoDB
    console.log('getProduct')

    try {
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            Key: marshall({ id: productId })
        }
        const { Item } = await dynamoDbClient.send(new GetItemCommand(params))
        console.log(Item)
        return Item ? unmarshall(Item) : {}
    } catch (error) {
        console.error('Error getting product:', error)
        throw error
    }
}

const getAllProducts = async () => {
    // TODO - implement getAllProducts function to retrieve all products from DynamoDB
    console.log('getAllProducts')

    try {
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME
        }
        const { Items } = await dynamoDbClient.send(new ScanCommand(params))
        console.log(Items)
        return Items ? Items.map(item => unmarshall(item)) : []
    } catch (error) {
        console.error('Error getting all products:', error)
        throw error
    }
}

const getProductsByCategory = async (event) => {
    // TODO - implement getProductsByCategory function to retrieve products by category from DynamoDB
    console.log('getProductsByCategory. Event:', event)
    try {
        const category = event.queryStringParameters.category
        const productId = event.pathParameters.id
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            KeyConditionExpression: 'id = :productId',
            FilterExpression: 'contains(category, :category)',
            ExpressionAttributeValues: marshall({
                ':category': { S: category },
                ':productId': { S: productId }
            })
        }
        const { Items } = await dynamoDbClient.send(new QueryCommand(params))
        console.log(Items)
        return Items.map(item => unmarshall(item))
    } catch (error) {
        console.error('Error getting products by category:', error)
        throw error
    }
}

const createProduct = async (event) => {
    // TODO - implement createProduct function to create a new product in DynamoDB
    console.log('createProduct. Event:', event)
    try {
        const product = JSON.parse(event.body)
        const productId = randomUUID()
        product.id = productId
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            Item: marshall(product || {})
        }
        const result = await dynamoDbClient.send(new PutItemCommand(params))
        console.log(result)
        return result
    } catch (error) {
        console.error('Error creating product:', error)
        throw error
    }
}

const deleteProduct = async (productId) => {
    // TODO - implement deleteProduct function to delete a product by its id from DynamoDB
    console.log('deleteProduct, productId:', productId)
    try {
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            Key: marshall({ id: productId })
        }
        const result = await dynamoDbClient.send(new DeleteItemCommand(params))
        console.log(result)
        return result
    } catch (error) {
        console.error('Error deleting product:', error)
        throw error
    }
}

const updateProduct = async (event) => {
    // TODO - implement updateProduct function to update a product by its id in DynamoDB
    console.log('updateProduct. Event:', event)
    try {
        const productUpdates = JSON.parse(event.body)
        const objectKeys = Object.keys(productUpdates)
        console.log(`updateProduct function. requestBody: "${productUpdates}", objectKeys: "${objectKeys}"`)

        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            Key: marshall({ id: event.pathParameters.id }),
            UpdateExpression: `SET ${objectKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objectKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objectKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: productUpdates[key],
            }), {})),
        }
        const result = await dynamoDbClient.send(new UpdateItemCommand(params))
        console.log(result)
        return result
    } catch (error) {
        console.error('Error updating product:', error)
        throw error
    }
}