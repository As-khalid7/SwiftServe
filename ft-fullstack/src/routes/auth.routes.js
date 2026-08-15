const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { sendPasswordResetEmail } = require("../utils/mailer");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------- POST /api/auth/register ----------
router.post("/register", (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبة." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "صيغة البريد الإلكتروني غير صحيحة." });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: "هذا البريد الإلكتروني مسجّل مسبقاً." });
  }

  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')")
    .run(String(name).trim(), normalizedEmail, hash);

  const user = { id: info.lastInsertRowid, name, email: normalizedEmail, role: "user" };
  const token = signToken(user);
  res.status(201).json({ token, user });
});

// ---------- POST /api/auth/login ----------
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

// ---------- GET /api/auth/me ----------
router.get("/me", requireAuth, (req, res) => {
  const user = db
    .prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?")
    .get(req.user.id);
  if (!user) return res.status(404).json({ error: "المستخدم غير موجود." });
  res.json({ user });
});

// ---------- POST /api/auth/forgot-password ----------
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};
  const generic = {
    message: "إذا كان البريد الإلكتروني مسجلاً لدينا، سيصلك رابط إعادة تعيين كلمة المرور."
  };

  if (!email) return res.status(400).json({ error: "البريد الإلكتروني مطلوب." });

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail);

  // Always respond generically so we don't leak which emails are registered.
  if (!user) return res.json(generic);

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expires = Date.now() + 60 * 60 * 1000; // 1 hour

  db.prepare(
    "UPDATE users SET reset_token_hash = ?, reset_token_expires = ? WHERE id = ?"
  ).run(tokenHash, expires, user.id);

  const resetLink = `${process.env.APP_URL || "http://localhost:3000"}/reset-password.html?token=${rawToken}&email=${encodeURIComponent(
    normalizedEmail
  )}`;

  try {
    await sendPasswordResetEmail(normalizedEmail, resetLink);
  } catch (err) {
    console.error("Failed to send reset email:", err.message);
  }

  res.json(generic);
});

// ---------- POST /api/auth/reset-password ----------
router.post("/reset-password", (req, res) => {
  const { email, token, password } = req.body || {};
  if (!email || !token || !password) {
    return res.status(400).json({ error: "بيانات إعادة التعيين غير مكتملة." });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail);

  if (!user || !user.reset_token_hash || !user.reset_token_expires) {
    return res.status(400).json({ error: "رابط إعادة التعيين غير صالح." });
  }
  if (Date.now() > user.reset_token_expires) {
    return res.status(400).json({ error: "انتهت صلاحية رابط إعادة التعيين. اطلب رابطاً جديداً." });
  }

  const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
  if (tokenHash !== user.reset_token_hash) {
    return res.status(400).json({ error: "رابط إعادة التعيين غير صالح." });
  }

  const newHash = bcrypt.hashSync(password, 10);
  db.prepare(
    "UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_token_expires = NULL WHERE id = ?"
  ).run(newHash, user.id);

  res.json({ message: "تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن." });
});

module.exports = router;
