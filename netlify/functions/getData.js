// netlify/functions/getData.js
exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Hello from getData!",
      timestamp: new Date().toISOString()
    })
  }
}