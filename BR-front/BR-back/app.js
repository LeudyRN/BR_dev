const express = require("express");
const cors = require("cors");
const getConnection = require("./config/db"); // 🔹 Conexión a Oracle
const clientesRoutes = require("./routes/clientes"); // 🔹 Importar rutas

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Usar las rutas en `/api/clientes`
app.use("/api/clientes", clientesRoutes);

// 🔹 Puerto de ejecución
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await getConnection(); // 🔹 Verifica la conexión con Oracle al iniciar
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  } catch (error) {
    console.error("❌ Error al conectar con Oracle:", error.message);
  }
});