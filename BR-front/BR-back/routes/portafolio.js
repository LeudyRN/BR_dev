const express = require("express");
const oracledb = require("oracledb");
const router = express.Router();
const { getFocusConnection, getOraclePoolConnection } = require("../config/db");

router.get("/clientes", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 1000);
  const page = parseInt(req.query.page || "1");
  const startIndex = (page - 1) * limit;

  const tipoCuenta = req.query.tipoCuenta || null;
  const tipoPrestamo = req.query.tipoPrestamo || null;
  const estatus = req.query.estatus || null;
  const cvScoreMin = req.query.cvScoreMin ? parseInt(req.query.cvScoreMin) : null;
  const cvScoreMax = req.query.cvScoreMax ? parseInt(req.query.cvScoreMax) : null;
  const fechaUltimaActualizacionDesde = req.query.fechaUltimaActualizacionDesde || null;
  const fechaUltimaActualizacionHasta = req.query.fechaUltimaActualizacionHasta || null;
  const fechaDeInformacionDesde = req.query.fechaDeInformacionDesde || null;
  const fechaDeInformacionHasta = req.query.fechaDeInformacionHasta || null;
  const relacionClienteCuenta = req.query.relacionClienteCuenta || null;

  let connectionFocus = null;
  let connectionCRM = null;

  try {
    connectionFocus = await getFocusConnection();
    connectionCRM = await getOraclePoolConnection();

    const filterConditions = [];
    const bindParams = {};

    if (tipoCuenta) {
      filterConditions.push("TIPO_CUENTA = :tipoCuenta");
      bindParams.tipoCuenta = tipoCuenta;
    }
    if (tipoPrestamo) {
      filterConditions.push("TIPO_DE_PRESTAMO = :tipoPrestamo");
      bindParams.tipoPrestamo = tipoPrestamo;
    }
    if (estatus) {
      filterConditions.push("ESTATUS = :estatus");
      bindParams.estatus = estatus;
    }
    if (cvScoreMin !== null) {
      filterConditions.push("CVSCORE >= :cvScoreMin");
      bindParams.cvScoreMin = cvScoreMin;
    }
    if (cvScoreMax !== null) {
      filterConditions.push("CVSCORE <= :cvScoreMax");
      bindParams.cvScoreMax = cvScoreMax;
    }

    const toYYYYMMDD = (fecha) => {
      if (!fecha || typeof fecha !== 'string') return null;
      const cleaned = fecha.replace(/-/g, '');
      const parsed = parseInt(cleaned);
      return isNaN(parsed) ? null : parsed;
    };

    const fechaDesdeParsed = toYYYYMMDD(fechaUltimaActualizacionDesde);
    if (fechaDesdeParsed !== null) {
      filterConditions.push("FECHA_ULTIMA_ACTUALIZACION >= :fechaUltimaActualizacionDesde");
      bindParams.fechaUltimaActualizacionDesde = { val: fechaDesdeParsed, type: oracledb.NUMBER };
    }

    const fechaHastaParsed = toYYYYMMDD(fechaUltimaActualizacionHasta);
    if (fechaHastaParsed !== null) {
      filterConditions.push("FECHA_ULTIMA_ACTUALIZACION <= :fechaUltimaActualizacionHasta");
      bindParams.fechaUltimaActualizacionHasta = { val: fechaHastaParsed, type: oracledb.NUMBER };
    }

    const fechaInfoDesdeParsed = toYYYYMMDD(fechaDeInformacionDesde);
    if (fechaInfoDesdeParsed !== null) {
      filterConditions.push("FECHA_DE_INFORMACION >= :fechaDeInformacionDesde");
      bindParams.fechaDeInformacionDesde = { val: fechaInfoDesdeParsed, type: oracledb.NUMBER };
    }

    const fechaInfoHastaParsed = toYYYYMMDD(fechaDeInformacionHasta);
    if (fechaInfoHastaParsed !== null) {
      filterConditions.push("FECHA_DE_INFORMACION <= :fechaDeInformacionHasta");
      bindParams.fechaDeInformacionHasta = { val: fechaInfoHastaParsed, type: oracledb.NUMBER };
    }

    if (relacionClienteCuenta) {
      filterConditions.push("RELACION_DEL_CLIENTE_CON_LA_CUENTA = :relacionClienteCuenta");
      bindParams.relacionClienteCuenta = relacionClienteCuenta;
    }

    const whereClause = filterConditions.length > 0 ? `WHERE ${filterConditions.join(" AND ")}` : "";

    const batchSize = 300;
    const clientesFinal = [];
    const seenCedulas = new Set();
    let totalValidos = 0;
    let offset = 0;

    while (clientesFinal.length < limit) {
      const focusQuery = `
    SELECT
      REPLACE(cedula_nueva, '-', '') AS cedula,
      NOBRE_1,
      NOBRE_2,
      APELLIDO_1,
      APELLIDO_2,
      TIPO_CUENTA,
      TIPO_DE_PRESTAMO,
      FECHA_ULTIMA_ACTUALIZACION,
      FECHA_DE_INFORMACION,
      ESTATUS,
      CVSCORE,
      RELACION_DEL_CLIENTE_CON_LA_CUENTA,
      ROWID AS row_id
    FROM focus.datatu
    ${whereClause}
    OFFSET ${offset} ROWS FETCH NEXT ${batchSize} ROWS ONLY
  `;

      const result = await connectionFocus.execute(focusQuery, bindParams, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      if (result.rows.length === 0) break;

      const batch = result.rows.map(row => ({
        cedula: row.CEDULA,
        nombreCompleto: [row.NOBRE_1, row.NOBRE_2, row.APELLIDO_1, row.APELLIDO_2].filter(Boolean).join(" "),
        tipoCuenta: row.TIPO_CUENTA,
        tipoPrestamo: row.TIPO_DE_PRESTAMO,
        fechaUltimaActualizacion: row.FECHA_ULTIMA_ACTUALIZACION,
        fechaInformacion: row.FECHA_DE_INFORMACION,
        estatus: row.ESTATUS,
        cvscore: row.CVSCORE,
        relacion: row.RELACION_DEL_CLIENTE_CON_LA_CUENTA,
        rowId: row.ROW_ID,
      })).filter(c => !seenCedulas.has(c.cedula));

      const cedulas = batch.map(c => c.cedula);
      if (cedulas.length === 0) {
        offset += batchSize;
        continue;
      }

      const inPlaceholders = cedulas.map((_, i) => `:c${i}`).join(", ");
      const bindParamsCRM = {};
      cedulas.forEach((cedula, i) => {
        bindParamsCRM[`c${i}`] = cedula;
      });

      const [result1, result2] = await Promise.all([
        connectionCRM.execute(
          `SELECT REPLACE(SOC_SECURITY_NUM, '-', '') AS cedula FROM SIEBEL.S_CONTACT WHERE CUST_STAT_CD = 'ACTIVO' AND REPLACE(SOC_SECURITY_NUM, '-', '') IN (${inPlaceholders})`,
          bindParamsCRM,
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        ),
        connectionCRM.execute(
          `SELECT REPLACE(OU_NUM, '-', '') AS cedula FROM SIEBEL.S_ORG_EXT WHERE CUST_STAT_CD = 'ACTIVO' AND REPLACE(OU_NUM, '-', '') IN (${inPlaceholders})`,
          bindParamsCRM,
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        )
      ]);

      const cedulasActivas = new Set([...result1.rows, ...result2.rows].map(r => r.CEDULA));
      const activos = batch.filter(c => cedulasActivas.has(c.cedula));

      for (const cliente of activos) {
        if (totalValidos >= startIndex) {
          clientesFinal.push(cliente);
          if (clientesFinal.length >= limit) break;
        }
        seenCedulas.add(cliente.cedula);
        totalValidos++;
      }

      offset += batchSize;
    }

    res.json({
      clientes: clientesFinal,
      totalCount: totalValidos,
      hasNextPage: totalValidos > startIndex + limit,
      lastItemKey: clientesFinal.length ? {
        lastIdentificacion: clientesFinal[clientesFinal.length - 1].cedula,
        lastOriginalSortID: clientesFinal[clientesFinal.length - 1].rowId
      } : null
    });

  } catch (error) {
    console.error("❌ Error en /clientes:", error);
    res.status(500).json({ error: "Error al procesar los clientes del portafolio." });
  } finally {
    if (connectionFocus) {
      try { await connectionFocus.close(); } catch (e) { console.warn("Error cerrando conexión Focus:", e.message); }
    }
    if (connectionCRM) {
      try { await connectionCRM.close(); } catch (e) { console.warn("Error cerrando conexión CRM:", e.message); }
    }
  }
});

