const express = require("express");
const router = express.Router();
const { getConnection } = require("../config/db");

// 🔹 Obtener todos los clientes
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const query = `SELECT
        COALESCE(o.ou_num, A.SOC_SECURITY_NUM) AS Identificacion,
        COALESCE(o.alias_name, A.FST_NAME || ' ' || A.MID_NAME || ' ' || A.LAST_NAME || ' ' || A.MAIDEN_NAME) AS NombreCompleto,
        COALESCE(x.x_attrib_110, NULL) AS NombreComercial,
        COALESCE(x.attrib_27, NULL) AS FechaFundacion,
        COALESCE(f.desc_text, NULL) AS TipoCliente,
        COALESCE(x.x_attrib_85, NULL) AS TipoPersona,
        COALESCE(o.cust_stat_cd, A.CUST_STAT_CD) AS Estado,
        COALESCE(x.x_attrib_92, NULL) AS CodigoActividadEconomica,
        COALESCE(e.desc_text, NULL) AS ActividadEconomica,
        COALESCE(x.attrib_19, NULL) AS IngresosAnuales,
        COALESCE(o.base_curcy_cd, NULL) AS MonedaIngresos,
        COALESCE(h.x_codigo, H.X_CODIGO) AS SegmentoCliente,
        COALESCE(X.X_FECHA_VENC_PASA, NULL) AS FechaVencimiento
      FROM siebel.s_org_ext o
      LEFT JOIN siebel.s_org_ext_x x ON o.row_id = x.par_row_id
      LEFT JOIN siebel.eai_view_lst_of_val e ON x.x_attrib_92 = e.val AND e.type = 'BR_ACTIVIDAD_ECONOMICA' AND e.lang_id = 'ESN' AND e.active_flg = 'Y'
      LEFT JOIN siebel.eai_view_lst_of_val f ON f.val = x.x_attrib_105 AND f.type = 'BR_PJ_TIPO_CLIENTE' AND f.lang_id = 'ESN' AND f.active_flg = 'Y'
      LEFT JOIN siebel.cx_segmentos h ON h.row_id = o.x_seg_id
      FULL OUTER JOIN SIEBEL.S_CONTACT A ON A.SOC_SECURITY_NUM = o.ou_num
      LEFT JOIN SIEBEL.CX_SEGMENTOS H ON H.ROW_ID = A.X_SEG_ID
      LEFT JOIN SIEBEL.S_CONTACT_X X ON X.PAR_ROW_ID = A.ROW_ID`;

    const result = await connection.execute(query);
    await connection.close();

    console.log("✅ Clientes obtenidos:", result.rows.length);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener clientes:", err.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;