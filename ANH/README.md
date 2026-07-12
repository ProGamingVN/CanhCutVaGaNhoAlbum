# 🐧 Cánh Cụt & Gà Nhỏ - Memory Album Website

A beautiful, simple, and secure photo album website to cherish precious memories between two special people. Built with vanilla HTML/CSS/JavaScript, Netlify Functions, and Cloudinary storage.

## ✨ Features

- **Secure Password Protection** - Protect your memories with a password (hashed verification)
- **Beautiful, Warm UI** - Thoughtfully designed interface with warm colors and elegant typography
- **Responsive Design** - Looks perfect on mobile, tablet, and desktop
- **Dark/Light Mode** - Automatically follows system preference
- **Photo Upload** - Drag & drop or click to upload multiple images
- **Image Optimization** - Automatic optimization via Cloudinary (format, quality, resizing)
- **Captions & Categories** - Add descriptions and organize by tags (food, outing, study, etc.)
- **Favorites System** - Mark photos as favorites (stored in localStorage)
- **Lightbox View** - Fullscreen image viewing with swipe/keyboard navigation
- **Delete Protection** - Password-protected deletion to prevent accidental loss
- **Toast Notifications** - Friendly feedback for user actions
- **Lazy Loading** - Images load as they scroll into view
- **Netlify Functions** - Secure backend operations without managing a server
- **100% Client-Side Rendering** - No build step required for basic functionality
## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [How It Works](#-how-it-works)
- [Customization](#-customization)
- [Browser Support](#-browser-support)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)
## 🚀 Demo

See it in action: [https://canhcut-ganho-album.netlify.app](https://canhcut-ganho-album.netlify.app) (example URL)
## 🛠️ Getting Started

### Prerequisites

- A free [Cloudinary](https://cloudinary.com/) account (for image storage)
- A free [Netlify](https://www.netlify.com/) account (for hosting and functions)
- Node.js >= 14 (for local development, optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/canhcut-ganho-album.git
   cd canhcut-ganho-album
   ```

2. **Install dependencies** (only needed for local development with Netlify CLI)
   ```bash
   npm install
   ```

### Configuration

#### Cloudinary Setup

1. Sign up at [https://cloudinary.com/](https://cloudinary.com/)
2. From your Dashboard, note:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Create an **unsigned upload preset**:
   - Go to Settings → Upload
   - Scroll to "Upload presets" → "Add upload preset"
   - Set:
     - Signing Mode: **Unsigned**
     - Folder: `album` (or change the `FOLDER` constant in `js/main.js`)
     - Allow unsupported image files: ✅
   - Save and note the preset name

#### Netlify Functions Setup

The project uses Netlify Functions for secure operations. You'll need to set these environment variables:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ALBUM_PASSWORD` (or better: `NETLIFY_PASSWORD_HASH` for bcrypt hash - see security notes)

### Important Security Note

> **Never commit your Cloudinary credentials or any secrets to git!**  
> This project uses environment variables for all sensitive data. The `.gitignore` file is configured to prevent accidental commits of `.env` files.
## 🚀 Deployment

### Deploy to Netlify (Recommended)

1. **Fork or clone** this repository
2. **Create a new site** on Netlify:
   - Click "New site from Git"
   - Connect your repository
   - Set build command: `npm run build` (or leave blank if no build step needed)
   - Set publish directory: `.` (root directory)
3. **Add Environment Variables** in Site Settings → Build & Deploy → Environment:
   - `CLOUDINARY_CLOUD_NAME` = your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` = your Cloudinary API key
   - `CLOUDINARY_API_SECRET` = your Cloudinary API secret
   - `ALBUM_PASSWORD` = your desired password (plain text) **OR**
   - For better security, use a bcrypt hash:
     - Generate hash: `echo -n "your_password" | bcrypt` (requires bcrypt CLI)
     - Store as `NETLIFY_PASSWORD_HASH` = `$2b$10$...`

4. **Deploy!** Netlify will automatically build and deploy your site.

### Local Development

```bash
# Install Netlify CLI globally (if not already)
npm install -g netlify-cli

# Run locally
netlify dev
```

Your site will be available at `http://localhost:8888`
## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | `dzuzeuzmv` |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | `abcdefghijklmnopqrstuvwxyz1234567890` |
| `ALBUM_PASSWORD` | Plain text password for simple protection (NOT recommended for production) | `mysecret123` |
| `NETLIFY_PASSWORD_HASH` | Bcrypt hash of password (more secure) | `$2b$10$...` |
| `UPLOAD_PRESET` | Your Cloudinary unsigned upload preset name | `album_upload` |
| `FOLDER` | Cloudinary folder where images are stored | `album` |

> 💡 **Security Recommendation**: Use `NETL_PASSWORD_HASH` instead of `ALBUM_PASSWORD`. See the [Security](#section) below.
## 🛠️ How It Works

### Architecture

```
Frontend (HTML/CSS/JS) 
     ↓ (API calls)
Netlify Functions (serverless) 
     ↓ (REST API)
Cloudinary (media storage)
```

### Data Flow

1. **Authentication**: 
   - Password is hashed client-side (SHA-256) and compared against a stored hash
   - For enhanced security, use the `verify-password` function that checks a bcrypt hash server-side

2. **Image Loading**:
   - `get-photos.js` function queries Cloudinary for all images in the configured folder
   - Returns metadata including secure URLs, captions, dates, and custom metadata

3. **Image Upload**:
   - Files sent directly to Cloudinary's unsigned upload endpoint
   - Metadata (caption, category) sent as context
   - Upon success, client optimistically adds image to local cache

4. **Image Deletion**:
   - Request sent to `delete-photo.js` function
   - Function verifies password before calling Cloudinary's destroy API
   - On success, client removes image from gallery

### Security

- **Password Protection**: 
  - Original implementation used client-side SHA-256 hash comparison (in `login()` function)
  - Enhanced security: Use `/netlify/functions/verify-password` (to be implemented) for bcrypt verification
  
- **Environment Secrets**: 
  - All API keys and secrets stored as Netlify environment variables
  - Never exposed in client-side code

- **CORS Protection**: 
  - Netlify functions can be restricted to specific origins
  - Consider tightening CORS in `netlify.toml` for production

- **Rate Limiting**: 
  - Consider adding rate-limit middleware to prevent abuse
  - Netlify provides built-in DDoS protection
## 🎨 Customization

### Changing Colors/Theme

Modify the CSS variables in `css/style.css` under the `:root` selector:

```css
:root {
  --bg: --bg:     #F3EBD8; /* Light background */
  --bg2:    #EDE0C8; /* Lighter accent */
  --card:   #FDFAF3; /* Card background */
  --text:   #1C0F06; /* Primary text */
  --muted:  #7A5C42; /* Secondary text */
  --accent: #B8633A; /* Primary accent */
  --accent2:#D4956A; /* Secondary accent */
  --border: #DFD0B8; /* Border color */
  --white:  #FFFDF8; /* White variant */
  --shadow: rgba(28,15,6,0.12); /* Shadow */
}
```

Dark mode variables are defined in the `@media (prefers-color-scheme: dark)` block.

### Changing Fonts

The site uses:
- **Playfair Display** - for headings
- **Cormorant Garamond** - for body text

To change, update the Google Fonts link in `index.html` and adjust `font-family` in CSS.

### Modifying Categories

Edit the `CAT_LABELS` object in `js/main.js`:

```javascript
const CAT_LABELS = {
  food:"🍜 Thức ăn", 
  outing:"🚶 Đi chơi", 
  study:"📚 Học tập",
  vibe:"😭 Vô tri", 
  happy:"🎉 Vui", 
  memory:"💌 Kỷ niệm",
  night:"🌃 Ban đêm", 
  sunset:"🌅 Hoàng hôn", 
  random:"💤 Random"
};
```

Make sure to update both the key (used as value) and the display text.

### Changing Folder/Upload Preset

Modify the constants at the top of `js/main.js`:
```javascript
const CLOUD_NAME    = "your-cloud-name";
const UPLOAD_PRESET = "your-upload-preset";
const FOLDER        = "your-folder-name";
```
## 🌐 Browser Support

| Browser | Supported |
|---------|-----------|
| Chrome | ✅ Latest |
| Firefox | ✅ Latest |
| Safari | ✅ Latest |
| Edge | ✅ Latest |
| Opera | ✅ Latest |

The site uses modern CSS features (CSS Grid, Flexbox, CSS Variables) and modern JavaScript (arrow functions, fetch API, async/await). It should work in all evergreen browsers.
## 🐛 Troubleshooting

### Images Not Loading

1. Check browser console for CORS errors
2. Verify Cloudinary folder name matches `FOLDER` constant
3. Ensure images are actually uploaded to that folder in Cloudinary
4. Check network tab for 404/403 errors on image URLs

### Upload Fails

1. Verify unsigned upload preset is correctly set in Cloudinary
2. Check that `UPLOAD_PRESET` matches exactly
3. Ensure file types are allowed (images only)
4. Check console for detailed error messages from Cloudinary

### Authentication Issues

If using the enhanced password verification (bcrypt):
1. Ensure `NETLIFY_PASSWORD_HASH` is set correctly
2. Verify the `verify-password` function is deployed (see below)
3. Check function logs in Netlify dashboard

### Function Deployment Issues

If you add custom functions (like password verification):
1. Make sure they're in `/netlify/functions/`
2. Deploy with `netlify deploy --prod` or push to GitHub connected site
3. Check function logs for errors
## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some amazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to:
- Update tests as appropriate
- Keep dependencies updated
- Follow the existing code style
## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
## 🙏 Acknowledgments

- [Cloudinary](https://cloudinary.com/) for excellent image management
- [Netlify](https://www.netlify.com/) for fantastic hosting and serverless functions
- [Google Fonts](https://fonts.google.com/) for the beautiful typography
- Inspired by the precious moments shared between two special people

---

**❤️ Remember**: This application is designed to protect and celebrate your personal memories. Always keep your credentials secure and backup your precious photos elsewhere as well.

*"The best things in life are the people we love, the places we've been, and the memories we've made along the way."*