router.get("/tipos-cuenta", async (req, res) => {
  let connection;
  try {
    connection = await getFocusConnection();

    const query = `
      SELECT DISTINCT TIPO_CUENTA
      FROM focus.datatu
      WHERE TIPO_CUENTA IS NOT NULL
      ORDER BY TIPO_CUENTA ASC
    `;

    const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const tipos = result.rows.map(row => row.TIPO_CUENTA);
    res.status(200).json(tipos);
  } catch (err) {
    console.error("❌ Error en /tipos-cuenta:", err.message);
    res.status(500).json({ error: "Error al obtener tipos de cuenta." });
  } finally {
    if (connection) await connection.close();
  }
});

router.get("/tipos-prestamo", async (req, res) => {
  let connection;
  try {
    connection = await getFocusConnection();

    const query = `
      SELECT DISTINCT TIPO_DE_PRESTAMO
      FROM focus.datatu
      WHERE TIPO_DE_PRESTAMO IS NOT NULL
      ORDER BY TIPO_DE_PRESTAMO ASC
    `;

    const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const tipos = result.rows.map(row => row.TIPO_DE_PRESTAMO);
    res.status(200).json(tipos);
  } catch (err) {
    console.error("❌ Error en /tipos-prestamo:", err.message);
    res.status(500).json({ error: "Error al obtener tipos de préstamo." });
  } finally {
    if (connection) await connection.close();
  }
});

router.get("/estatus", async (req, res) => {
  let connection;
  try {
    connection = await getFocusConnection();

    const query = `
      SELECT DISTINCT ESTATUS
      FROM focus.datatu
      WHERE ESTATUS IS NOT NULL
      ORDER BY ESTATUS ASC
    `;

    const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const estatusList = result.rows.map(row => row.ESTATUS);
    res.status(200).json(estatusList);
  } catch (err) {
    console.error("❌ Error en /estatus:", err.message);
    res.status(500).json({ error: "Error al obtener estatus." });
  } finally {
    if (connection) await connection.close();
  }
});

router.get("/relaciones", async (req, res) => {
  let connection;
  try {
    connection = await getFocusConnection();

    const query = `
      SELECT DISTINCT RELACION_DEL_CLIENTE_CON_LA_CUENTA
      FROM focus.datatu
      WHERE RELACION_DEL_CLIENTE_CON_LA_CUENTA IS NOT NULL
      ORDER BY RELACION_DEL_CLIENTE_CON_LA_CUENTA ASC
    `;

    const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const relaciones = result.rows.map(row => row.RELACION_DEL_CLIENTE_CON_LA_CUENTA);
    res.status(200).json(relaciones);
  } catch (err) {
    console.error("❌ Error en /relaciones:", err.message);
    res.status(500).json({ error: "Error al obtener relaciones cliente-cuenta." });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;