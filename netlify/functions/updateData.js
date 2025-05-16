const fs   = require('fs')
const path = require('path')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: '只允許 POST' }
  }

  try {
    const payload  = JSON.parse(event.body)
    const filePath = path.resolve(__dirname, '../non_pickup.json')
    const raw      = fs.readFileSync(filePath, 'utf8')
    const data     = JSON.parse(raw)

    // 假設 data 是一個陣列，我們就 push 新項目
    if (Array.isArray(data)) {
      data.push(payload.newItem)
    } else {
      // 否則覆寫成 payload.newData
      Object.assign(data, payload.newData)
    }

    // 寫回檔案（注意 Netlify 啟動時 functions 夾會被寫入在暫存，部署後寫入不保證持久）
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
