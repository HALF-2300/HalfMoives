import pkg from "pg";
const { Pool } = pkg;

const url = process.env.DATABASE_URL;
if (!url || url.includes("PASTE_YOUR_FULL_POSTGRESQL_CONNECTION_STRING_HERE")) {
  console.error("DATABASE_URL is missing. Set it in PowerShell before running.");
  process.exitCode = 1;
} else {
  const pool = new Pool({ connectionString: url });

  async function main() {
    const r = await pool.query("select 1 as ok");
    console.log("DB_OK:", r.rows[0].ok);

    // Change table name if your table differs
    const m = await pool.query('select * from "movies" limit 1');
    console.log("MOVIES_ROW:", m.rows[0] ?? null);
  }

  main()
    .catch((e) => {
      console.error("DB_ERROR:", e.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      try {
        await pool.end();
      } catch {}
    });
}
