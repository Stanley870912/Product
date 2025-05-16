// netlify/functions/updateData.js
const faunadb = require('faunadb'),
      q       = faunadb.query;

const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET
});

exports.handler = async (event) => {
  try {
    // 前端會送整個 JSON 物件
    const newData = JSON.parse(event.body);
    await client.query(
      q.Update(
        q.Ref(q.Collection('configs'), 'data'),
        { data: newData }
      )
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: e.message })
    };
  }
};
