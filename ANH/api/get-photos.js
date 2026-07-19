const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const result = await cloudinary.search
      .expression("folder:album")
      .with_field("context")
      .sort_by("created_at", "desc")
      .max_results(100)
      .execute();

    res.status(200).json({ resources: result.resources });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}