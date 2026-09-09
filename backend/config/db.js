import "dotenv/config";
import pkg from "pg";

const { Pool } = pkg;

let pool;

if (process.env.DATABASE_URL) {
  // AWS / Neon / production
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  console.log("DB_MODE: Neon / DATABASE_URL");
} else {
  // Local PostgreSQL
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    ssl: false,
  });

  console.log("DB_MODE: Local PostgreSQL");
}

export default pool;