// backend/config/db.js
import pkg from 'pg';
import dotenv from "dotenv";

dotenv.config(); 

const { Pool } = pkg;

// Create a new pool instance
const pool = new Pool({
user: process.env.DB_USER,
host: process.env.DB_HOST,
database: process.env.DB_NAME,
password: process.env.DB_PASSWORD,
port: process.env.DB_PORT,            
});

// Test the connection
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL successfully!');
    client.release(); // release connection back to pool
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection error:', err.message);
  });

// Export pool to use in other modules
export default pool;
