// =============================================
// ⚙️  CẤU HÌNH — thay đổi các giá trị này
// =============================================
const CLOUD_NAME    = "dzuzeuzmv";
const UPLOAD_PRESET = "album_upload";
const FOLDER        = "album";
const SESSION_KEY   = "album_auth";
// =============================================

// Category label map
const CAT_LABELS = {
  food:"🍜 Thức ăn", outing:"🚶 Đi chơi", study:"📚 Học tập",
  vibe:"😭 Vô tri", happy:"🎉 Vui", memory:"💌 Kỷ niệm",
  night:"🌃 Ban đêm", sunset:"🌅 Hoàng hôn", random:"💤 Random"
};

let photos     = [];
let lbIndex    = 0;
let pendingDeleteId = null;
let selectedFiles   = [];
let selectedCategory = "";
let favorites  = JSON.parse(localStorage.getItem("fav_ids") || "[]");

// ── DOM refs ──
const loginScreen  = document.getElementById("loginScreen");
const loginInput   = document.getElementById("loginInput");
const loginBtn     = document.getElementById("loginBtn");
const loginError   = document.getElementById("loginError");
const appEl        = document.getElementById("app");
const gallery      = document.getElementById("gallery");
const loadingEl    = document.getElementById("loading");
const emptyState   = document.getElementById("emptyState");
const photoCount   = document.getElementById("photoCount");
const fabBtn       = document.getElementById("fabBtn");
const uploadModal  = document.getElementById("uploadModal");
const deleteModal  = document.getElementById("deleteModal");
const dropzone     = document.getElementById("dropzone");
const fileInput    = document.getElementById("fileInput");
const previewGrid  = document.getElementById("previewGrid");
const dzText       = document.getElementById("dzText");
const captionInput = document.getElementById("captionInput");
const passwordInput= document.getElementById("passwordInput");
const doUploadBtn  = document.getElementById("doUpload");
const progressWrap = document.getElementById("progressWrap");
const progressBar  = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const uploadError  = document.getElementById("uploadError");
const lightbox     = document.getElementById("lightbox");
const lbImg        = document.getElementById("lbImg");
const lbCaption    = document.getElementById("lbCaption");
const lbDate       = document.getElementById("lbDate");
const lbClose      = document.getElementById("lbClose");
const lbPrev       = document.getElementById("lbPrev");
const lbNext       = document.getElementById("lbNext");
const toast        = document.getElementById("toast");
const deleteError  = document.getElementById("deleteError");
const deletePassInput = document.getElementById("deletePasswordInput");

// ── LOGIN ──────────────────────────────────────
function checkAuth() {
  const stored = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
  return stored === "1";
}

function doLogin() {
  const val = loginInput.value;
  // Kiểm tra qua Netlify Function (gửi password lên server validate)
  // Để không lộ password trong source, ta validate gián tiếp bằng cách thử delete một ảnh giả
  // Hoặc đơn giản hơn: dùng hash
  // Ở đây ta hash SHA-256 phía client rồi so sánh với hash cứng
  // Hash SHA-256 của password bạn — đổi lại cho đúng!
  // Để tạo hash: https://emn178.github.io/online-tools/sha256.html
  const PASS_HASH = "YOUR_SHA256_HASH_HERE"; // ← thay hash SHA-256 password của bạn vào đây

  crypto.subtle.digest("SHA-256", new TextEncoder().encode(val)).then(buf => {
    const hash = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    if (hash === PASS_HASH || PASS_HASH === "YOUR_SHA256_HASH_HERE") {
      // Nếu chưa set hash, tạm thời bypass để dev (xóa điều kiện thứ 2 khi dùng thật)
      sessionStorage.setItem(SESSION_KEY, "1");
      loginScreen.classList.add("hidden");
      setTimeout(() => { loginScreen.style.display = "none"; }, 500);
      appEl.style.display = "block";
      loadPhotos();
    } else {
      loginInput.classList.add("shake");
      loginError.textContent = "Sai mật khẩu rồi 🔒";
      setTimeout(() => loginInput.classList.remove("shake"), 500);
    }
  });
}

loginBtn.onclick = doLogin;
loginInput.onkeydown = (e) => { if (e.key === "Enter") doLogin(); };

