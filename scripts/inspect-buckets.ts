import postgres from "postgres";
import fs from "fs";
import path from "path";

if (!process.env.DATABASE_URL) {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    });
  }
}

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function run() {
  console.log("=== BUCKETS ===");
  const buckets = await sql`SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets`;
  console.table(buckets);

  console.log("=== POLICIES ON storage.objects ===");
  const policies = await sql`
    SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check 
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
  `;
  console.table(policies);

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
