// server.js
import "dotenv/config";
import express from "express";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_PULL_ZONE = process.env.BUNNY_PULL_ZONE;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const app = express();
app.use(express.json());

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
    model: "gpt-4o-mini",
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

// ===== 6) تقديم ملفات الواجهة =====
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