if (checkAuth()) {
  loginScreen.style.display = "none";
  appEl.style.display = "block";
  loadPhotos();
}

// ── LOAD PHOTOS ────────────────────────────────
async function loadPhotos() {
  loadingEl.style.display = "block";
  gallery.innerHTML = "";
  try {
    const res = await fetch("/.netlify/functions/get-photos");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    photos = data.resources || [];
    renderGallery();
  } catch(err) {
    console.error("loadPhotos:", err);
    showToast("Không tải được ảnh 😢", true);
  } finally {
    loadingEl.style.display = "none";
  }
}

// ── RENDER GALLERY ─────────────────────────────
function renderGallery() {
  gallery.innerHTML = "";
  photoCount.textContent = `${photos.length} KHOẢNH KHẮC`;
  emptyState.style.display = photos.length === 0 ? "block" : "none";

  photos.forEach((photo, index) => {
    gallery.appendChild(createCard(photo, index));
  });
}

function createCard(photo, index, isNew = false) {
  const card = document.createElement("div");
  card.className = "photo-card" + (isNew ? " new-card" : "");
  card.dataset.publicId = photo.public_id;

  const caption  = photo.context?.custom?.caption || "";
  const date     = new Date(photo.created_at).toLocaleDateString("vi-VN");
  const isFav    = favorites.includes(photo.public_id);

  // Dùng Cloudinary transformation để resize tự động
  const thumbUrl = getOptimizedUrl(photo.secure_url, 600);

  card.innerHTML = `
    <img src="${thumbUrl}" loading="lazy" alt="${caption}" class="loading-img">
    <div class="card-overlay">
      <div>
        <div class="card-caption">${caption || "✨"}</div>
        <div class="card-date">${date}</div>
      </div>
    </div>
    <button class="fav-btn${isFav ? " active" : ""}" title="Yêu thích">${isFav ? "❤️" : "🤍"}</button>
    <button class="btn-delete" title="Xóa ảnh">✕</button>
  `;

  const img = card.querySelector("img");
  img.onload = () => img.classList.remove("loading-img");
  img.onerror = () => img.classList.remove("loading-img");

  img.addEventListener("click", () => openLightbox(index));
  card.querySelector(".card-overlay").addEventListener("click", () => openLightbox(index));

  card.querySelector(".fav-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFav(photo.public_id, card.querySelector(".fav-btn"));
  });

  card.querySelector(".btn-delete").addEventListener("click", (e) => {
    e.stopPropagation();
    openDeleteModal(photo.public_id);
  });

  return card;
}

// Cloudinary auto-optimize URL
function getOptimizedUrl(url, w) {
  return url.replace("/upload/", `/upload/w_${w},f_auto,q_auto/`);
}

// ── FAVORITE ───────────────────────────────────
function toggleFav(public_id, btn) {
  const idx = favorites.indexOf(public_id);
  if (idx === -1) {
    favorites.push(public_id);
    btn.textContent = "❤️"; btn.classList.add("active");
  } else {
    favorites.splice(idx, 1);
    btn.textContent = "🤍"; btn.classList.remove("active");
  }
  localStorage.setItem("fav_ids", JSON.stringify(favorites));
}

// ── CATEGORY CHIPS ─────────────────────────────
document.querySelectorAll(".cat-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".cat-chip").forEach(c => c.classList.remove("active"));
    if (selectedCategory === chip.dataset.val) {
      selectedCategory = "";
    } else {
      selectedCategory = chip.dataset.val;
      chip.classList.add("active");
    }
  });
});

// ── UPLOAD MODAL ───────────────────────────────
fabBtn.onclick = () => uploadModal.classList.add("open");
document.getElementById("cancelUpload").onclick = closeUploadModal;
document.getElementById("closeUpload").onclick  = closeUploadModal;

function closeUploadModal() {
  uploadModal.classList.remove("open");
  selectedFiles = []; selectedCategory = "";
  fileInput.value = ""; previewGrid.innerHTML = "";
  captionInput.value = ""; passwordInput.value = "";
  uploadError.style.display = "none";
  progressWrap.style.display = "none";
  progressText.style.display = "none";
  progressBar.style.width = "0%";
  dzText.textContent = "Nhấn để chọn hoặc kéo thả ảnh vào đây";
  document.querySelectorAll(".cat-chip").forEach(c => c.classList.remove("active"));
}

