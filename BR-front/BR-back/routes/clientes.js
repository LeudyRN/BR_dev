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
        o.ou_num AS Identificacion,
        o.alias_name AS NombreCompleto,
        x.x_attrib_110 AS NombreComercial,
        x.attrib_27 AS FechaFundacion,
        f.desc_text AS TipoCliente,
        x.x_attrib_85 AS TipoPersona,
        o.cust_stat_cd AS Estado,
        x.x_attrib_92 AS CodigoActividadEconomica,
        e.desc_text AS ActividadEconomica,
        x.attrib_19 AS IngresosAnuales,
        o.base_curcy_cd AS MonedaIngresos,
        h.x_codigo AS SegmentoCliente,
        X.X_FECHA_VENC_PASA AS FechaVencimiento
      FROM siebel.s_org_ext o
      LEFT JOIN siebel.s_org_ext_x x ON o.row_id = x.par_row_id
      LEFT JOIN siebel.eai_view_lst_of_val e ON x.x_attrib_92 = e.val AND e.type = 'BR_ACTIVIDAD_ECONOMICA' AND e.lang_id = 'ESN' AND e.active_flg = 'Y'
      LEFT JOIN siebel.eai_view_lst_of_val f ON f.val = x.x_attrib_105 AND f.type = 'BR_PJ_TIPO_CLIENTE' AND f.lang_id = 'ESN' AND f.active_flg = 'Y'
      LEFT JOIN siebel.cx_segmentos h ON h.row_id = o.x_seg_id
      LEFT JOIN SIEBEL.S_CONTACT A ON A.SOC_SECURITY_NUM = o.ou_num
      LEFT JOIN SIEBEL.CX_SEGMENTOS H ON H.ROW_ID = A.X_SEG_ID
      LEFT JOIN SIEBEL.S_CONTACT_X X ON X.PAR_ROW_ID = A.ROW_ID
      FETCH FIRST 50 ROWS ONLY
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