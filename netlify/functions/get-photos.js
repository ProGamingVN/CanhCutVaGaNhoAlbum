// netlify/functions/get-photos.js
// Đặt file này ở: netlify/functions/get-photos.js

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { cursor } = event.queryStringParameters || {};

  try {
    let search = cloudinary.search
      .expression(`folder:album`)
      .with_field("context")
      .sort_by("created_at", "desc")
      .max_results(100);

    if (cursor) {
      search = search.next_cursor(cursor);
    }

    const result = await search.execute();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resources: result.resources,
        next_cursor: result.next_cursor || null
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};