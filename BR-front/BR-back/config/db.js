require("dotenv").config();
const oracledb = require("oracledb");
const sql = require("mssql"); // Necesario para SQL Server

// Configuración para Oracle DB (CRM/UATIP22)
const oracleConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.DB_HOST})(PORT=${process.env.DB_PORT}))(CONNECT_DATA=(SERVICE_NAME=${process.env.DB_SERVICE})))`,
  poolMin: 5,
  poolMax: 50,
  poolIncrement: 10,
  poolTimeout: 70, // Tiempo en segundos que una conexión inactiva permanece en el pool
  stmtCacheSize: 100, // Tamaño de la caché de sentencias (reducido de 70000 para evitar alto consumo de memoria)
  queueTimeout: 60000, // Tiempo máximo en milisegundos para esperar una conexión del pool (60 segundos)
};

// Configuración para Oracle FOCUS (nuevo pool)
const oracleFocusConfig = {
  user: process.env.DB_USER_FOCUS,
  password: process.env.DB_PASSWORD_FOCUS,
  connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.DB_HOST_FOCUS})(PORT=${process.env.DB_PORT_FOCUS}))(CONNECT_DATA=(SERVICE_NAME=${process.env.DB_SERVICE_FOCUS})))`,
  poolMin: 5,
  poolMax: 50,
  poolIncrement: 10,
  poolTimeout: 70, // Tiempo en segundos que una conexión inactiva permanece en el pool
  stmtCacheSize: 100, // Tamaño de la caché de sentencias (reducido)
  queueTimeout: 60000, // Tiempo máximo en milisegundos para esperar una conexión del pool (60 segundos)
};

// Configuración para SQL Server
const sqlConfig = {
  user: process.env.DB_USER_SQLSERVER,
  password: process.env.DB_PASS_SQLSERVER,
  server: process.env.DB_HOST_SQLSERVER,
  port: parseInt(process.env.DB_PORT_SQLSERVER, 10),
  options: { encrypt: true, trustServerCertificate: true },
};

// Variables para los pools de conexiones
let oraclePoolCRM = null; // Pool Oracle CRM
let oracleFocusPool = null; // Pool Oracle FOCUS
let sqlServerPool = null; // Pool SQL Server

