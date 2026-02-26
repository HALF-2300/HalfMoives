import fs from "node:fs/promises";

const INPUT_FILE = "channels.movies.json";
const OUTPUT_OK = "feeds.valid.json";
const OUTPUT_BAD = "feeds.invalid.json";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function resolveChannelId(channelUrl) {
  const res = await fetch(channelUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html = await res.text();

  let m = html.match(/"channelId":"(UC[a-zA-Z0-9_-]{20,})"/);
  if (m?.[1]) return m[1];

  m = html.match(/"externalId":"(UC[a-zA-Z0-9_-]{20,})"/);
  if (m?.[1]) return m[1];

  throw new Error("channelId not found");
}

async function validateFeed(feedUrl) {
  const res = await fetch(feedUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) return { ok: false, reason: `feed HTTP ${res.status}` };

  const xml = await res.text();
  if (!xml.includes("<entry>")) return { ok: false, reason: "no <entry> in feed" };

  return { ok: true };
}

async function main() {
  const raw = await fs.readFile(INPUT_FILE, "utf-8");
  const channels = JSON.parse(raw);

  const good = [];
  const bad = [];

  for (let i = 0; i < channels.length; i++) {
    const ch = channels[i];
    try {
      const channelId = await resolveChannelId(ch.url);
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const v = await validateFeed(feedUrl);

      if (v.ok) good.push({ ...ch, channelId, feedUrl });
      else bad.push({ ...ch, channelId, feedUrl, error: v.reason });

    } catch (e) {
      bad.push({ ...ch, error: String(e?.message || e) });
    }

    await sleep(250);
    if ((i + 1) % 10 === 0) console.log(`Progress ${i + 1}/${channels.length}`);
  }

  await fs.writeFile(OUTPUT_OK, JSON.stringify(good, null, 2), "utf-8");
  await fs.writeFile(OUTPUT_BAD, JSON.stringify(bad, null, 2), "utf-8");

  console.log("DONE ✅");
  console.log("Valid:", good.length, "->", OUTPUT_OK);
  console.log("Invalid:", bad.length, "->", OUTPUT_BAD);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

