// netlify/functions/login.js
// Đặt file này ở: netlify/functions/login.js

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { password } = body;
  const expectedPassword = process.env.ALBUM_PASSWORD;

  if (!password || password !== expectedPassword) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Sai mật khẩu rồi 🔒" })
    };
  }

  // Login successful
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};