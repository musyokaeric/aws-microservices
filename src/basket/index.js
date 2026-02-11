exports.handler = async function (event) {
    console.log("Received event:", JSON.stringify(event, null, 2));
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `Hello from the Basket microservice! You've hit: ${event.path}`
    };
}