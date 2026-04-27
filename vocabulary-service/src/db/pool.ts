import mysql from 'mysql2/promise';
import config from '../config/env';

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  connectionLimit: 10,
  waitForConnections: true
});

// Verificar conexión
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected (vocabulary-service)');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection error:', error);
    process.exit(1);
  }
};

export default pool;