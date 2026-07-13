// netlify/functions/edit-photo.js
// Đặt file này ở: netlify/functions/edit-photo.js

const cloudinary = require("cloudinary").v2;
const fetch = require('node-fetch'); // Node.js fetch API

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { public_id, caption, category } = body;

  if (!public_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Thiếu public_id" }),
    };
  }

  // Prepare context string
  let ctx = [];
  if (caption)  ctx.push(`caption=${caption}`);
  if (category) ctx.push(`category=${category}`);
  const contextStr = ctx.join("|");

  // Cloudinary credentials
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;

  if (!api_key || !api_secret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing Cloudinary credentials" }),
    };
  }

  // Prepare basic auth header
  const auth = Buffer.from(`${api_key}:${api_secret}`).toString('base64');

  // Admin API endpoint to update resource
  const url = `https://api.cloudinary.com/v1_1/${cloud_name}/resources/image/${public_id}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        context: contextStr
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorData.error || 'Failed to update photo' })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ result: data })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
