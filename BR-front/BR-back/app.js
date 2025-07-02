const express = require("express");
const cors = require("cors");

const {
  initOraclePool,
  initSQLPool,
  initFocusPool,
  closeOraclePool,
  closeFocusPool,
} = require("./config/db");

const clientesRoutes = require("./routes/clientes");
const buroRoutes = require("./routes/buro");
const categoriaRiesgoRoutes = require("./routes/categoriaRiesgo");
const segmentoRoutes = require("./routes/segmento");
const portafolioRoutes = require("./routes/portafolio"); 

const app = express(); 

app.use(express.json());
app.use(cors());

// Rutas
app.use("/api/ConsultaCliente", clientesRoutes);
app.use("/api/buro", buroRoutes);
app.use("/api/categoria-riesgo", categoriaRiesgoRoutes);
app.use("/api/segmentos", segmentoRoutes);
app.use("/api/portafolio", portafolioRoutes); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await initOraclePool();
    await initSQLPool();
    await initFocusPool();

    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  } catch (error) {
    console.error("❌ Error al inicializar pools:", error.message);
    process.exit(1);
  }
});

process.on("SIGINT", async () => {
  console.log("\n🛑 Cerrando servidor...");
  try {
    await closeOraclePool();
    await closeFocusPool();
    console.log("✅ Pools Oracle cerrados correctamente");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error al cerrar pools Oracle:", err.message);
    process.exit(1);
  }
});
