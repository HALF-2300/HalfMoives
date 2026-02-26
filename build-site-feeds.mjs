import fs from "node:fs/promises";

const INPUT = "feeds.valid.json";
const OUTPUT = "site-feeds.json";

async function main() {
  const feeds = JSON.parse(await fs.readFile(INPUT, "utf-8"));
  const out = feeds.map(f => ({
    name: f.name,
    feedUrl: f.feedUrl
  }));
  await fs.writeFile(OUTPUT, JSON.stringify(out, null, 2), "utf-8");
  console.log(`Wrote ${out.length} -> ${OUTPUT}`);
}

main();