// Dropzone
dropzone.addEventListener("click", (e) => { if (e.target !== fileInput) fileInput.click(); });
dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("dragover"); });
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", (e) => { e.preventDefault(); dropzone.classList.remove("dragover"); handleFiles([...e.dataTransfer.files]); });
fileInput.addEventListener("change", (e) => handleFiles([...e.target.files]));

// Paste ảnh Ctrl+V
document.addEventListener("paste", (e) => {
  if (!uploadModal.classList.contains("open")) return;
  const items = [...(e.clipboardData?.items || [])];
  const imgs = items.filter(i => i.type.startsWith("image/")).map(i => i.getAsFile());
  if (imgs.length > 0) handleFiles(imgs);
});

function handleFiles(files) {
  const imgs = files.filter(f => f.type.startsWith("image/"));
  if (imgs.length === 0) return;
  selectedFiles = [...selectedFiles, ...imgs];
  renderPreviews();
}

function renderPreviews() {
  previewGrid.innerHTML = "";
  dzText.textContent = `Đã chọn ${selectedFiles.length} ảnh`;
  selectedFiles.forEach((file, i) => {
    const item = document.createElement("div");
    item.className = "prev-item";
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    const rm = document.createElement("button");
    rm.className = "prev-remove";
    rm.textContent = "✕";
    rm.onclick = (e) => {
      e.stopPropagation();
      selectedFiles.splice(i, 1);
      renderPreviews();
    };
    item.appendChild(img); item.appendChild(rm);
    previewGrid.appendChild(item);
  });
}

// ── DO UPLOAD ──────────────────────────────────
doUploadBtn.onclick = async () => {
  if (selectedFiles.length === 0) { showUploadError("Chưa chọn ảnh nào 🥺"); return; }

  doUploadBtn.disabled = true;
  uploadError.style.display = "none";
  progressWrap.style.display = "block";
  progressText.style.display = "block";

  const caption  = captionInput.value.trim();
  const category = selectedCategory;
  const newlyUploaded = [];

  try {
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      progressText.textContent = `Đang upload ${i + 1}/${selectedFiles.length}...`;
      progressBar.style.width = `${(i / selectedFiles.length) * 100}%`;

      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", UPLOAD_PRESET);
      fd.append("folder", FOLDER);

      // Context: caption + category
      let ctx = [];
      if (caption)  ctx.push(`caption=${caption}`);
      if (category) ctx.push(`category=${category}`);
      if (ctx.length) fd.append("context", ctx.join("|"));

      fd.append("tags", FOLDER);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: fd }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      // ✅ FIX CHÍNH: thêm ảnh mới vào đầu mảng photos ngay lập tức
      newlyUploaded.push({
        public_id:  data.public_id,
        secure_url: data.secure_url,
        created_at: data.created_at || new Date().toISOString(),
        context: caption || category ? { custom: { caption, category } } : undefined
      });
    }

    progressBar.style.width = "100%";
    progressText.textContent = `Hoàn thành ${newlyUploaded.length} ảnh! 💌`;

    // ✅ Thêm ảnh mới vào đầu gallery NGAY LẬP TỨC, không cần reload
    newlyUploaded.forEach(photo => {
      photos.unshift(photo);
    });

    // Render ngay các card mới lên đầu gallery
    newlyUploaded.forEach(photo => {
      const index = photos.indexOf(photo);
      const card = createCard(photo, index, true); // isNew=true → animation popIn
      gallery.insertBefore(card, gallery.firstChild);
    });

    // Cập nhật số đếm + ẩn empty state
    photoCount.textContent = `${photos.length} KHOẢNH KHẮC`;
    emptyState.style.display = "none";

    showToast(`Đã đăng ${newlyUploaded.length} ảnh thành công 💌`, false, true);

    setTimeout(() => closeUploadModal(), 900);

    // Background reload sau 5s để đồng bộ index Cloudinary
    setTimeout(() => loadPhotos(), 5000);

  } catch(err) {
    console.error("Upload error:", err);
    showUploadError("Upload lỗi: " + err.message);
  } finally {
    doUploadBtn.disabled = false;
  }
};

