const express = require("express");
const router = express.Router();
<<<<<<< HEAD
// CORRECCIÓN: Importar getOraclePoolConnection, que es la función correcta del pool CRM
const { getOraclePoolConnection } = require("../config/db");
const oracledb = require("oracledb");


// Función auxiliar para construir condición keyset pagination
function buildKeysetCondition(tipoPersona, lastIdentificacion, lastOriginalSortID) {
  if (!lastIdentificacion || !lastOriginalSortID) return "";

  if (tipoPersona === "Empresa") {
    return `
      AND (
        (o.ou_num > :lastIdentificacion)
        OR (o.ou_num = :lastIdentificacion AND o.row_id > :lastOriginalSortID)
      )
    `;
  } else {
    // Física
    return `
      AND (
        (A.SOC_SECURITY_NUM > :lastIdentificacion)
        OR (A.SOC_SECURITY_NUM = :lastIdentificacion AND A.ROW_ID > :lastOriginalSortID)
      )
    `;
  }
}

router.get("/", async function ConsultaClientes(req, res) {
  const startTime = process.hrtime.bigint();
  let connection; // Declarar connection aquí para que esté disponible en finally
=======
const { connectOracle } = require("../config/db");

let dbConnection = null; // 🔹 Mantener la conexión viva

async function getOracleConnection() {
  if (!dbConnection) {
    dbConnection = await connectOracle();
  }
  return dbConnection;
}
>>>>>>> 637d44f740325e0150be4366d05ff84952d8d5dd

  try {
<<<<<<< HEAD
    // CORRECCIÓN: Usar getOraclePoolConnection
    connection = await getOraclePoolConnection();

    // Parámetros
    const limit = Math.min(parseInt(req.query.limit) || 20, 1000); 
    const tipoPersona = req.query.tipoPersona;
    const estado = req.query.estado || null;
    const segmento = req.query.segmento || null;
    const nacionalidad = req.query.nacionalidad || null;
    const residencia = req.query.residencia || null;
    const lastIdentificacion = req.query.lastIdentificacion || null;
    const lastOriginalSortID = req.query.lastOriginalSortID || null;

    if (!tipoPersona || (tipoPersona !== "Física" && tipoPersona !== "Empresa")) {
      return res.status(400).json({ error: "Parámetro 'tipoPersona' es obligatorio y debe ser 'Física' o 'Empresa'." });
    }

    let bindParams = { limit };
    let whereClause = "1=1";

    // Condición keyset para paginación
    const keysetCond = buildKeysetCondition(tipoPersona, lastIdentificacion, lastOriginalSortID);
    if (keysetCond) {
      bindParams.lastIdentificacion = lastIdentificacion;
      bindParams.lastOriginalSortID = lastOriginalSortID;
    }

    if (tipoPersona === "Empresa") {
      if (estado) {
        whereClause += " AND o.CUST_STAT_CD = :estado";
        bindParams.estado = estado;
      }
      if (segmento) {
        whereClause += " AND h.X_CODIGO = :segmento";
        bindParams.segmento = segmento;
      }

      const query = `
        SELECT
          o.ou_num AS Identificacion,
          o.alias_name AS Nombre,
          'Empresa' AS TipoPersona,
          o.cust_stat_cd AS Estado,
          h.x_codigo AS SegmentoCliente,
          'No disponible' AS FechaVencimiento,
          o.ROW_ID AS OriginalSortID
        FROM siebel.s_org_ext o
        LEFT JOIN siebel.cx_segmentos h ON h.row_id = o.x_seg_id
        WHERE ${whereClause}
        ${keysetCond}
        AND ROWNUM <= :limit
        ORDER BY o.ou_num ASC, o.row_id ASC
      `;

      const result = await connection.execute(query, bindParams, { outFormat: oracledb.OUT_FORMAT_OBJECT });

      const clientes = result.rows.map(row => ({
        identificacion: row.IDENTIFICACION,
        nombre: row.NOMBRE,
        estado: row.ESTADO,
        segmento: row.SEGMENTOCLIENTE,
        tipoPersona: row.TIPOPERSONA,
        fechaVenc: row.FECHAVENCIMIENTO,
        originalSortID: row.ORIGINALSORTID
      }));

      const totalCount = clientes.length; 
      const hasNextPage = clientes.length === limit; 
      const lastItemKey = hasNextPage
        ? {
          lastIdentificacion: clientes[clientes.length - 1].identificacion,
          lastOriginalSortID: clientes[clientes.length - 1].originalSortID,
        }
        : null;

      const endTime = process.hrtime.bigint();
      console.log(`✅ Empresas obtenidas: ${clientes.length} | Tiempo: ${Number(endTime - startTime) / 1_000_000} ms`);

      return res.status(200).json({ clientes, totalCount, hasNextPage, lastItemKey });
    }

    // --- Persona Física ---
    if (estado) {
      whereClause += " AND A.CUST_STAT_CD = :estado";
      bindParams.estado = estado;
    }
    if (segmento) {
      whereClause += " AND H.X_CODIGO = :segmento";
      bindParams.segmento = segmento;
    }
    if (nacionalidad) {
      whereClause += " AND UPPER(TRIM(A.NATIONALITY)) = UPPER(TRIM(:nacionalidad))";
      bindParams.nacionalidad = nacionalidad.trim();
    }
    if (residencia) {
      whereClause += " AND UPPER(TRIM(A.RESIDENT_STAT_CD)) = UPPER(TRIM(:residencia))";
      bindParams.residencia = residencia.trim();
    }

    const query = `
      SELECT
        A.SOC_SECURITY_NUM AS Identificacion,
        A.FST_NAME AS Nombre,
        'Física' AS TipoPersona,
        A.CUST_STAT_CD AS Estado,
        H.X_CODIGO AS SegmentoCliente,
        X.X_FECHA_VENC_PASA AS FechaVencimiento,
        A.NATIONALITY AS Nacionalidad,
        A.RESIDENT_STAT_CD AS Residencia,
        A.ROW_ID AS OriginalSortID
      FROM SIEBEL.S_CONTACT A
      LEFT JOIN SIEBEL.CX_SEGMENTOS H ON H.ROW_ID = A.X_SEG_ID
      LEFT JOIN SIEBEL.S_CONTACT_X X ON X.PAR_ROW_ID = A.ROW_ID
      WHERE ${whereClause}
      ${keysetCond}
      AND ROWNUM <= :limit
      ORDER BY A.SOC_SECURITY_NUM ASC, A.ROW_ID ASC
    `;

    const result = await connection.execute(query, bindParams, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    const clientes = result.rows.map(row => ({
      identificacion: row.IDENTIFICACION,
      nombre: row.NOMBRE,
      estado: row.ESTADO,
      segmento: row.SEGMENTOCLIENTE,
      tipoPersona: row.TIPOPERSONA,
      fechaVenc: row.FECHAVENCIMIENTO,
      nacionalidad: row.NACIONALIDAD,
      residencia: row.RESIDENCIA,
      originalSortID: row.ORIGINALSORTID
    }));

    const hasNextPage = clientes.length === limit;

    const lastItemKey = hasNextPage
      ? {
        lastIdentificacion: clientes[clientes.length - 1].identificacion,
        lastOriginalSortID: clientes[clientes.length - 1].originalSortID,
      }
      : null;

    const totalCount = clientes.length; // Esto es solo el count de la página actual

    const endTime = process.hrtime.bigint();
    console.log(`✅ Físicos obtenidos: ${clientes.length} | Tiempo: ${Number(endTime - startTime) / 1_000_000} ms`);

    return res.status(200).json({ clientes, totalCount, hasNextPage, lastItemKey });
=======
    const connection = await getOracleConnection();

    const queryFisica = `
SELECT
  CAST(NULL AS NUMBER) AS id,
  TRIM(A.FST_NAME || ' ' || A.MID_NAME || ' ' || A.LAST_NAME || ' ' || A.MAIDEN_NAME) AS nombre,
  A.SOC_SECURITY_NUM AS cedula,
  'activo' AS estado,
  H.X_CODIGO AS segmento,
  'Bajo' AS categoria,
  'Física' AS tipoPersona,
  TO_CHAR(X.X_FECHA_VENC_PASA, 'YYYY-MM-DD') AS fechaVenc
FROM SIEBEL.S_CONTACT A
LEFT JOIN SIEBEL.CX_SEGMENTOS H ON H.ROW_ID = A.X_SEG_ID
LEFT JOIN SIEBEL.S_CONTACT_X X ON X.PAR_ROW_ID = A.ROW_ID
`;

    const queryJuridica = `
SELECT
  CAST(NULL AS NUMBER) AS id,
  o.alias_name AS nombre,
  o.ou_num AS cedula,
  o.cust_stat_cd AS estado,
  h.x_codigo AS segmento,
  f.desc_text AS categoria,
  x.x_attrib_85 AS tipoPersona,
  NULL AS fechaVenc
FROM siebel.s_org_ext o
LEFT JOIN siebel.s_org_ext_x x ON o.row_id = x.par_row_id
LEFT JOIN siebel.eai_view_lst_of_val f
  ON f.val = x.x_attrib_105
  AND f.type = 'BR_PJ_TIPO_CLIENTE'
  AND f.lang_id = 'ESN'
  AND f.active_flg = 'Y'
LEFT JOIN siebel.cx_segmentos h ON h.row_id = o.x_seg_id
`;

    // Ejecutarlas separadas y luego unir resultados:
    const [result1, result2] = await Promise.all([
      connection.execute(queryFisica),
      connection.execute(queryJuridica)
    ]);

    const clientes = result.rows.map(row => ({
      id: row[0],
      nombre: row[1],
      cedula: row[2],
      estado: row[3],
      segmento: row[4],
      categoria: row[5],
      tipoPersona: row[6],
      fechaVenc: row[7]
    }));

    console.log("✅ Clientes obtenidos:", clientes.length);
    res.status(200).json(clientes); // Enviar objetos, no arrays crudos
    ;

>>>>>>> 637d44f740325e0150be4366d05ff84952d8d5dd
  } catch (err) {
    const endTime = process.hrtime.bigint();
    console.error(`❌ Error: (${Number(endTime - startTime) / 1_000_000} ms):`, err.message);
    return res.status(500).json({ error: "Error interno del servidor." });
  } finally {
    // Asegúrate de liberar la conexión en el bloque finally
    if (connection) {
      try {
        await connection.release();
      } catch (e) {
        console.error("Error al liberar la conexión:", e);
      }
    }
  }
});

router.get("/segmentos-unicos", async (req, res) => {
  const startTime = process.hrtime.bigint();
  let connection; // Declarar connection aquí

  try {
    // CORRECCIÓN: Usar getOraclePoolConnection
    connection = await getOraclePoolConnection();

    const query = `
      SELECT DISTINCT X_CODIGO AS Segmento
      FROM SIEBEL.CX_SEGMENTOS
      ORDER BY Segmento ASC
    `;
    const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const segmentos = (result.rows || []).map(row => row.SEGMENTO);
    console.log(`✅ Segmentos únicos obtenidos: ${segmentos.length}`);

    const endTime = process.hrtime.bigint();
    console.log(`Backend - Tiempo TOTAL de obtener segmentos: ${Number(endTime - startTime) / 1_000_000} ms`);

    res.status(200).json(segmentos);
  } catch (err) {
    const endTime = process.hrtime.bigint();
    console.error(`❌ Error al obtener segmentos únicos (Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms):`, err.message);
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor al obtener segmentos." });
  } finally {
    // Asegúrate de liberar la conexión en el bloque finally
    if (connection) {
      try {
        await connection.release();
      } catch (e) {
        console.error("Error al liberar la conexión:", e);
      }
    }
  }
});

router.get("/nacionalidad-unica", async (req, res) => {
  let connection; // Declarar connection aquí
  try {
    // CORRECCIÓN: Usar getOraclePoolConnection
    connection = await getOraclePoolConnection();

    const result = await connection.execute(
      `SELECT DISTINCT NATIONALITY AS nacionalidad
        FROM SIEBEL.S_CONTACT
        WHERE NATIONALITY IS NOT NULL
        ORDER BY nacionalidad`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const nacionalidades = result.rows.map(row => row.NACIONALIDAD);
    return res.json(nacionalidades);
  } catch (error) {
    console.error("Error nacionalidad-unica:", error);
    return res.status(500).json({ error: "Error al obtener nacionalidades únicas" });
  } finally {
    // Asegúrate de liberar la conexión en el bloque finally
    if (connection) {
      try {
        await connection.release();
      } catch (e) {
        console.error("Error al liberar la conexión:", e);
      }
    }
  }
});

router.get("/residencia-unica", async (req, res) => {
  let connection; // Declarar connection aquí
  try {
    // CORRECCIÓN: Usar getOraclePoolConnection
    connection = await getOraclePoolConnection();
    const result = await connection.execute(
      `SELECT DISTINCT RESIDENT_STAT_CD AS residencia
        FROM SIEBEL.S_CONTACT
        WHERE RESIDENT_STAT_CD IS NOT NULL
        ORDER BY residencia`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const residencias = result.rows.map(row => row.RESIDENCIA);
    return res.json(residencias);
  } catch (error) {
    console.error("Error residencia-unica:", error);
    return res.status(500).json({ error: "Error al obtener residencias únicas" });
  } finally {
    // Asegúrate de liberar la conexión en el bloque finally
    if (connection) {
      try {
        await connection.release();
      } catch (e) {
        console.error("Error al liberar la conexión:", e);
      }
    }
  }
});

// --- Tu ruta existente para buscar por cédula/RNC (sin cambios) ---
router.get("/:cedula", async function BuscarPorCedula(req, res) {
  const startTime = process.hrtime.bigint();
  let connection; // Declarar connection aquí
  try {
    // CORRECCIÓN: Usar getOraclePoolConnection
    connection = await getOraclePoolConnection();
    const cedula = req.params.cedula;

    const queryFisica = `
      SELECT
        A.ROW_ID AS ID,
        A.SOC_SECURITY_NUM AS Identificacion,
        A.FST_NAME AS Nombre,
        A.CUST_STAT_CD AS Estado,
        H.X_CODIGO AS SegmentoCliente,
        X.X_FECHA_VENC_PASA AS FechaVencimiento,
        A.NATIONALITY AS Nacionalidad,
        A.RESIDENT_STAT_CD AS Residencia
      FROM SIEBEL.S_CONTACT A
      LEFT JOIN SIEBEL.CX_SEGMENTOS H ON H.ROW_ID = A.X_SEG_ID
      LEFT JOIN SIEBEL.S_CONTACT_X X ON X.PAR_ROW_ID = A.ROW_ID
      WHERE A.SOC_SECURITY_NUM = :cedula
    `;

    const queryJuridica = `
      SELECT
        o.ROW_ID AS ID,
        o.ALIAS_NAME AS Nombre,
        o.OU_NUM AS CedulaRNC,
        o.CUST_STAT_CD AS Estado,
        h.X_CODIGO AS SegmentoCliente,
        'No disponible' AS FechaVencimiento
      FROM siebel.s_org_ext o
      LEFT JOIN siebel.s_org_ext_x x ON o.ROW_ID = x.PAR_ROW_ID
      LEFT JOIN siebel.CX_SEGMENTOS h ON h.ROW_ID = o.X_SEG_ID
      WHERE o.OU_NUM = :cedula
    `;

    const [fisica, juridica] = await Promise.all([
      connection.execute(queryFisica, { cedula }, { outFormat: oracledb.OUT_FORMAT_OBJECT }),
      connection.execute(queryJuridica, { cedula }, { outFormat: oracledb.OUT_FORMAT_OBJECT })
    ]);

    const clientes = [];

    if (fisica.rows.length > 0) {
      const row = fisica.rows[0];
      clientes.push({
        id: row.ID,
        nombre: row.NOMBRE,
        identificacion: row.IDENTIFICACION,
        cedula: row.IDENTIFICACION,
        estado: row.ESTADO,
        segmento: row.SEGMENTOCLIENTE,
        tipoPersona: "Física",
        fechaVenc: row.FECHAVENCIMIENTO,
        nacionalidad: row.NACIONALIDAD,
        residencia: row.RESIDENCIA
      });
    }

    if (juridica.rows.length > 0) {
      const row = juridica.rows[0];
      clientes.push({
        id: row.ID,
        nombre: row.NOMBRE,
        identificacion: row.CEDULARNC,
        cedula: row.CEDULARNC,
        estado: row.ESTADO,
        segmento: row.SEGMENTOCLIENTE,
        tipoPersona: "Empresa",
        fechaVenc: row.FECHAVENCIMIENTO,
        nacionalidad: "No disponible",
        residencia: "No disponible"
      });
    }

    if (clientes.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const endTime = process.hrtime.bigint();
    console.log(`🔎 Búsqueda por cédula completada en ${(Number(endTime - startTime) / 1_000_000).toFixed(2)} ms`);

    // Si hay solo uno, retornar objeto plano
    res.status(200).json(clientes.length === 1 ? clientes[0] : clientes);

  } catch (err) {
    const endTime = process.hrtime.bigint();
    console.error(`❌ Error al buscar cliente por cédula (${Number(endTime - startTime) / 1_000_000} ms):`, err.message);
    return res.status(500).json({ error: "Error interno del servidor." });
  } finally {
    // Asegúrate de liberar la conexión en el bloque finally
    if (connection) {
      try {
        await connection.release();
      } catch (e) {
        console.error("Error al liberar la conexión:", e);
      }
    }
  }
});

module.exports = router;