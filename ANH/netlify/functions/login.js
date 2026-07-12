
const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { password } = data;
  if (!password) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Password required' }) };
  }

  const expectedHash = process.env.ALBUM_PASSWORD_HASH; // expect SHA-256 hex
  if (!expectedHash) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfigured' }) };
  }

  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash === expectedHash) {
    // set a cookie or return token; we'll just return success and let client set sessionStorage
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
      headers: { 'Set-Cookie': 'auth=1; Path=/; HttpOnly' } // optional
    };
  } else {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid password' }) };
  }
};

