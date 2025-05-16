// netlify/functions/updateData.js
const fetch = require('node-fetch');
const TOKEN = process.env.GITHUB_TOKEN;
const REPO  = process.env.GITHUB_REPO;
const BRANCH= process.env.GITHUB_BRANCH;

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
    // 1. 先拿 SHA
    const getUrl = `https://api.github.com/repos/${REPO}/contents/data.json?ref=${BRANCH}`;
    const getRes = await fetch(getUrl, {
      headers: { Authorization: `token ${TOKEN}` }
    });
    if (!getRes.ok) {
      return { statusCode: getRes.status, body: await getRes.text() };
    }
    const { sha } = await getRes.json();

    // 2. 更新檔案
    const putUrl = `https://api.github.com/repos/${REPO}/contents/data.json`;
    const body = {
      message: "Update data.json via Netlify Function",
      content: Buffer.from(JSON.stringify(newData, null, 2)).toString('base64'),
      sha,
      branch: BRANCH
    };
    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!putRes.ok) {
      return { statusCode: putRes.status, body: await putRes.text() };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true })
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
