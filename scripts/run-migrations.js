import { createClient } from "@supabase/supabase-js"
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Create Supabase admin client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function runMigrations() {
  console.log("[v0] Starting database migrations...")

  // Get all SQL files and sort them
  const files = readdirSync(__dirname)
    .filter((f) => f.endsWith(".sql") && f.match(/^\d{3}_/))
    .sort()

  console.log(`[v0] Found ${files.length} migration files`)

  for (const file of files) {
    console.log(`[v0] Running migration: ${file}`)

    try {
      const sql = readFileSync(join(__dirname, file), "utf-8")

      // Execute the SQL using the REST API
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      })

      if (!response.ok) {
        // If RPC doesn't exist, try direct SQL execution via pg
        console.log(`[v0] Executing SQL directly for ${file}`)

        // Split by semicolons and execute each statement
        const statements = sql
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.startsWith("--"))

        for (const statement of statements) {
          const { error } = await supabase.rpc("exec", { sql: statement })
          if (error) {
            console.error(`[v0] Error in ${file}:`, error.message)
            throw error
          }
        }
      }

      console.log(`[v0] ✓ Completed: ${file}`)
    } catch (error) {
      console.error(`[v0] ✗ Failed: ${file}`, error.message)
      throw error
    }
  }

  console.log("[v0] All migrations completed successfully!")
}

runMigrations().catch((error) => {
  console.error("[v0] Migration failed:", error)
  process.exit(1)
})
