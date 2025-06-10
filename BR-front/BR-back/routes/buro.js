const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Ruta de Buró funcionando correctamente");
});

module.exports = router;