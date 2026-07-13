// netlify/functions/edit-photo.js
// Đặt file này ở: netlify/functions/edit-photo.js

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

  // Parse body
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

  // Build context string for custom metadata
  let contextParts = [];
  if (caption) contextParts.push(`caption=${caption}`);
  if (category) contextParts.push(`category=${category}`);
  const context = contextParts.length ? contextParts.join("|") : "";

  try {
    // Update resource with context
    const result = await cloudinary.api.update(public_id, {
      context: context,
      // Overwrite existing context? This will replace.
      type: "upload",
      resource_type: "image"
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ result })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};