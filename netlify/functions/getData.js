
const fs   = require('fs')
const path = require('path')

exports.handler = async () => {
  try {
    const filePath = path.join(__dirname, 'test.json')
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return { statusCode: 200, body: JSON.stringify(data) }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}