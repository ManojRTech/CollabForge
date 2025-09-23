// backend/config/db.js
import pkg from 'pg';
const { Pool } = pkg;

// Create a new pool instance
const pool = new Pool({
  user: 'postgres',         // PostgreSQL username
  host: 'localhost',            // server address
  database: 'collabforge_db',    // database name
  password: 'ManojDB', // PostgreSQL password
  port: 5433,                   // default PostgreSQL port
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
