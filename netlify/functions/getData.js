// netlify/functions/getData.js
const faunadb = require('faunadb');
const q = faunadb.query;

// 使用環境變數 FAUNA_SECRET 初始化客戶端
const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET
});

exports.handler = async () => {
  try {
    let data;

    try {
      // 嘗試讀取已存在的 document
      const resp = await client.query(
        q.Get(q.Ref(q.Collection('configs'), 'data'))
      );
      data = resp.data;
    } catch (error) {
      // 如果是 404，表示 document 還沒建立，於是自動建立並回傳預設資料
      if (error.requestResult?.statusCode === 404) {
        const createResp = await client.query(
          q.Create(
            q.Ref(q.Collection('configs'), 'data'),
            { data: { items: [] } }
          )
        );
        data = createResp.data;
      } else {
        // 其他錯誤則拋出
        throw error;
      }
    }

    // 成功回傳雲端資料
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    // 發生意外
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
