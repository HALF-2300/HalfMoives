// server.js
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import axios from "axios";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_PULL_ZONE = process.env.BUNNY_PULL_ZONE;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = process.env.BASE_URL || "http://localhost:4000";
const SESSION_SECRET = process.env.SESSION_SECRET || "halfmovies-session-secret-change-in-production";

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

// ===== 1) "قاعدة بيانات" بسيطة: movies.json =====
const DB_PATH = path.join(__dirname, "movies.json");

function loadMovies() {
  if (!fs.existsSync(DB_PATH)) return [];
  const raw = fs.readFileSync(DB_PATH, "utf8");
  if (!raw.trim()) return [];
  return JSON.parse(raw);
}

function saveMovies(movies) {
  fs.writeFileSync(DB_PATH, JSON.stringify(movies, null, 2), "utf8");
}

function getAllMovies() {
  return loadMovies();
}

function getMovieById(id) {
  const movies = loadMovies();
  return movies.find(m => m.id === id);
}

function addMovie(movie) {
  const movies = loadMovies();
  movies.push(movie);
  saveMovies(movies);
  return movie;
}

// ===== Auth: users store + sessions =====
const USERS_PATH = path.join(__dirname, "users.json");
const SESSIONS_PATH = path.join(__dirname, "sessions.json");
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h for verification link

function loadUsers() {
  if (!fs.existsSync(USERS_PATH)) return [];
  const raw = fs.readFileSync(USERS_PATH, "utf8").replace(/^\uFEFF/, "");
  if (!raw.trim()) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), "utf8");
}

function loadSessions() {
  if (!fs.existsSync(SESSIONS_PATH)) return {};
  try {
    const raw = fs.readFileSync(SESSIONS_PATH, "utf8");
    return raw.trim() ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveSessions(sessions) {
  fs.writeFileSync(SESSIONS_PATH, JSON.stringify(sessions, null, 2), "utf8");
}

function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const h = crypto.pbkdf2Sync(password, s, 100000, 64, "sha512").toString("hex");
  return { hash: h, salt: s };
}

function verifyPassword(password, salt, storedHash) {
  const { hash } = hashPassword(password, salt);
  return hash === storedHash;
}

function getUserByEmail(email) {
  const users = loadUsers();
  const normalized = (email || "").trim().toLowerCase();
  return users.find((u) => (u.email || "").toLowerCase() === normalized);
}

function getUserById(id) {
  const users = loadUsers();
  return users.find((u) => u.id === id);
}

function createUser({ email, password }) {
  if (getUserByEmail(email)) return null;
  const { hash, salt } = hashPassword(password);
  const token = crypto.randomBytes(32).toString("hex");
  const user = {
    id: "user_" + crypto.randomBytes(8).toString("hex"),
    email: (email || "").trim().toLowerCase(),
    passwordHash: hash,
    passwordSalt: salt,
    verified: false,
    verificationToken: token,
    verificationTokenExpiry: new Date(Date.now() + TOKEN_EXPIRY_MS).toISOString(),
    createdAt: new Date().toISOString(),
  };
  const users = loadUsers();
  users.push(user);
  saveUsers(users);
  return user;
}

function setUserVerified(userId) {
  const users = loadUsers();
  const u = users.find((x) => x.id === userId);
  if (!u) return null;
  u.verified = true;
  u.verificationToken = null;
  u.verificationTokenExpiry = null;
  saveUsers(users);
  return u;
}

function getUserByVerificationToken(token) {
  const users = loadUsers();
  const u = users.find(
    (x) =>
      x.verificationToken === token &&
      x.verificationTokenExpiry &&
      new Date(x.verificationTokenExpiry) > new Date()
  );
  return u || null;
}

function createSession(userId) {
  const sid = crypto.randomBytes(24).toString("hex");
  const sessions = loadSessions();
  sessions[sid] = { userId, createdAt: new Date().toISOString() };
  saveSessions(sessions);
  return sid;
}

function getSession(sid) {
  if (!sid) return null;
  const sessions = loadSessions();
  const s = sessions[sid];
  return s ? s.userId : null;
}

function deleteSession(sid) {
  if (!sid) return;
  const sessions = loadSessions();
  delete sessions[sid];
  saveSessions(sessions);
}

async function sendVerificationEmail(email, token) {
  const link = `${BASE_URL.replace(/\/$/, "")}/verify-email.html?token=${encodeURIComponent(token)}`;
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || "HalfMovies <onboarding@resend.dev>";

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: "Verify your HalfMovies account",
      html: `
        <p>Welcome to HalfMovies.</p>
        <p>Please verify your email by clicking the link below:</p>
        <p><a href="${link}">Verify my email</a></p>
        <p>Or copy this URL: ${link}</p>
        <p>This link expires in 24 hours.</p>
      `,
    });
    if (error) {
      console.error("[Auth] Resend error:", error);
      throw new Error("Failed to send verification email");
    }
    return;
  }

  const transporter =
    process.env.SMTP_HOST && process.env.SMTP_USER
      ? nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS || "",
          },
        })
      : null;
  const mailOptions = {
    from,
    to: email,
    subject: "Verify your HalfMovies account",
    text: `Welcome to HalfMovies. Please verify your email by opening this link:\n\n${link}\n\nThis link expires in 24 hours.`,
    html: `
      <p>Welcome to HalfMovies.</p>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${link}">Verify my email</a></p>
      <p>Or copy this URL: ${link}</p>
      <p>This link expires in 24 hours.</p>
    `,
  };
  if (transporter) {
    await transporter.sendMail(mailOptions);
  } else {
    console.log("[Auth] No SMTP or Resend configured. Verification link (for dev):", link);
  }
}

