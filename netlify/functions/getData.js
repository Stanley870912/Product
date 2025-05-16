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
      // 1. 讀取既有 document
      const resp = await client.query(
        q.Get(q.Ref(q.Collection('configs'), 'data'))
      );
      data = resp.data;
    } catch (err) {
      // 2. 如果是 404 → 文件不存在 → 自動建立
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
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
      headers: { "Content-Type": "application/json" }
    };
  }
};
