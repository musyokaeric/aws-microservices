import { DynamoDBClient } from "@aws-sdk/client-dynamodb"

const dynamoDbClient = new DynamoDBClient({ region: 'us-east-1' })
export default dynamoDbClient