const express = require("express");
const router = express.Router();
const { getSafeOracleConnection } = require("../config/db");
const oracledb = require("oracledb");


// *** LOG DE DEPURACIÓN AL INICIO DEL ROUTER (PARA VERIFICAR SI LA PETICIÓN LLEGA AQUÍ) ***
router.use((req, res, next) => {
  console.log(`DEBUG_ROUTER: Petición recibida en /api/segmentos. Método: ${req.method}, URL: ${req.originalUrl}`);
  next(); // Continúa con la siguiente ruta o middleware
});
// ***********************************************************************************

/**  Consultar el segmento del cliente por cédula o RNC (Usando Promise.all) */
// Ruta GET ajustada a /:cedula (sin /cliente)
router.get("/:cedula", async (req, res) => {
  const { cedula } = req.params;
  const startTime = process.hrtime.bigint();

  if (!cedula) {
    return res.status(400).json({ error: "Debe proporcionar una cédula o RNC." });
  }

  console.log(`DEBUG: [GET /:cedula] Petición recibida. Cédula/RNC: '${cedula}' (Longitud: ${cedula.length})`);

  try {
    const connection = await getSafeOracleConnection();

    // Consultas para Persona Física y Empresa, AMBAS SIN TRIM() en la columna de la DB
    const queryFisica = `
      SELECT
        A.SOC_SECURITY_NUM AS Identificacion,
        H.X_CODIGO AS SegmentoCliente,
        'Física' AS TipoPersona
      FROM SIEBEL.S_CONTACT A
      LEFT JOIN SIEBEL.CX_SEGMENTOS H ON H.ROW_ID = A.X_SEG_ID
      WHERE A.SOC_SECURITY_NUM = :cedula -- Removido TRIM() de la columna DB
    `;

    const queryEmpresa = `
      SELECT
        o.ou_num AS Identificacion,
        h.x_codigo AS SegmentoCliente,
        'Empresa' AS TipoPersona
      FROM siebel.s_org_ext o
      LEFT JOIN siebel.cx_segmentos h ON h.row_id = o.x_seg_id
      WHERE o.ou_num = :cedula -- Removido TRIM() de la columna DB
    `;

    // Ejecuta ambas consultas en paralelo
    console.log(`DEBUG: [GET /:cedula] Ejecutando ambas consultas en paralelo: Fisica y Empresa.`);
    const [resultFisica, resultEmpresa] = await Promise.all([
      connection.execute(queryFisica, { cedula }, { outFormat: oracledb.OUT_FORMAT_OBJECT }),
      connection.execute(queryEmpresa, { cedula }, { outFormat: oracledb.OUT_FORMAT_OBJECT })
    ]);

    console.log(`DEBUG: [GET /:cedula] Resultado de queryFisica.rows:`, resultFisica.rows);
    console.log(`DEBUG: [GET /:cedula] Resultado de queryEmpresa.rows:`, resultEmpresa.rows);

    let clientInfo = null;
    if (resultFisica.rows.length > 0) {
      clientInfo = resultFisica.rows[0];
    } else if (resultEmpresa.rows.length > 0) {
      clientInfo = resultEmpresa.rows[0];
    }

    if (clientInfo) {
      const endTime = process.hrtime.bigint();
      console.log(`DEBUG: [GET /:cedula] Cliente encontrado: ${JSON.stringify(clientInfo)}`);
      console.log(`Backend - Tiempo TOTAL de consulta segmento: ${Number(endTime - startTime) / 1_000_000} ms`);
      return res.json({
        identificacion: clientInfo.IDENTIFICACION,
        segmento: clientInfo.SEGMENTOCLIENTE || "Sin Segmento",
        tipoPersona: clientInfo.TipoPersona // Devolver el tipo de persona
      });
    } else {
      const endTime = process.hrtime.bigint();
      console.log(`Backend - Cliente no encontrado. Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms`);
      res.status(404).json({ error: "Cliente no encontrado." });
    }

  } catch (error) {
    const endTime = process.hrtime.bigint();
    console.error(`❌ Error al consultar segmento (Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms):`, error);
    res.status(500).json({ error: "Error interno del servidor al consultar segmento." });
  }
});


