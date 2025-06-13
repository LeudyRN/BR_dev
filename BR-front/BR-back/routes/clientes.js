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
    const connection = await getOracleConnection();

const query = `
SELECT
    TO_CHAR(o.ou_num) AS Identificacion, -- Convertimos a VARCHAR2 para compatibilidad
    o.alias_name AS NombreCompleto,
    x.x_attrib_110 AS NombreComercial,
    f.desc_text AS TipoCliente,
    x.x_attrib_85 AS TipoPersona,
    TO_CHAR(o.cust_stat_cd) AS Estado, -- Convertimos a VARCHAR2
    h.x_codigo AS SegmentoCliente,
    'NO DISPONIBLE' AS Riesgo, -- 🔹 No hay una columna específica para "Riesgo", así que usamos un valor por defecto
    TO_CHAR(X.X_FECHA_VENC_PASA, 'YYYY-MM-DD') AS FechaVencimiento -- Convertimos fecha a formato legible
FROM siebel.s_org_ext o
LEFT JOIN siebel.s_org_ext_x x ON o.row_id = x.par_row_id
LEFT JOIN siebel.eai_view_lst_of_val f ON f.val = x.x_attrib_105 AND f.type = 'BR_PJ_TIPO_CLIENTE' AND f.lang_id = 'ESN' AND f.active_flg = 'Y'
LEFT JOIN siebel.cx_segmentos h ON h.row_id = o.x_seg_id

UNION ALL

SELECT
    TO_CHAR(A.SOC_SECURITY_NUM) AS Identificacion, -- Convertimos a VARCHAR2 para compatibilidad
    A.FST_NAME || ' ' || NVL(A.MID_NAME, '') || ' ' || A.LAST_NAME || ' ' || NVL(A.MAIDEN_NAME, '') AS NombreCompleto,
    'SIN NOMBRE COMERCIAL' AS NombreComercial,
    'SIN TIPO CLIENTE' AS TipoCliente,
    'Persona Física' AS TipoPersona, -- Definimos explícitamente que es persona física
    TO_CHAR(A.CUST_STAT_CD) AS Estado, -- Convertimos a VARCHAR2
    NVL(H.X_CODIGO, 'SIN SEGMENTO') AS SegmentoCliente,
    'NO DISPONIBLE' AS Riesgo, -- 🔹 No hay una columna específica para "Riesgo", así que usamos un valor por defecto
    'NO DISPONIBLE' AS FechaVencimiento -- 🔹 Usamos un valor por defecto si la columna no existe
FROM SIEBEL.S_CONTACT A
LEFT JOIN SIEBEL.CX_SEGMENTOS H ON H.ROW_ID = A.X_SEG_ID

    `;

    const result = await connection.execute(query);

    console.log("✅ Clientes obtenidos:", result.rows.length);
    res.status(200).json(result.rows);

  } catch (err) {
    console.error("❌ Error al obtener clientes:", err.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;