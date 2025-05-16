const fs   = require('fs')
const path = require('path')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST')
    return { statusCode: 405, body: '只允許 POST' }

  try {
    const payload  = JSON.parse(event.body)
    const filePath = path.join(__dirname, 'test.json')
    const arr      = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    arr.push(payload.newItem)
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf8')

    return { statusCode: 200, body: JSON.stringify({ success:true, data:arr }) }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}

