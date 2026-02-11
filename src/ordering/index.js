exports.handler = async function (event) {
    console.log("Received event:", JSON.stringify(event, null, 2));
    // Process the event and perform necessary actions
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `Hello from Ordering! You've hit ${event.path}\n`,
    };
}