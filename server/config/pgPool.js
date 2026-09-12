const { Pool } = require("pg")
require("dotenv").config()

// Extract the project ref from the Supabase URL
// e.g. https://lwufoqgmyclrmqkibcay.supabase.co  =>  lwufoqgmyclrmqkibcay
const supabaseUrl = process.env.SUPABASE_URL || ""
const projectRef = supabaseUrl.replace("https://", "").split(".")[0]

const pool = new Pool({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    user: "postgres",
    password: process.env.SUPABASE_DB_PASS,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
})

module.exports = pool
