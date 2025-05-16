// netlify/functions/updateData.js
const faunadb = require('faunadb');
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET
});

exports.handler = async (event) => {
  try {
    // 解析前端送來的一筆新物件
    const newItem = JSON.parse(event.body);

    // 讀取現有 document
    const getResp = await client.query(
      q.Get(q.Ref(q.Collection('configs'), 'data'))
    );
    const existing = getResp.data || {};
    const items = Array.isArray(existing.items) ? existing.items : [];

    // 新項目加入陣列
    items.push(newItem);

    // 寫回 FaunaDB
    const updateResp = await client.query(
      q.Update(
        q.Ref(q.Collection('configs'), 'data'),
        { data: { ...existing, items } }
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: updateResp.data })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message })
    };
  }
};
