// netlify/functions/updateData.js
const TOKEN  = process.env.GITHUB_TOKEN;
const REPO   = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 解析前端傳來的新訂單物件
  let newOrder;
  try {
    newOrder = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  try {
    // 1. 拿 metadata + content
    const metaRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/data.json?ref=${BRANCH}`,
      { headers: { Authorization: `token ${TOKEN}` } }
    );
    if (!metaRes.ok) {
      return { statusCode: metaRes.status, body: await metaRes.text() };
    }
    const { sha, content, encoding } = await metaRes.json();
    const existing = JSON.parse(Buffer.from(content, encoding).toString());

    // 2. 建立日期索引
    // 假設 data.json 預設結構為 { orders: [] }
    existing.orders = Array.isArray(existing.orders) ? existing.orders : [];

    // 3. 過濾掉同日期 & 同 partnerId 的舊訂單
    const filtered = existing.orders.filter(o =>
      !(o.date === newOrder.date && o.partnerId === newOrder.partnerId)
    );

    // 4. 再 push 新訂單
    filtered.push(newOrder);

    // 5. 寫回 GitHub
    const putRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/data.json`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Upsert order ${newOrder.partnerId} @ ${newOrder.date}`,
          content: Buffer.from(
            JSON.stringify({ ...existing, orders: filtered }, null, 2)
          ).toString('base64'),
          sha,
          branch: BRANCH
        })
      }
    );
    if (!putRes.ok) {
      return { statusCode: putRes.status, body: await putRes.text() };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, orders: filtered })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: e.message })
    };
  }
};
