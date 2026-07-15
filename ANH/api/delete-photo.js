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

  const { public_id, password } = req.body;

  if (password !== process.env.ALBUM_PASSWORD) {
    return res.status(401).json({
      error: "Sai mật khẩu rồi 🔒",
    });
  }

  if (!public_id) {
    return res.status(400).json({
      error: "Thiếu public_id",
    });
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id);

    return res.status(200).json({
      result,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};