// Ruta PUT ajustada a / (sin /cliente)
router.put("/", async (req, res) => {
  const { cedula, nuevoSegmentoCodigo } = req.body;
  const startTime = process.hrtime.bigint();

  if (!cedula || !nuevoSegmentoCodigo) {
    return res.status(400).json({ error: "Debe proporcionar cédula/RNC y un nuevo segmento." });
  }

  console.log(`DEBUG: [PUT /] Petición recibida. Cédula/RNC: '${cedula}', Nuevo Segmento: '${nuevoSegmentoCodigo}'`);

  try {
    const connection = await getSafeOracleConnection();

    // 1. Obtener el ROW_ID del nuevo segmento desde CX_SEGMENTOS
    const getSegmentIdQuery = `
      SELECT ROW_ID FROM SIEBEL.CX_SEGMENTOS WHERE X_CODIGO = :nuevoSegmentoCodigo
    `;
    console.log(`DEBUG: [PUT /] Buscando ROW_ID para segmento: '${nuevoSegmentoCodigo}'`);
    const segmentResult = await connection.execute(getSegmentIdQuery, { nuevoSegmentoCodigo }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    console.log(`DEBUG: [PUT /] Resultado de búsqueda de ROW_ID de segmento:`, segmentResult.rows);

    if (segmentResult.rows.length === 0) {
      const endTime = process.hrtime.bigint();
      console.log(`Backend - Nuevo segmento '${nuevoSegmentoCodigo}' no encontrado en CX_SEGMENTOS. Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms`);
      return res.status(404).json({ error: `El segmento '${nuevoSegmentoCodigo}' no existe.` });
    }
    const newSegmentRowId = segmentResult.rows[0].ROW_ID;
    console.log(`DEBUG: [PUT /] ROW_ID del nuevo segmento: '${newSegmentRowId}'`);

    let rowsAffected = 0;

    // 2. Intentar actualizar en S_CONTACT (Persona Física) - Removido TRIM() de la columna DB
    const updateQueryFisica = `
      UPDATE SIEBEL.S_CONTACT
      SET X_SEG_ID = :newSegmentRowId
      WHERE SOC_SECURITY_NUM = :cedula
    `;
    console.log(`DEBUG: [PUT /] Intentando actualización en S_CONTACT.`);
    const updateResultFisica = await connection.execute(updateQueryFisica, { newSegmentRowId, cedula }, { autoCommit: true });
    rowsAffected = updateResultFisica.rowsAffected || 0;
    console.log(`DEBUG: [PUT /] Filas afectadas en S_CONTACT: ${rowsAffected}`);

    // 3. Si no se actualizó en S_CONTACT, intentar actualizar en S_ORG_EXT (Empresa) - Removido TRIM() de la columna DB
    if (rowsAffected === 0) {
      const updateQueryEmpresa = `
        UPDATE siebel.s_org_ext
        SET X_SEG_ID = :newSegmentRowId
        WHERE ou_num = :cedula
      `;
      console.log(`DEBUG: [PUT /] Intentando actualización en S_ORG_EXT.`);
      const updateResultEmpresa = await connection.execute(updateQueryEmpresa, { newSegmentRowId, cedula }, { autoCommit: true });
      rowsAffected = updateResultEmpresa.rowsAffected || 0;
      console.log(`DEBUG: [PUT /] Filas afectadas en S_ORG_EXT: ${rowsAffected}`);
    }

    if (rowsAffected > 0) {
      const endTime = process.hrtime.bigint();
      console.log(`Backend - Segmento actualizado correctamente. Filas afectadas: ${rowsAffected}. Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms`);
      res.json({ mensaje: "¡Segmento actualizado correctamente!" });
    } else {
      const endTime = process.hrtime.bigint();
      console.log(`Backend - Cliente no encontrado para actualización con la cédula/RNC. Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms`);
      res.status(404).json({ error: "Cliente no encontrado para la actualización. Verifique la cédula/RNC." });
    }

  } catch (error) {
    const endTime = process.hrtime.bigint();
    console.error(`❌ Error al actualizar segmento (Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms):`, error);
    res.status(500).json({ error: "Error interno del servidor al actualizar segmento." });
  }
});

module.exports = router;
