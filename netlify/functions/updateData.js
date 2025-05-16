// netlify/functions/updateData.js
const TOKEN  = process.env.GITHUB_TOKEN;
const REPO   = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 解析前端傳來的新 JSON 片段
  let patch;
  try {
    patch = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  try {
    // 1. 先拿現有的 data.json metadata（含 sha）和內容
    const metaRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/data.json?ref=${BRANCH}`,
      { headers: { Authorization: `token ${TOKEN}` } }
    );
    if (!metaRes.ok) {
      return { statusCode: metaRes.status, body: await metaRes.text() };
    }
    const { sha, content, encoding } = await metaRes.json();
    const existing = JSON.parse(Buffer.from(content, encoding).toString());

    // 2. 合併（淺拷貝）：newObj 覆蓋 existing 的屬性
    const merged = { ...existing, ...patch };

    // 3. 提交回 GitHub
    const putRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/data.json`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "Merge JSON via Netlify Function",
          content: Buffer.from(JSON.stringify(merged, null, 2)).toString('base64'),
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
      body: JSON.stringify({ success: true, data: merged })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: e.message })
    };
  }
};
