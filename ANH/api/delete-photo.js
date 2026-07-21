const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  // Check password
  let body;
  try {
    body = req.body;
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  const { public_id, password } = body;

  if (process.env.ALBUM_PASSWORD && password !== process.env.ALBUM_PASSWORD) {
    res.status(401).json({ error: "Sai mật khẩu rồi 🔒" });
    return;
  }

  if (!public_id) {
    res.status(400).json({ error: "Thiếu public_id" });
    return;
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id);
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}