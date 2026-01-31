// server.js — L19 Card API (MYSQL2 + JWT) — Render + Aiven SSL ✅
// ------------------------------------------------------------
// ✅ API routes: /api/login, /api/me, /api/allcards, /api/addcard, /api/cards/:id
// ✅ Aiven MySQL SSL support
// ✅ CORS supports localhost + FRONTEND_URL
// ✅ API-only 404 handler
//
// Render ENV (Backend):
// PORT=10000 (Render will provide) or 3001 local
// JWT_SECRET=...
// DB_HOST=...
// DB_PORT=...
// DB_USER=...
// DB_PASSWORD=...
// DB_NAME=defaultdb
// FRONTEND_URL=https://<your-frontend-domain>
//
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

/* =========================
   ENV
========================= */
const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET = String(process.env.JWT_SECRET || "dev_secret_change_me").trim();
const FRONTEND_URL = String(process.env.FRONTEND_URL || "").trim();

/* =========================
   Middleware
========================= */
app.use(express.json());

/* =========================
   CORS
========================= */
const allowedOrigins = [
  "http://localhost:3000",
//   process.env.REACT_APP_API_URL,
  FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // Postman/curl
      if (allowedOrigins.includes(origin)) return cb(null, true);
      if (origin.endsWith(".vercel.app")) return cb(null, true); // previews
      return cb(null, true); // deployment-friendly
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* =========================
   DB POOL (AIVEN SSL ✅)
========================= */
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: false
  }
});


/* =========================
   Helpers
========================= */
function toIntId(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function safeStatus(status) {
  const s = String(status || "ACTIVE").toUpperCase();
  return ["ACTIVE", "COMPLETED", "ARCHIVED"].includes(s) ? s : "ACTIVE";
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET); // { userId, username, role }
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

async function getAccountByUsername(username) {
  const [rows] = await db.execute(
    `SELECT account_id, username, password_hash, role
     FROM app_accounts
     WHERE username = ?
     LIMIT 1`,
    [username]
  );
  return rows[0] || null;
}

/* =========================
   Root + Health
========================= */
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "L19 Cards API running ✅" });
});

app.get("/api/health", async (_req, res) => {
  try {
    await db.execute("SELECT 1");
    res.json({ ok: true, api: true, port: PORT });
  } catch (e) {
    res.status(500).json({ ok: false, api: true, error: String(e.message) });
  }
});

/* =========================
   Auth
========================= */
app.post("/api/login", async (req, res) => {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "").trim();

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = await getAccountByUsername(username);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.account_id, username: user.username, role: user.role || "USER" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: "Login error", details: String(e.message) });
  }
});

app.get("/api/me", requireAuth, (req, res) => {
  res.json(req.user);
});

/* =========================
   Cards
========================= */

// list all cards
app.get("/api/allcards", async (_req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT card_id AS id, title, module_name, module_code, description, status,
              account_id, created_at, updated_at
       FROM app_cards
       ORDER BY card_id DESC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e.message) });
  }
});

// read one card
app.get("/api/cards/:id", async (req, res) => {
  const id = toIntId(req.params.id);
  if (!id) return res.status(404).json({ error: "Not found" });

  const [rows] = await db.execute(
    `SELECT card_id AS id, title, module_name, module_code, description, status,
            account_id, created_at, updated_at
     FROM app_cards
     WHERE card_id = ?
     LIMIT 1`,
    [id]
  );

  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

// create card (requires JWT)
app.post("/api/addcard", requireAuth, async (req, res) => {
  try {
    const { title, module_name, module_code, description, status } = req.body || {};

    if (!title || !module_name || !module_code) {
      return res.status(400).json({ error: "Missing required fields: title, module_name, module_code" });
    }

    const [r] = await db.execute(
      `INSERT INTO app_cards (title, module_name, module_code, description, status, account_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        String(title).trim(),
        String(module_name).trim(),
        String(module_code).trim(),
        description ? String(description) : null,
        safeStatus(status),
        req.user.userId
      ]
    );

    return res.status(201).json({ ok: true, id: r.insertId });
  } catch (e) {
    return res.status(500).json({ error: String(e.message) });
  }
});

// update card (owner only)
app.put("/api/cards/:id", requireAuth, async (req, res) => {
  try {
    const id = toIntId(req.params.id);
    if (!id) return res.status(404).json({ error: "Not found" });

    const [own] = await db.execute(
      `SELECT account_id FROM app_cards WHERE card_id=? LIMIT 1`,
      [id]
    );
    if (!own[0]) return res.status(404).json({ error: "Not found" });

    if (Number(own[0].account_id) !== Number(req.user.userId)) {
      return res.status(403).json({ error: "Forbidden (owner only)" });
    }

    const { title, module_name, module_code, description, status } = req.body || {};
    if (!title || !module_name || !module_code) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await db.execute(
      `UPDATE app_cards
       SET title=?, module_name=?, module_code=?, description=?, status=?, updated_at=NOW()
       WHERE card_id=?`,
      [
        String(title).trim(),
        String(module_name).trim(),
        String(module_code).trim(),
        description ? String(description) : null,
        safeStatus(status),
        id
      ]
    );

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e.message) });
  }
});

// delete card (owner/admin)
app.delete("/api/cards/:id", requireAuth, async (req, res) => {
  try {
    const id = toIntId(req.params.id);
    if (!id) return res.status(404).json({ error: "Not found" });

    const [own] = await db.execute(
      `SELECT account_id FROM app_cards WHERE card_id=? LIMIT 1`,
      [id]
    );
    if (!own[0]) return res.status(404).json({ error: "Not found" });

    const isOwner = Number(own[0].account_id) === Number(req.user.userId);
    const isAdmin = String(req.user.role || "").toUpperCase() === "ADMIN";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });

    await db.execute(`DELETE FROM app_cards WHERE card_id=?`, [id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e.message) });
  }
});

/* =========================
   API 404 only
========================= */
app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API route not found",
    method: req.method,
    path: req.originalUrl
  });
});

app.listen(PORT, () => console.log(`✅ Card API running on port ${PORT}`));