// ===== 2) تعامل مع Bunny Video =====
async function createBunnyVideoSlot(title) {
  if (!BUNNY_LIBRARY_ID || !BUNNY_API_KEY) {
    return { id: `dummy-${Date.now()}` };
  }

  const url = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`;

  const res = await axios.post(
    url,
    { title },
    {
      headers: {
        AccessKey: BUNNY_API_KEY,
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    }
  );

  return res.data;
}

async function uploadVideoToBunny(videoId, downloadUrl) {
  if (!BUNNY_LIBRARY_ID || !BUNNY_API_KEY) {
    return { success: false, skipped: true };
  }

  const uploadUrl = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`;

  const videoResponse = await axios.get(downloadUrl, {
    responseType: "stream"
  });

  const res = await axios.put(uploadUrl, videoResponse.data, {
    headers: {
      AccessKey: BUNNY_API_KEY,
      Accept: "application/json",
      "Content-Type": "application/octet-stream"
    },
    maxBodyLength: Infinity
  });

  return res.data;
}

function buildHlsUrl(videoId) {
  if (!BUNNY_PULL_ZONE) {
    return `https://example.com/${videoId}/playlist.m3u8`;
  }
  return `${BUNNY_PULL_ZONE.replace(/\/$/, "")}/${videoId}/playlist.m3u8`;
}

