// netlify/functions/getData.js
exports.handler = async () => {
  try {
    let resp
    try {
      resp = await client.query(
        q.Get(q.Ref(q.Collection('configs'), 'data'))
      )
    } catch (e) {
      // 如果是 NotFound，就先建立一筆空的
      if (e.requestResult.statusCode === 404) {
        await client.query(
          q.Create(
            q.Ref(q.Collection('configs'), 'data'),
            { data: { items: [] } }
          )
        )
        resp = { data: { items: [] } }
      } else {
        throw e
      }
    }
    return { statusCode: 200, body: JSON.stringify(resp.data) }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ message: e.message }) }
  }
}
