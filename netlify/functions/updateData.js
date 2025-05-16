// netlify/functions/updateData.js
const faunadb = require('faunadb');
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET
});

exports.handler = async (event) => {
  try {
    // 1. 解析前端傳來要加入的新物件
    const newItem = JSON.parse(event.body);

    // 2. 先讀取現有的 document
    const getResp = await client.query(
      q.Get(q.Ref(q.Collection('configs'), 'data'))
    );
    const existing = getResp.data || {};
    const items = Array.isArray(existing.items) ? existing.items : [];

    // 3. 將新項目加入陣列
    items.push(newItem);

    // 4. 更新回 FaunaDB
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
