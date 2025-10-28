import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔄 Starting database sync...');

// Local database connection
const localPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'collabforge_db',
  password: 'ManojDB',
  port: 5433,
});

// Render database connection - with better error handling
const renderPool = new Pool({
  connectionString: 'postgresql://manojr:OqNAv6jeAJVmxDaAt6uQLW7grDdqeQaC@dpg-d3rq983uibrs73b79f30-a.oregon-postgres.render.com/collabforge_db_75ze',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000, // 30 seconds
  idleTimeoutMillis: 30000,
});

async function testConnection() {
  try {
    const client = await renderPool.connect();
    console.log('✅ Connected to Render PostgreSQL successfully!');
    
    // Test query
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result.rows[0].version.split(',')[0]);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Render PostgreSQL:');
    console.error('Error:', error.message);
    return false;
  }
}

async function syncDatabases() {
  console.log('🔍 Testing connections...');
  
  // Test Render connection first
  const canConnect = await testConnection();
  if (!canConnect) {
    console.log('🚨 Cannot connect to Render database. Please check:');
    console.log('   1. Database is active in Render dashboard');
    console.log('   2. Your IP is allowed in database networking settings');
    console.log('   3. Password is correct');
    return;
  }

  const localClient = await localPool.connect();
  const renderClient = await renderPool.connect();

  try {
    // Get all tables from local database
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const tablesResult = await localClient.query(tablesQuery);
    const tables = tablesResult.rows.map(row => row.table_name);
    
    console.log('📊 Tables to sync:', tables);
    
    for (const table of tables) {
      console.log(`\n🔄 Syncing table: ${table}`);
      
      try {
        // Get data from local database
        const localData = await localClient.query(`SELECT * FROM ${table}`);
        console.log(`   📥 Found ${localData.rows.length} rows locally`);
        
        if (localData.rows.length > 0) {
          // Clear existing data in render database
          await renderClient.query(`DELETE FROM ${table}`);
          console.log(`   🗑️  Cleared existing data in Render`);
          
          // Insert data into render database
          let insertedCount = 0;
          for (const row of localData.rows) {
            const columns = Object.keys(row).join(', ');
            const values = Object.values(row);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
            
            await renderClient.query(
              `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
              values
            );
            insertedCount++;
          }
          
          console.log(`   ✅ ${insertedCount} rows synced to Render`);
        }
      } catch (tableError) {
        console.error(`   ❌ Error syncing ${table}:`, tableError.message);
      }
    }
    
    console.log('\n🎉 Database sync completed!');
    
  } catch (error) {
    console.error('❌ Sync error:', error);
  } finally {
    localClient.release();
    renderClient.release();
    await localPool.end();
    await renderPool.end();
  }
}

syncDatabases();