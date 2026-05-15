// netlify/functions/delete-photo.js
// Đặt file này ở: netlify/functions/delete-photo.js

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Check password
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { public_id, password } = body;

  if (password !== process.env.ALBUM_PASSWORD) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Sai mật khẩu rồi 🔒" }),
    };
  }

  if (!public_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Thiếu public_id" }),
    };
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return {
      statusCode: 200,
      body: JSON.stringify({ result }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
