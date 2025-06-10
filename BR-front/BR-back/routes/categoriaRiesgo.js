const express = require("express");
const router = express.Router();
const db = require("../config/db");

/** 🔹 Consultar la categoría de riesgo por cédula */
router.get("/consultar-riesgo", async (req, res) => {
  const { cedula } = req.query;

  if (!cedula) {
    return res.status(400).json({ error: "Debe proporcionar una cédula." });
  }

  try {
    const pool = await db.connectSQLServer();
    const query = `
      SELECT REPLACE(Coidentif, '-', '') AS Identificacion,
             coclasbco AS CategoriaRiesgo
      FROM SuperInDB.dbo.MAESTRO_GRAL
      WHERE REPLACE(Coidentif, '-', '') = @cedula;
    `;

    const result = await pool.request().input("cedula", db.sql.VarChar, cedula).query(query);
    pool.close(); // Cerramos conexión después de la consulta

    if (!result.recordset.length) {
      return res.json({ riesgo: "No encontrado" });
    }

    res.json({ riesgo: result.recordset[0].CategoriaRiesgo || "Sin categoría asignada" });
  } catch (error) {
    console.error("Error al consultar la categoría de riesgo:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

/** 🔹 Actualizar la categoría de riesgo */
router.put("/cambiar-riesgo", async (req, res) => {
  const { cedula, nuevaCategoria } = req.body;

  if (!cedula || !nuevaCategoria) {
    return res.status(400).json({ error: "Debe proporcionar cédula y nueva categoría." });
  }

  try {
    const pool = await db.connectSQLServer();
    const updateQuery = `
      UPDATE SuperInDB.dbo.MAESTRO_GRAL
      SET coclasbco = @nuevaCategoria
      WHERE REPLACE(Coidentif, '-', '') = @cedula;
    `;

    await pool.request().input("nuevaCategoria", db.sql.VarChar, nuevaCategoria)
                      .input("cedula", db.sql.VarChar, cedula)
                      .query(updateQuery);

    pool.close(); // ✅ Cerramos conexión después de la actualización

    res.json({ mensaje: "¡Categoría de riesgo actualizada correctamente!" });
  } catch (error) {
    console.error("Error al actualizar la categoría de riesgo:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;