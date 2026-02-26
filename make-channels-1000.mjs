// ===== START make-channels-1000.mjs =====
// Node 18+
// This generates channels.1000.json using YouTube Data API (most reliable).
// Steps:
// 1) Create a YouTube Data API key (Google Cloud Console).
// 2) Set env var YT_API_KEY
// 3) Run: node make-channels-1000.mjs
//
// Output: channels.1000.json

import fs from "node:fs/promises";

const API_KEY = process.env.YT_API_KEY;
if (!API_KEY) {
  console.error("Missing YT_API_KEY env var.");
  console.error('Windows PowerShell:  $env:YT_API_KEY="YOUR_KEY_HERE"');
  process.exitCode = 1;
  // Avoid forcing process.exit to prevent Windows libuv assertion if handles are open.
  return;
}

const OUT_FILE = "channels.1000.json";

// Movie-only keyword bank (you can edit/add)
const KEYWORDS = [
  "official trailer",
  "movie trailer",
  "teaser trailer",
  "official clip",
  "movie clips",
  "behind the scenes film",
  "featurette movie",
  "film distribution trailers",
  "independent film trailer",
  "horror movie trailer",
  "sci-fi movie trailer",
  "action movie trailer",
  "comedy movie trailer",
  "drama movie trailer",
  "romance movie trailer",
  "thriller movie trailer",
  "festival film trailer",
  "short film",
  "animated short film",
  "full movie free (legal)",
  "public domain movies",
  "classic movies official",
  "arthouse film trailer",
  "bollywood trailer",
  "korean movie trailer",
  "japanese movie trailer",
  "turkish movie trailer",
  "arabic movie trailer",
  "film studio official",
  "movie studio trailer",
  "indie film channel",
  "movie distribution company",
  "film festival channel"
];

// Tune these if you want more than 1000
const TARGET = 1000;          // final unique channels
const PER_KEYWORD_PAGES = 6;  // each page ~50 results => 6 pages ~300 channels/keyword (with dedupe)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url) {
  const res = await fetch(url.toString ? url.toString() : url);
  if (!res.ok) {
    let bodyText = '';
    try {
      bodyText = await res.text();
    } catch {
      // ignore
    }
    // Try to extract YouTube error payload if present
    let details = '';
    try {
      const j = JSON.parse(bodyText);
      if (j?.error) {
        const code = j.error.code;
        const status = j.error.status || j.error.errors?.[0]?.reason;
        const msg = j.error.message;
        details = ` code=${code} status=${status} message=${msg}`;
      }
    } catch {
      // leave details empty; include first 200 chars of bodyText for context
      if (bodyText) details = ` body=${bodyText.slice(0,200)}`;
    }
    throw new Error(`YouTube API HTTP ${res.status}.${details}`);
  }
  return res.json();
}

async function ytSearchChannels(query, pageToken) {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("key", API_KEY);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "channel");
  url.searchParams.set("maxResults", "50");
  url.searchParams.set("q", query);
  if (pageToken) url.searchParams.set("pageToken", pageToken);

  return fetchJson(url);
}

async function ytGetChannelDetails(channelIds) {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("key", API_KEY);
  url.searchParams.set("part", "snippet,statistics");
  url.searchParams.set("id", channelIds.join(","));

  return fetchJson(url);
}

function pickHandleOrChannelUrl(item) {
  // Prefer customUrl if available (often /@handle or /c/name), else use /channel/ID
  const sn = item.snippet || {};
  const customUrl = sn.customUrl; // may exist
  if (customUrl) {
    // customUrl may be like "/@name" or "c/name" etc depending on API response
    const cleaned = customUrl.startsWith("http")
      ? customUrl
      : "https://www.youtube.com/" + customUrl.replace(/^\//, "");
    return cleaned;
  }
  return "https://www.youtube.com/channel/" + item.id;
}

async function main() {
  const byId = new Map(); // channelId -> {name,url,subscribers,viewCount}

  for (const kw of KEYWORDS) {
    let pageToken = undefined;

    for (let p = 0; p < PER_KEYWORD_PAGES; p++) {
      const data = await ytSearchChannels(kw, pageToken);
      pageToken = data.nextPageToken;

      const ids = (data.items || [])
        .map((x) => x.id?.channelId)
        .filter(Boolean);

      // Fetch details in chunks of 50
      for (let i = 0; i < ids.length; i += 50) {
        const chunk = ids.slice(i, i + 50);
        const det = await ytGetChannelDetails(chunk);

        for (const it of (det.items || [])) {
          const channelId = it.id;
          const title = it.snippet?.title || "Unknown";
          const url = pickHandleOrChannelUrl(it);
          const subs = Number(it.statistics?.subscriberCount || 0);
          const views = Number(it.statistics?.viewCount || 0);

          // Keep movie relevance by keyword search, then rank by viewCount/subs
          if (!byId.has(channelId)) {
            byId.set(channelId, { name: title, url, subscribers: subs, views });
          } else {
            // keep the stronger stats if repeated
            const prev = byId.get(channelId);
            if ((views + subs) > (prev.views + prev.subscribers)) {
              byId.set(channelId, { name: title, url, subscribers: subs, views });
            }
          }
        }

        await sleep(120); // gentle pacing
      }

      if (!pageToken) break;
      if (byId.size >= TARGET * 2) break; // stop early if we collected plenty
      await sleep(200);
    }

    console.log(`Keyword "${kw}" collected so far: ${byId.size}`);
    if (byId.size >= TARGET * 2) break;
  }

  // Sort by popularity (views first, then subs)
  const sorted = [...byId.values()].sort((a, b) => {
    if (b.views !== a.views) return b.views - a.views;
    return b.subscribers - a.subscribers;
  });

  // Take top TARGET
  const top = sorted.slice(0, TARGET).map(({ name, url }) => ({ name, url }));

  await fs.writeFile(OUT_FILE, JSON.stringify(top, null, 2), "utf-8");
  console.log(`DONE ✅ wrote ${top.length} movie channels to ${OUT_FILE}`);
}

main().catch((e) => {
  console.error("FAILED:", e?.message || e);
  // Prefer setting exitCode over process.exit to avoid libuv assertion on Windows.
  process.exitCode = 1;
});
// ===== END make-channels-1000.mjs =====
