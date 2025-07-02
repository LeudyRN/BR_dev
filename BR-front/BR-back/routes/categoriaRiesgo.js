const express = require("express");
const router = express.Router();
const sql = require("mssql");
const { initSQLPool, getSQLRequest } = require("../config/db");

let sqlPoolInitialized = false;

const ensureSQLPool = async () => {
  try {
    // Verifica si el pool no está inicializado o desconectado
    if (!sqlPoolInitialized || !sql.connected) {
      console.warn("ℹ️ Reinicializando pool de SQL Server...");
      await initSQLPool();
      sqlPoolInitialized = true;
    }
  } catch (err) {
    console.error("❌ Error al inicializar el pool de SQL Server:", err.message);
    sqlPoolInitialized = false;
    throw err;
  }
};

// GET /api/categoria-riesgo/:cedula
router.get("/:cedula", async (req, res) => {
  const { cedula } = req.params;
  const startTime = process.hrtime.bigint();

  if (!cedula) {
    console.log("DEBUG: [GET /:cedula] Solicitud sin cédula.");
    return res.status(400).json({ error: "Debe proporcionar una cédula." });
  }

  try {
    await ensureSQLPool();
    const request = await getSQLRequest();

    const query = `
      SELECT REPLACE(Coidentif, '-', '') AS Identificacion,
             coclasbco AS CategoriaRiesgo
      FROM SuperInDB.dbo.MAESTRO_GRAL
      WHERE REPLACE(Coidentif, '-', '') = @cedula
    `;

    console.log(`DEBUG: [GET /:cedula] Ejecutando query SQL con @cedula='${cedula}'`);

    const result = await request
      .input("cedula", sql.VarChar, cedula)
      .query(query);

    if (result.recordset.length === 0) {
      const endTime = process.hrtime.bigint();
      console.log(`DEBUG: [GET /:cedula] Cliente no encontrado. Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms`);
      return res.status(404).json({ error: "Cliente no encontrado para la categoría de riesgo." });
    }

    const categoriaRiesgo = result.recordset[0].CategoriaRiesgo || "Sin categoría asignada";
    const endTime = process.hrtime.bigint();
    console.log(`DEBUG: [GET /:cedula] Categoría de riesgo encontrada: '${categoriaRiesgo}'. Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms`);
    res.json({ riesgo: categoriaRiesgo });

  } catch (error) {
    const endTime = process.hrtime.bigint();
    console.error(`❌ Error al consultar la categoría de riesgo (Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms):`, error);
    res.status(500).json({ error: "Error interno del servidor al consultar la categoría de riesgo." });
  }
});

// PUT /api/categoria-riesgo/
router.put("/", async (req, res) => {
  const { cedula, nuevaCategoria } = req.body;

  if (!cedula || !nuevaCategoria) {
    console.log("DEBUG: [PUT /] Solicitud sin cédula o nueva categoría.");
    return res.status(400).json({ error: "Debe proporcionar cédula y nueva categoría." });
  }

  const startTime = process.hrtime.bigint();
  console.log(`DEBUG: [PUT /] Actualizando riesgo para cédula: '${cedula}' a categoría: '${nuevaCategoria}'`);

  try {
    await ensureSQLPool();
    const request = await getSQLRequest();

    const updateQuery = `
      UPDATE SuperInDB.dbo.MAESTRO_GRAL
      SET coclasbco = @nuevaCategoria
      WHERE REPLACE(Coidentif, '-', '') = @cedula
    `;

    console.log(`DEBUG: [PUT /] Ejecutando query SQL de actualización con @nuevaCategoria='${nuevaCategoria}' y @cedula='${cedula}'`);
    const result = await request
      .input("nuevaCategoria", sql.VarChar, nuevaCategoria)
      .input("cedula", sql.VarChar, cedula)
      .query(updateQuery);

    if (result.rowsAffected[0] === 0) {
      const endTime = process.hrtime.bigint();
      console.log(`DEBUG: [PUT /] Cliente no encontrado para actualización. Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms`);
      return res.status(404).json({ error: "Cliente no encontrado o categoría no modificada." });
    }

    const endTime = process.hrtime.bigint();
    console.log(`DEBUG: [PUT /] Categoría de riesgo actualizada correctamente. Filas afectadas: ${result.rowsAffected[0]}. Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms`);
    res.json({ mensaje: "¡Categoría de riesgo actualizada correctamente!" });

  } catch (error) {
    const endTime = process.hrtime.bigint();
    console.error(`❌ Error al actualizar la categoría de riesgo (Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms):`, error);
    res.status(500).json({ error: "Error interno del servidor al actualizar la categoría." });
  }
});

module.exports = router;