// Configuración para Oracle BROKER (conexión directa, no pool, si es para uso esporádico)
const oracleBrokerConfig = {
  user: process.env.DB_USER_BROKER,
  password: process.env.DB_PASSWORD_BROKER,
  connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.DB_HOST_BROKER})(PORT=${process.env.DB_PORT_BROKER}))(CONNECT_DATA=(SERVICE_NAME=${process.env.DB_SERVICE_BROKER})))`,
};


/** Inicializa el pool de conexiones a Oracle (CRM/UATIP22) */
const initOraclePool = async () => {
  try {
    if (!oraclePoolCRM) {
      oraclePoolCRM = await oracledb.createPool(oracleConfig);
      console.log("✅ Pool Oracle inicializado (CRM/UATIP22)");
    }
  } catch (err) {
    console.error("❌ Error al inicializar el pool de Oracle DB (CRM/UATIP22):", err.message);
    throw err; // Relanzar para que la aplicación padre lo maneje (ej. app.js)
  }
};

/** Obtiene una conexión del pool Oracle (CRM/UATIP22) con reintentos y re-inicialización */
const getOraclePoolConnection = async (retries = 3, delayMs = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!oraclePoolCRM || oraclePoolCRM._closed) {
        console.warn(`ℹ️ Intento ${attempt}: El pool Oracle CRM está cerrado o no existe. Intentando reiniciarlo...`);
        await initOraclePool(); // Re-inicializar el pool
      }
      const connection = await oraclePoolCRM.getConnection();
      console.log(`✅ Conexión a Oracle CRM obtenida en intento ${attempt}.`);
      return connection;
    } catch (error) {
      console.error(`❌ Intento ${attempt} de conexión a Oracle CRM fallido:`, error.message);
      if (attempt < retries) {
        console.log(`⏳ Esperando ${delayMs} ms antes de reintentar...`);
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        throw error; // Si todos los reintentos fallan, relanza el error
      }
    }
  }
};

/** Cierra el pool Oracle CRM (al finalizar app) */
const closeOraclePool = async () => {
  if (oraclePoolCRM) {
    try {
      await oraclePoolCRM.close(10); // Cierra el pool con un timeout de 10 segundos
      console.log("🛑 Pool Oracle CRM cerrado");
      oraclePoolCRM = null; // Resetear la variable del pool
    } catch (e) {
      console.warn("⚠️ Error cerrando pool Oracle CRM:", e.message);
    }
  }
};


/** Inicializa pool Oracle FOCUS */
const initFocusPool = async () => {
  try {
    if (!oracleFocusPool) {
      oracleFocusPool = await oracledb.createPool(oracleFocusConfig);
      console.log("✅ Pool Oracle inicializado (FOCUS/Sigdesa)");
    }
  } catch (error) {
    console.error("❌ Error al inicializar pool Oracle Focus:", error.message);
    throw error; // Relanzar para que la aplicación padre lo maneje
  }
};

/** Obtiene una conexión del pool Oracle FOCUS con reintentos y re-inicialización */
const getFocusConnection = async (retries = 3, delayMs = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!oracleFocusPool || oracleFocusPool._closed) {
        console.warn(`ℹ️ Intento ${attempt}: Pool Oracle Focus cerrado o no existe. Reinicializando...`);
        await initFocusPool(); // Re-inicializar el pool
      }
      const connection = await oracleFocusPool.getConnection();
      console.log(`✅ Conexión a Oracle Focus obtenida en intento ${attempt}.`);
      return connection;
    } catch (error) {
      console.error(`❌ Intento ${attempt} de conexión a Oracle Focus fallido:`, error.message);
      if (attempt < retries) {
        console.log(`⏳ Esperando ${delayMs} ms antes de reintentar...`);
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        throw error; // Si todos los reintentos fallan, relanza el error
      }
    }
  }
};

/** Cierra el pool Oracle FOCUS (al finalizar app) */
const closeFocusPool = async () => {
  if (oracleFocusPool) {
    try {
      await oracleFocusPool.close(10);
      console.log("🛑 Pool Oracle FOCUS cerrado");
      oracleFocusPool = null; // Resetear la variable del pool
    } catch (e) {
      console.warn("⚠️ Error cerrando pool Oracle FOCUS:", e.message);
    }
  }
};


/** Inicializa pool SQL Server */
const initSQLPool = async () => {
  try {
    if (!sqlServerPool) {
      sqlServerPool = await sql.connect(sqlConfig);
      console.log("✅ Pool SQL Server inicializado");
    }
  } catch (error) {
    console.error("❌ Error al inicializar pool SQL Server:", error.message);
    throw error; // Relanzar para que la aplicación padre lo maneje
  }
};

/** Obtiene request desde el pool SQL Server */
const getSQLRequest = async () => {
  if (!sqlServerPool) {
    throw new Error("El pool de SQL Server no ha sido inicializado. Llame a initSQLPool() primero.");
  }
  // mssql maneja la reconexión de su pool internamente.
  return sqlServerPool.request();
};

/** Conexión directa a Oracle BROKER (para usos esporádicos que no requieran pool) */
const connectOracleBroker = async () => {
  try {
    const connection = await oracledb.getConnection(oracleBrokerConfig);
    console.log("✅ Conectado a Oracle DB (BROKER) - Conexión directa");
    return connection;
  } catch (error) {
    console.error("❌ Error de conexión a Oracle (BROKER):", error.message);
    throw error;
  }
};

// Exports
module.exports = {
  // Oracle CRM
  initOraclePool,
  getOraclePoolConnection, // incluye reintentos
  closeOraclePool,

  // Oracle BROKER (conexión directa)
  connectOracleBroker,

  // SQL Server
  initSQLPool,
  getSQLRequest,
  sql, // Exporta 'sql' para mssql.VarChar, etc.

  // Oracle FOCUS (Sigdesa)
  initFocusPool,
  getFocusConnection, // incluye reintentos
  closeFocusPool,
};
