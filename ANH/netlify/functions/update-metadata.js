// netlify/functions/update-metadata.js
// Đặt file này ở: netlify/functions/update-metadata.js

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

  const { public_id, caption, category, date, password } = body;

  // Validate required fields
  if (!public_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Thiếu public_id" }),
    };
  }

  if (password !== process.env.ALBUM_PASSWORD) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Sai mật khẩu rồi 🔒" }),
    };
  }

  try {
    // Build context update
    const contextUpdates = [];

    if (caption !== undefined && caption !== null) {
      contextUpdates.push(`caption=${encodeURIComponent(caption)}`);
    }

    if (category !== undefined && category !== null) {
      contextUpdates.push(`category=${encodeURIComponent(category)}`);
    }

    if (date !== undefined && date !== null) {
      contextUpdates.push(`date=${encodeURIComponent(date)}`);
    }

    // Get existing resource to preserve other context fields
    let existingContext = {};
    try {
      const resource = await cloudinary.v2.api.resource(public_id);
      if (resource.context) {
        if (typeof resource.context === 'string') {
          // Parse string context like "key1=value1|key2=value2"
          const pairs = resource.context.split('|');
          pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key && value !== undefined) {
              existingContext[decodeURIComponent(key)] = decodeURIComponent(value);
            }
          });
        } else if (typeof resource.context === 'object') {
          // Already an object
          existingContext = { ...resource.context };
        }
      }
    } catch (err) {
      // If we can't get existing resource, continue with empty context
      console.warn("Could not fetch existing resource:", err.message);
    }

    // Update context with new values
    contextUpdates.forEach(update => {
      const [key, value] = update.split('=');
      if (key && value !== undefined) {
        existingContext[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });

    // Format context back to string
    const contextString = Object.entries(existingContext)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('|');

    // Update the resource
    const result = await cloudinary.v2.api.update(public_id, {
      context: contextString || undefined
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};