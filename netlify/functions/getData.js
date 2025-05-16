// netlify/functions/getData.js
const faunadb = require('faunadb');
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET
});

exports.handler = async () => {
  try {
    let data;
    try {
      // 嘗試讀取 configs/data 這份文件
      const resp = await client.query(
        q.Get(q.Ref(q.Collection('configs'), 'data'))
      );
      data = resp.data;
    } catch (err) {
      // 如果是 404，表示文件不存在，就建立一份預設的
      if (err.requestResult?.statusCode === 404) {
        const createResp = await client.query(
          q.Create(
            q.Ref(q.Collection('configs'), 'data'),
            { data: { items: [] } }
          )
        );
        data = createResp.data;
      } else {
        throw err;
      }
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
