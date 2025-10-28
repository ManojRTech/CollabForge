import pkg from 'pg';
import dotenv from 'dotenv';


const { Pool } = pkg;



// if (process.env.DATABASE_URL) {
//   console.log("DB_MODE: RENDER_URL");
//   // Render or external PostgreSQL (needs SSL)
 const pool = new Pool({
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

// pool.connect()
//   .then(client => {
//     console.log('✅ Connected to PostgreSQL successfully!');
//     client.release();
//   })
//   .catch(err => {
//     console.error('❌ PostgreSQL connection error:');
//     console.error(err.stack || err);
//   });

export default pool;