function showUploadError(msg) {
  uploadError.textContent = msg;
  uploadError.style.display = "block";
}

// ── DELETE MODAL ───────────────────────────────
function openDeleteModal(public_id) {
  pendingDeleteId = public_id;
  deletePassInput.value = "";
  deleteError.style.display = "none";
  deleteModal.classList.add("open");
}

document.getElementById("cancelDelete").onclick = () => {
  deleteModal.classList.remove("open");
  pendingDeleteId = null;
};

document.getElementById("confirmDelete").onclick = async () => {
  const password = deletePassInput.value;
  if (!password) { deleteError.textContent = "Nhập mật khẩu đi nào 🔒"; deleteError.style.display = "block"; return; }
  if (!pendingDeleteId) return;

  const btn = document.getElementById("confirmDelete");
  btn.disabled = true; btn.textContent = "Đang xóa...";
  deleteError.style.display = "none";

  try {
    const res = await fetch("/.netlify/functions/delete-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_id: pendingDeleteId, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Xóa thất bại");

    // ✅ Xóa khỏi mảng & DOM ngay lập tức
    const idx = photos.findIndex(p => p.public_id === pendingDeleteId);
    if (idx !== -1) photos.splice(idx, 1);
    const cardEl = gallery.querySelector(`[data-public-id="${pendingDeleteId}"]`);
    if (cardEl) {
      cardEl.style.transition = "opacity 0.3s, transform 0.3s";
      cardEl.style.opacity = "0";
      cardEl.style.transform = "scale(0.9)";
      setTimeout(() => cardEl.remove(), 300);
    }

    photoCount.textContent = `${photos.length} KHOẢNH KHẮC`;
    if (photos.length === 0) emptyState.style.display = "block";

    showToast("Đã xóa ảnh rồi 🗑️");
    deleteModal.classList.remove("open");
    pendingDeleteId = null;

  } catch(err) {
    deleteError.textContent = err.message;
    deleteError.style.display = "block";
  } finally {
    btn.disabled = false; btn.textContent = "Xóa đi 🗑️";
  }
};

// ── LIGHTBOX ───────────────────────────────────
function openLightbox(index) {
  lbIndex = index;
  updateLightbox();
  lightbox.classList.add("open");
}

function updateLightbox() {
  const photo = photos[lbIndex];
  lbImg.style.opacity = "0";
  lbImg.src = getOptimizedUrl(photo.secure_url, 1400);
  lbImg.onload = () => { lbImg.style.opacity = "1"; };
  lbCaption.textContent = photo.context?.custom?.caption || "";
  lbDate.textContent = new Date(photo.created_at).toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric" });
  lbPrev.style.display = lbIndex > 0 ? "flex" : "none";
  lbNext.style.display = lbIndex < photos.length - 1 ? "flex" : "none";
}

lbClose.onclick = () => lightbox.classList.remove("open");
lbPrev.onclick  = () => { if (lbIndex > 0) { lbIndex--; updateLightbox(); } };
lbNext.onclick  = () => { if (lbIndex < photos.length - 1) { lbIndex++; updateLightbox(); } };

// Keyboard
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "ArrowLeft")  lbPrev.click();
  if (e.key === "ArrowRight") lbNext.click();
  if (e.key === "Escape")     lightbox.classList.remove("open");
});

// Swipe lightbox trên mobile
let touchStartX = 0;
lightbox.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener("touchend",   (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) { dx < 0 ? lbNext.click() : lbPrev.click(); }
});

// Close on backdrop
uploadModal.addEventListener("click", (e) => { if (e.target === uploadModal) closeUploadModal(); });
deleteModal.addEventListener("click", (e) => { if (e.target === deleteModal) deleteModal.classList.remove("open"); });
lightbox.addEventListener("click",    (e) => { if (e.target === lightbox)    lightbox.classList.remove("open"); });

// ── TOAST ──────────────────────────────────────
function showToast(msg, error = false, success = false) {
  toast.textContent = msg;
  toast.className = "toast show" + (error ? " error" : success ? " success" : "");
  setTimeout(() => { toast.className = "toast"; }, 3200);
}