// ===== 3) توليد الوصف من AI =====
async function generateMovieDescription({ title, year }) {
  if (!openai) {
    return {
      logline: `A film titled ${title} (${year}).`,
      description:
        "Description is temporarily generated without AI. Configure OPENAI_API_KEY to enable full descriptions.",
      genres: ["Drama"],
      keywords: [title, "movie"]
    };
  }

  const prompt = `
You are writing a cinematic description for a streaming platform called HalfMovie.

Movie title: ${title}
Year: ${year}

Write:
1) A short logline (one sentence).
2) A main description (3–5 sentences) in an exciting, cinematic style.
3) 5 comma-separated genres.
4) 8 comma-separated SEO keywords.

Output JSON ONLY with this shape:
{
  "logline": "...",
  "description": "...",
  "genres": ["",""],
  "keywords": ["",""]
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });

  let text = completion.choices[0].message.content;
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  const data = JSON.parse(text);
  return data;
}

// ===== 4) API: استيراد فيلم من لوحة admin =====
app.post("/admin/import-movie", async (req, res) => {
  try {
    const movie = req.body || {};
    const { title, thumbnailUrl, hlsUrl } = movie;

    if (!title || !thumbnailUrl || !hlsUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Prefix HLS with pull zone if it starts with "/"
    let finalHls = hlsUrl;
    if (typeof hlsUrl === "string" && hlsUrl.startsWith("/") && BUNNY_PULL_ZONE) {
      finalHls = `${BUNNY_PULL_ZONE.replace(/\/$/, "")}${hlsUrl}`;
    }

    const id = "movie_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);

    const record = {
      id,
      title,
      originalTitle: movie.originalTitle || null,
      year: movie.year ? Number(movie.year) : null,
      runtimeMinutes: movie.runtimeMinutes ? Number(movie.runtimeMinutes) : null,
      description: movie.description || "",
      thumbnailUrl,
      posterUrl: thumbnailUrl,
      hlsUrl: finalHls,
      language: movie.language || null,
      genres: Array.isArray(movie.genres) ? movie.genres : (movie.genres ? movie.genres.split(",").map(g => g.trim()).filter(Boolean) : []),
      tags: Array.isArray(movie.tags) ? movie.tags : (movie.tags ? movie.tags.split(",").map(t => t.trim()).filter(Boolean) : []),
      isFeatured: Boolean(movie.isFeatured),
      license: {
        type: movie.license?.type || movie.licenseType || null,
        url: movie.license?.url || movie.licenseUrl || null,
      },
      source: {
        name: movie.source?.name || movie.sourceName || null,
        url: movie.source?.url || movie.sourceUrl || null,
      },
      createdAt: new Date().toISOString(),
    };

    addMovie(record);

    return res.status(201).json({ success: true, movie: record });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({
      error: "import_failed",
      details: err.response?.data || err.message
    });
  }
});

// ===== 5) API: التصفح =====
app.get("/api/movies", (req, res) => {
  const movies = getAllMovies();
  res.json(movies);
});

app.get("/api/movies/:id", (req, res) => {
  const movie = getMovieById(req.params.id);
  if (!movie) return res.status(404).json({ error: "not_found" });
  res.json(movie);
});

// ===== Auth API =====
const isSecure = /^https:\/\//i.test(BASE_URL);
const COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: "lax",
  path: "/",
  secure: isSecure,
};

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const e = (email || "").trim().toLowerCase();
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return res.status(400).json({ error: "invalid_email" });
    }
    if (!password || String(password).length < 8) {
      return res.status(400).json({ error: "password_too_short", message: "Password must be at least 8 characters" });
    }
    if (getUserByEmail(e)) {
      return res.status(409).json({ error: "email_exists", message: "An account with this email already exists" });
    }
    const user = createUser({ email: e, password: String(password) });
    if (!user) return res.status(500).json({ error: "signup_failed" });
    await sendVerificationEmail(user.email, user.verificationToken);
    res.status(201).json({
      success: true,
      message: "Account created. Please check your email to verify your account.",
      email: user.email,
    });
  } catch (err) {
    console.error("[Auth] signup:", err);
    res.status(500).json({ error: "signup_failed" });
  }
});

app.get("/api/auth/verify-email", (req, res) => {
  const token = (req.query.token || "").trim();
  if (!token) {
    return res.status(400).json({ error: "missing_token" });
  }
  const user = getUserByVerificationToken(token);
  if (!user) {
    return res.status(400).json({ error: "invalid_or_expired", message: "Link invalid or expired" });
  }
  setUserVerified(user.id);
  res.json({ success: true, message: "Email verified. You can now log in.", email: user.email });
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body || {};
    const e = (email || "").trim().toLowerCase();
    if (!e || !password) {
      return res.status(400).json({ error: "invalid_credentials" });
    }
    const user = getUserByEmail(e);
    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return res.status(401).json({ error: "invalid_credentials" });
    }
    if (!user.verified) {
      return res.status(403).json({
        error: "email_not_verified",
        message: "Please verify your email first. Check your inbox for the verification link.",
      });
    }
    const sid = createSession(user.id);
    res.cookie("hm_sid", sid, COOKIE_OPTIONS);
    res.json({
      success: true,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error("[Auth] login:", err);
    res.status(500).json({ error: "login_failed" });
  }
});

app.get("/api/auth/me", (req, res) => {
  const sid = req.cookies && req.cookies.hm_sid;
  const userId = getSession(sid);
  if (!userId) return res.status(401).json({ error: "not_logged_in" });
  const user = getUserById(userId);
  if (!user) {
    deleteSession(sid);
    return res.status(401).json({ error: "not_logged_in" });
  }
  res.json({ user: { id: user.id, email: user.email } });
});

app.post("/api/auth/logout", (req, res) => {
  const sid = req.cookies && req.cookies.hm_sid;
  deleteSession(sid);
  res.clearCookie("hm_sid", { path: "/" });
  res.json({ success: true });
});

// ===== 6) Traffic Seeder (Temporary warm-up only) =====
if (process.env.TRAFFIC_SEEDER_ENABLED === 'true') {
  try {
    const { setupTrafficSeederAPI, startScheduler } = await import('./trafficSeeder.js');
    setupTrafficSeederAPI(app);
    // Start scheduler in background (non-blocking)
    startScheduler().catch(err => {
      console.error('[Traffic Seeder] Error starting:', err.message);
    });
    console.log('[Server] Traffic Seeder enabled (temporary warm-up only)');
  } catch (error) {
    console.warn('[Server] Traffic Seeder not available:', error.message);
  }
}

// ===== 7) تقديم ملفات الواجهة =====
// Ensure root serves index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use(express.static(__dirname));

// ===== Start =====
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`HalfMovie backend running on http://localhost:${port}`);
});

