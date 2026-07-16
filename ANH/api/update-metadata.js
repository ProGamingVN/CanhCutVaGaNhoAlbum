const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { public_id, caption, category, date, password } = req.body;

  if (!public_id) {
    return res.status(400).json({
      error: "Thiếu public_id",
    });
  }

  if (password !== process.env.ALBUM_PASSWORD) {
    return res.status(401).json({
      error: "Sai mật khẩu rồi 🔒",
    });
  }

  try {
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

    let existingContext = {};

    try {
      const resource = await cloudinary.api.resource(public_id);

      if (resource.context) {
        if (typeof resource.context === "string") {
          const pairs = resource.context.split("|");

          pairs.forEach((pair) => {
            const [key, value] = pair.split("=");

            if (key && value !== undefined) {
              existingContext[decodeURIComponent(key)] =
                decodeURIComponent(value);
            }
          });
        } else if (typeof resource.context === "object") {
          existingContext = { ...resource.context };
        }
      }
    } catch (err) {
      console.warn("Could not fetch existing resource:", err.message);
    }

    contextUpdates.forEach((update) => {
      const [key, value] = update.split("=");

      if (key && value !== undefined) {
        existingContext[decodeURIComponent(key)] =
          decodeURIComponent(value);
      }
    });

    const contextString = Object.entries(existingContext)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("|");

    const result = await cloudinary.api.update(public_id, {
      context: contextString || undefined,
    });

    return res.status(200).json({
      result,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};