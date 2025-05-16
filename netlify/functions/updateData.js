// netlify/functions/updateData.js
const TOKEN  = process.env.GITHUB_TOKEN;
const REPO   = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let newData;
  try {
    newData = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  try {
    // 1. 取 SHA
    const metaRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/data.json?ref=${BRANCH}`,
      { headers: { Authorization: `token ${TOKEN}` } }
    );
    if (!metaRes.ok) {
      return { statusCode: metaRes.status, body: await metaRes.text() };
    }
    const { sha } = await metaRes.json();

    // 2. PUT 更新
    const putBody = {
      message: "Update data.json via Netlify Function",
      content: Buffer.from(JSON.stringify(newData, null, 2)).toString('base64'),
      sha,
      branch: BRANCH
    };
    const putRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/data.json`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(putBody)
      }
    );
    if (!putRes.ok) {
      return { statusCode: putRes.status, body: await putRes.text() };
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
