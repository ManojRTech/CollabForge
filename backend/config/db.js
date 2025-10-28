import pkg from 'pg';
import dotenv from 'dotenv';
console.log("DB URL Check:", process.env.DATABASE_URL ? "URL IS SET" : "URL IS NOT SET");

const { Pool } = pkg;

console.log('🔍 Debugging Database Connection:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  // Mask password for security when logging
  const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
  console.log('DATABASE_URL:', maskedUrl);
} else {
  console.log('DATABASE_URL is not set!');
}


let pool;

// if (process.env.DATABASE_URL) {
//   console.log("DB_MODE: RENDER_URL");
//   // Render or external PostgreSQL (needs SSL)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL, 
    ssl: {
      rejectUnauthorized: false,
    }
  });
// } else {
//   console.log("DB_MODE: LOCAL_VARS");
//   // Local PostgreSQL (no SSL)
//   pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: Number(process.env.DB_PORT),
//     ssl: false, // ✅ Disable SSL for local
//   });
// }

pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL successfully!');
    client.release();
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection error:');
    console.error(err.stack || err);
  });

export default pool;
