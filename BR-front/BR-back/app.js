const express = require("express");
const cors = require("cors");
const { connectOracle, connectSQLServer } = require("./config/db");

const clientesRoutes = require("./routes/clientes");
const buroRoutes = require("./routes/buro");
const categoriaRiesgoRoutes = require("./routes/categoriaRiesgo");
const segmentoRoutes = require("./routes/segmento");

const app = express();
app.use(express.json());
app.use(cors());

// 🔹 Registrar todas las rutas
app.use("/api/clientes", clientesRoutes);
app.use("/api/buro", buroRoutes);
app.use("/api/categoria-riesgo", categoriaRiesgoRoutes);
app.use("/api/segmento", segmentoRoutes);

// 🔹 Puerto de ejecución
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await connectOracle(); // ✅ Usamos el nombre correcto
    await connectSQLServer(); // ✅ Conectamos a SQL Server también
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error.message);
  }
});