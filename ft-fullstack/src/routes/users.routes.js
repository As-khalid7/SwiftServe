const express = require("express");
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// ---------- GET /api/users — admin only ----------
router.get("/", requireAuth, requireAdmin, (req, res) => {
  const users = db
    .prepare("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC")
    .all();
  res.json({ users });
});

// ---------- PATCH /api/users/:id/role — admin only (promote/demote) ----------
router.patch("/:id/role", requireAuth, requireAdmin, (req, res) => {
  const { role } = req.body || {};
  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ error: "الدور غير صالح (user أو admin فقط)." });
  }
  const target = db.prepare("SELECT id FROM users WHERE id = ?").get(req.params.id);
  if (!target) return res.status(404).json({ error: "المستخدم غير موجود." });

  db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, req.params.id);
  res.json({ message: "تم تحديث صلاحية المستخدم." });
});

module.exports = router;
