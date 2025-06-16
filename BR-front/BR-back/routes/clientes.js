const express = require("express");
const router = express.Router();
const { connectOracle } = require("../config/db");
const oracledb = require("oracledb");

let dbConnection = null;

// Reutiliza la conexión de Oracle
async function getOracleConnection() {
  if (!dbConnection) {
    dbConnection = await connectOracle();
  }
  return dbConnection;
}

// Función auxiliar para construir la cláusula WHERE de otros filtros (excluye tipoPersona)
function buildFilterWhereClause(estado, segmento) { // tipoPersona ya no se gestiona aquí
  let conditions = [];
  let filterBindParams = {};

  if (estado) {
    conditions.push("Estado = :estado_param");
    filterBindParams.estado_param = estado;
  }
  if (segmento) {
    conditions.push("SegmentoCliente = :segmento_param");
    filterBindParams.segmento_param = segmento;
  }

  if (conditions.length > 0) {
    return { clause: `AND ${conditions.join(' AND ')}`, params: filterBindParams };
  }
  return { clause: '', params: {} };
}


// --- Ruta para obtener todos los clientes con paginación por Claves de Búsqueda (Keyset Pagination) ---
router.get("/", async function ConsultaClientes(req, res) {
  const startTime = process.hrtime.bigint(); // Inicia el cronómetro de la petición

  try {
    const connection = await getOracleConnection();

    const limit = parseInt(req.query.limit) || 10;
    const lastIdentificacion = req.query.lastIdentificacion || null;
    const lastOriginalSortID = req.query.lastOriginalSortID || null;

    const estado = req.query.estado || null;
    const segmento = req.query.segmento || null;
    const tipoPersona = req.query.tipoPersona || null; // Este parámetro ahora controla qué consulta se ejecuta

    let baseQueryClientes = ''; // Consulta base para los datos (sin paginación Keyset)
    let baseCountQuery = '';    // Consulta base para el conteo (sin paginación Keyset)
    let bindParams = { limit_param: limit }; // Parámetros de enlace para la consulta principal

    // Construir la cláusula WHERE para 'estado' y 'segmento'
    let { clause: otherFiltersWhereClause, params: otherFilterParams } = buildFilterWhereClause(estado, segmento);

    // Combinar parámetros de enlace de paginación y otros filtros para la consulta principal
    Object.assign(bindParams, otherFilterParams);

    // Lógica condicional para seleccionar la consulta base según 'tipoPersona'
    if (tipoPersona === 'Empresa') {
      baseQueryClientes = `
        SELECT
          o.ou_num AS Identificacion,
          o.alias_name AS Nombre,
          'Empresa' AS TipoPersona,
          o.cust_stat_cd AS Estado,
          h.x_codigo AS SegmentoCliente,
          'No disponible' AS FechaVencimiento,
          o.ROW_ID AS OriginalSortID
        FROM siebel.s_org_ext o
        LEFT JOIN siebel.s_org_ext_x x ON o.row_id = x.par_row_id
        LEFT JOIN siebel.cx_segmentos h ON h.row_id = o.x_seg_id
        WHERE 1=1 ${otherFiltersWhereClause}
      `;
      baseCountQuery = `
        SELECT COUNT(*) AS total
        FROM siebel.s_org_ext o
        LEFT JOIN siebel.cx_segmentos h ON h.row_id = o.x_seg_id
        WHERE 1=1 ${otherFiltersWhereClause}
      `;
    } else { // Valor por defecto (null, "Física", o cualquier otro) consulta Física
      baseQueryClientes = `
        SELECT
          A.SOC_SECURITY_NUM AS Identificacion,
          A.FST_NAME AS Nombre,
          'Física' AS TipoPersona,
          A.CUST_STAT_CD AS Estado,
          H.X_CODIGO AS SegmentoCliente,
          X.X_FECHA_VENC_PASA AS FechaVencimiento,
          A.ROW_ID AS OriginalSortID
        FROM SIEBEL.S_CONTACT A
        LEFT JOIN SIEBEL.CX_SEGMENTOS H ON H.ROW_ID = A.X_SEG_ID
        LEFT JOIN SIEBEL.S_CONTACT_X X ON X.PAR_ROW_ID = A.ROW_ID
        WHERE 1=1 ${otherFiltersWhereClause}
      `;
      baseCountQuery = `
        SELECT COUNT(*) AS total
        FROM SIEBEL.S_CONTACT A
        LEFT JOIN SIEBEL.CX_SEGMENTOS H ON H.ROW_ID = A.X_SEG_ID
        WHERE 1=1 ${otherFiltersWhereClause}
      `;
    }

    // Lógica de Keyset Pagination para el ORDER BY
    let keysetCondition = ''; // Usaremos solo la condición, no 'AND ' o 'WHERE' aquí
    if (lastIdentificacion && lastOriginalSortID) {
      keysetCondition = `
        (Identificacion > :lastIdentificacion_param OR
         (Identificacion = :lastIdentificacion_param AND OriginalSortID > :lastOriginalSortID_param))
      `;
      bindParams.lastIdentificacion_param = lastIdentificacion;
      bindParams.lastOriginalSortID_param = lastOriginalSortID;
    }

    // Construcción final del WHERE para la query principal
    let finalWhereClause = '';
    if (otherFiltersWhereClause || keysetCondition) {
      finalWhereClause = 'WHERE 1=1'; // Siempre inicia con WHERE 1=1
      if (otherFiltersWhereClause) {
        finalWhereClause += ` ${otherFiltersWhereClause}`; // Añade filtros específicos
      }
      if (keysetCondition) {
        finalWhereClause += ` AND ${keysetCondition}`; // Añade la condición keyset con AND
      }
    }


    const queryClientes = `
      WITH BASE_DATA AS (
        ${baseQueryClientes}
      )
      SELECT Identificacion, Nombre, TipoPersona, Estado, SegmentoCliente, FechaVencimiento, OriginalSortID
      FROM BASE_DATA
      ${finalWhereClause}
      ORDER BY Identificacion ASC, OriginalSortID ASC
      FETCH NEXT (:limit_param + 1) ROWS ONLY
    `;

    // La countQuery ya está construida condicionalmente arriba en baseCountQuery
    const countQuery = baseCountQuery;

    console.log(`Backend - Petición recibida: limit=${limit}, lastIdentificacion=${lastIdentificacion}, lastOriginalSortID=${lastOriginalSortID}, filtros=${JSON.stringify({estado, segmento, tipoPersona})}`);
    console.log(`Backend - SQL main query: ${queryClientes}`);
    console.log(`Backend - Bind Params main query:`, bindParams);
    console.log(`Backend - SQL count query: ${countQuery}`);
    console.log(`Backend - Bind Params count query:`, otherFilterParams);

    const dbQueryStartTime = process.hrtime.bigint(); // Inicia el cronómetro para las consultas a la DB
    const [result, count] = await Promise.all([
      connection.execute(queryClientes, bindParams, { outFormat: oracledb.OUT_FORMAT_OBJECT }),
      connection.execute(countQuery, otherFilterParams, { outFormat: oracledb.OUT_FORMAT_OBJECT })
    ]);
    const dbQueryEndTime = process.hrtime.bigint(); // Finaliza el cronómetro para las consultas a la DB
    console.log(`Backend - Tiempo total consultas DB: ${Number(dbQueryEndTime - dbQueryStartTime) / 1_000_000} ms`);


    let clientes = result.rows || [];
    const hasNextPage = clientes.length > limit;
    clientes = clientes.slice(0, limit);

    const mapStartTime = process.hrtime.bigint(); // Inicia el cronómetro para el mapeo
    const clientesMapped = clientes.map(row => ({
      nombre: row.NOMBRE,
      identificacion: row.IDENTIFICACION,
      estado: row.ESTADO,
      segmento: row.SEGMENTOCLIENTE,
      tipoPersona: row.TIPOPERSONA,
      fechaVenc: row.FECHAVENCIMIENTO,
      originalSortID: row.ORIGINALSORTID
    }));
    const mapEndTime = process.hrtime.bigint(); // Finaliza el cronómetro para el mapeo
    console.log(`Backend - Tiempo de mapeo de clientes: ${Number(mapEndTime - mapStartTime) / 1_000_000} ms`);


    const totalCount = count.rows?.[0]?.TOTAL || 0;

    console.log(`✅ Clientes obtenidos (Página Keyset Filtrada): ${clientesMapped.length} (hasNextPage: ${hasNextPage})`);
    console.log(`Backend - Total de clientes (para el frontend, filtrado): ${totalCount}`);

    const lastRow = clientesMapped.length > 0 ? clientesMapped[clientesMapped.length - 1] : null;

    const finalResponse = {
      clientes: clientesMapped,
      totalCount: totalCount,
      hasNextPage: hasNextPage,
      lastItemKey: lastRow ? {
        lastIdentificacion: lastRow.identificacion,
        lastOriginalSortID: lastRow.originalSortID
      } : null
    };

    const endTime = process.hrtime.bigint(); // Finaliza el cronómetro de la petición total
    console.log(`Backend - Tiempo TOTAL de la petición: ${Number(endTime - startTime) / 1_000_000} ms`);

    res.status(200).json(finalResponse);

  } catch (err) {
    const endTime = process.hrtime.bigint(); // Finaliza el cronómetro en caso de error
    console.error(`❌ Error en la petición (Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms):`, err.message);
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});


// --- NUEVA RUTA: Endpoint para obtener segmentos únicos ---
router.get("/segmentos-unicos", async (req, res) => {
  const startTime = process.hrtime.bigint(); // Inicia el cronómetro
  try {
    const connection = await getOracleConnection();
    const query = `
      SELECT DISTINCT X_CODIGO AS Segmento
      FROM SIEBEL.CX_SEGMENTOS
      ORDER BY Segmento ASC
    `;
    const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const segmentos = (result.rows || []).map(row => row.SEGMENTO);
    console.log(`✅ Segmentos únicos obtenidos: ${segmentos.length}`);
    
    const endTime = process.hrtime.bigint(); // Finaliza el cronómetro
    console.log(`Backend - Tiempo TOTAL de obtener segmentos: ${Number(endTime - startTime) / 1_000_000} ms`);

    res.status(200).json(segmentos);
  } catch (err) {
    const endTime = process.hrtime.bigint(); // Finaliza el cronómetro en caso de error
    console.error(`❌ Error al obtener segmentos únicos (Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms):`, err.message);
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor al obtener segmentos." });
  }
});


// --- Tu ruta existente para buscar por cédula/RNC (sin cambios) ---
router.get("/:cedula", async function BuscarPorCedula(req, res) {
  const startTime = process.hrtime.bigint(); // Inicia el cronómetro
  try {
    const connection = await getOracleConnection();
    const cedula = req.params.cedula;

    const queryFisica = `
      SELECT
        A.SOC_SECURITY_NUM AS Identificacion,
        A.FST_NAME AS Nombre,
        A.CUST_STAT_CD AS Estado,
        H.X_CODIGO AS SegmentoCliente,
        X.X_FECHA_VENC_PASA AS FechaVencimiento
      FROM SIEBEL.S_CONTACT A
      LEFT JOIN SIEBEL.CX_SEGMENTOS H ON H.ROW_ID = A.X_SEG_ID
      LEFT JOIN SIEBEL.S_CONTACT_X X ON X.PAR_ROW_ID = A.ROW_ID
      WHERE A.SOC_SECURITY_NUM = :cedula
    `;

    const queryJuridica = `
      SELECT
        o.row_id           AS ID,
        o.alias_name       AS Nombre,
        o.ou_num           AS Cedula_RNC,
        o.cust_stat_cd     AS Estado,
        h.x_codigo         AS SegmentoCliente,
        'No disponible'    AS FechaVencimiento
      FROM siebel.s_org_ext o
      LEFT JOIN siebel.s_org_ext_x x ON o.row_id = x.par_row_id
      LEFT JOIN siebel.cx_segmentos h ON h.row_id = o.x_seg_id
      WHERE o.ou_num = :cedula
    `;

    const [fisica, juridica] = await Promise.all([
      connection.execute(queryFisica, { cedula }, { outFormat: oracledb.OUT_FORMAT_OBJECT }),
      connection.execute(queryJuridica, { cedula }, { outFormat: oracledb.OUT_FORMAT_OBJECT })
    ]);

    const clientes = [];

    if (fisica.rows.length > 0) {
      const row = fisica.rows[0];
      clientes.push({
        identificacion: row.IDENTIFICACION,
        nombre: row.NOMBRE,
        cedula: row.IDENTIFICACION,
        estado: row.ESTADO,
        segmento: row.SEGMENTOCLIENTE,
        tipoPersona: "Física",
        fechaVenc: row.FECHAVENCIMIENTO
      });
    }

    if (juridica.rows.length > 0) {
      const row = juridica.rows[0];
      clientes.push({
        id: row.ID,
        nombre: row.NOMBRE,
        cedula: row.CEDULA_RNC,
        estado: row.ESTADO,
        segmento: row.SEGMENTOCLIENTE,
        tipoPersona: "Empresa",
        fechaVenc: row.FECHAVENCIMIENTO || "No disponible"
      });
    }

    if (clientes.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    
    const endTime = process.hrtime.bigint(); // Finaliza el cronómetro
    console.log(`Backend - Tiempo TOTAL de búsqueda por cédula: ${Number(endTime - startTime) / 1_000_000} ms`);

    res.status(200).json(clientes.length === 1 ? clientes[0] : clientes);
  } catch (err) {
    const endTime = process.hrtime.bigint(); // Finaliza el cronómetro en caso de error
    console.error(`❌ Error al buscar cliente por cédula (Tiempo TOTAL: ${Number(endTime - startTime) / 1_000_000} ms):`, err.message);
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});


module.exports = router;