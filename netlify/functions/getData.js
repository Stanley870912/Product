const fs   = require('fs')
const path = require('path')

exports.handler = async () => {
  try {
    // __dirname 在這裡是 netlify/functions
    const filePath = path.resolve(__dirname, '../non_pickup.json')
    const raw     = fs.readFileSync(filePath, 'utf8')
    const data    = JSON.parse(raw)

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}