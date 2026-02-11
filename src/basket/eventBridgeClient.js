import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
// TODO - create and export an instance of EventBridgeClient to be used in the basket microservice for publishing events to EventBridge
export const eventBridgeClient = new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-1' });