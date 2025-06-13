require("dotenv").config();
const oracledb = require("oracledb");
const sql = require("mssql");

// 🔹 Configuración para Oracle DB
const oracleConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.DB_HOST})(PORT=${process.env.DB_PORT}))(CONNECT_DATA=(SERVICE_NAME=${process.env.DB_SERVICE})))`
};
// 🔹 Configuración para SQL Server
const sqlConfig = {
  user: process.env.DB_USER_SQLSERVER,
  password: process.env.DB_PASS_SQLSERVER,
  server: process.env.DB_HOST_SQLSERVER,
  port: parseInt(process.env.DB_PORT_SQLSERVER, 10),
  options: { encrypt: true, trustServerCertificate: true }
};


// 🔹 Función para conectar a Oracle
const connectOracle = async () => {
  try {
    const connection = await oracledb.getConnection(oracleConfig);
    console.log("✅ Conectado a Oracle DB");
    return connection;
  } catch (error) {
    console.error("❌ Error de conexión a Oracle:", error.message);
    throw error;
  }
};

// 🔹 Función para conectar a SQL Server
const connectSQLServer = async () => {
  try {
    const pool = await sql.connect(sqlConfig);
    console.log("✅ Conectado a SQL Server");
    return pool;
  } catch (error) {
    console.error("❌ Error conectando a SQL Server:", error);
    throw error;
  }
};

const getConnection = async () => {
  const pool = await connectSQLServer();
  return pool.request(); // Para consultas SQL
};



module.exports = { connectOracle, connectSQLServer, getConnection };