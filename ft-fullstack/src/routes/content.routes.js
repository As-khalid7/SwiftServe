const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, "..", "..", "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `logo-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  }
});

// ---------- GET /api/content — public ----------
router.get("/", (req, res) => {
  const row = db.prepare("SELECT content_json, updated_at FROM site_content WHERE id = 1").get();
  if (!row) return res.status(404).json({ error: "لا يوجد محتوى محفوظ بعد." });
  res.json({ content: JSON.parse(row.content_json), updated_at: row.updated_at });
});

// ---------- PUT /api/content — admin only ----------
router.put("/", requireAuth, requireAdmin, (req, res) => {
  const newContent = req.body;
  if (!newContent || typeof newContent !== "object") {
    return res.status(400).json({ error: "بيانات المحتوى غير صالحة." });
  }

  db.prepare(
    "UPDATE site_content SET content_json = ?, updated_at = datetime('now') WHERE id = 1"
  ).run(JSON.stringify(newContent));

  res.json({ message: "تم حفظ التعديلات بنجاح.", content: newContent });
});

// ---------- POST /api/content/logo — admin only ----------
router.post("/logo", requireAuth, requireAdmin, upload.single("logo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "لم يتم رفع أي ملف صالح (PNG, JPG, SVG, WEBP فقط، حتى 2MB)." });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
