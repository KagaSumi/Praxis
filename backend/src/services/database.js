// services/database.js
const mysql = require('mysql2/promise');

require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.MYSQL_USER || 'Praxis',
  password: process.env.MYSQL_PASSWORD || 'your_praxis_password',
  database: process.env.MYSQL_DATABASE || 'qa_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test connection
async function testConnection(maxRetries = 10, delayMs = 3000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
          const connection = await pool.getConnection();
          console.log('✅ Database connected successfully');
          connection.release();
          return true;
        } catch (err) {
          console.error(`DB connection failed, retrying in ${delayMs}ms... (${i + 1}/${maxRetries})`);
          await new Promise(res => setTimeout(res, delayMs));
        }
      }
      console.error('❌ Could not connect to DB after max retries');
      process.exit(1);
}

module.exports = {
    pool,
    testConnection,
}
