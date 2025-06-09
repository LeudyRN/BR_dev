const oracledb = require("oracledb");

const dbConfig = {
  user: "",
  password: "",
  connectString: "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=10.181.2.114)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=uatip22.sndb.vcndev.oraclevcn.com)))"
};

const getConnection = async () => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    console.log("✅ Conectado a Oracle DB");
    return connection;
  } catch (error) {
    console.error("❌ Error de conexión a Oracle:", error.message);
    throw error;
  }
};

module.exports = getConnection;
