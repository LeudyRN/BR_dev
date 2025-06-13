const express = require("express");
const router = express.Router();
const { connectOracle } = require("../config/db");

let dbConnection = null; // 🔹 Mantener la conexión viva

async function getOracleConnection() {
  if (!dbConnection) {
    dbConnection = await connectOracle();
  }
  return dbConnection;
}

// 🔹 Obtener todos los clientes
router.get("/", async (req, res) => {
  try {
    const connection = await getOracleConnection(); // ✅ Usa la conexión persistente

    const query = "SELECT * FROM siebel.s_org_ext FETCH FIRST 50 ROWS ONLY";
    const result = await connection.execute(query);

    console.log("✅ Clientes obtenidos:", result.rows.length);
    res.status(200).json(result.rows);

  } catch (err) {
    console.error("❌ Error al obtener clientes:", err.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;