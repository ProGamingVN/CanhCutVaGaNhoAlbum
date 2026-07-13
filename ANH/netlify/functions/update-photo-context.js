// netlify/functions/update-photo-context.js
// Đặt file này ở: netlify/functions/update-photo-context.js

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

  // Parse JSON body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { public_id, context } = body;

  if (!public_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Thiếu public_id" }),
    };
  }

  try {
    // Prepare the context update
    let cloudinaryContext = [];
    if (context) {
      // Context comes as a string like "caption=test|category=food"
      const contextParts = context.split('|');
      contextParts.forEach(part => {
        const [key, value] = part.split('=');
        if (key && value) {
          // URL decode the value in case it was encoded
          const decodedValue = decodeURIComponent(value);
          cloudinaryContext.push(`${key}=${decodedValue}`);
        }
      });
    }

    // Update the resource with new context
    const result = await cloudinary.v2.api.update(
      public_id,
      {
        context: cloudinaryContext,
        // Overwrite existing context
        type: 'upload'
      }
    );

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