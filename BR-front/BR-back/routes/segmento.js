const express = require("express");
const router = express.Router();
const db = require("../config/db");

/** 🔹 Consultar el segmento por cédula o RNC */
router.get("/consultar-segmento", async (req, res) => {
  const { cedula } = req.query;

  if (!cedula) {
    return res.status(400).json({ error: "Debe proporcionar una cédula o RNC." });
  }

  try {
    const query = `
      SELECT COALESCE(o.ou_num, A.SOC_SECURITY_NUM) AS Identificacion,
             COALESCE(h.x_codigo, H.X_CODIGO) AS SegmentoCliente
      FROM siebel.s_org_ext o
      LEFT JOIN siebel.cx_segmentos h ON h.row_id = o.x_seg_id
      FULL OUTER JOIN SIEBEL.S_CONTACT A ON A.SOC_SECURITY_NUM = o.ou_num
      LEFT JOIN SIEBEL.CX_SEGMENTOS H ON H.ROW_ID = A.X_SEG_ID
      WHERE COALESCE(o.ou_num, A.SOC_SECURITY_NUM) = :cedula;
    `;

    const [result] = await db.execute(query, { cedula });

    if (!result.length) {
      return res.json({ segmento: "No encontrado" });
    }

    res.json({ segmento: result[0].SegmentoCliente || "Sin Segmento" });
  } catch (error) {
    console.error("Error al consultar segmento:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

/**  Actualizar el segmento */
router.put("/cambiar-segmento", async (req, res) => {
  const { cedula, nuevoSegmento } = req.body;

  if (!cedula || !nuevoSegmento) {
    return res.status(400).json({ error: "Debe proporcionar cédula y nuevo segmento." });
  }

  try {
    const updateQuery = `
      UPDATE siebel.cx_segmentos
      SET x_codigo = :nuevoSegmento
      WHERE row_id = (SELECT x_seg_id FROM siebel.s_org_ext WHERE ou_num = :cedula
                      UNION ALL
                      SELECT X_SEG_ID FROM SIEBEL.S_CONTACT WHERE SOC_SECURITY_NUM = :cedula);
    `;

    await db.execute(updateQuery, { nuevoSegmento, cedula });

    res.json({ mensaje: "¡Segmento actualizado correctamente!" });
  } catch (error) {
    console.error("Error al actualizar segmento:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;