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

UNION ALL

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

    const result = await connection.execute(query);


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

  } catch (err) {
    console.error("❌ Error al obtener clientes:", err.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;