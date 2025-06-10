import { useState } from "react";
import { TextField, Button, Box, Paper, Typography, Divider } from "@mui/material";
import axios from "axios";

function CambioSegmento() {
  const [cedulaConsulta, setCedulaConsulta] = useState("");
  const [cedulaActualizar, setCedulaActualizar] = useState("");
  const [segmentoActual, setSegmentoActual] = useState("");
  const [nuevoSegmento, setNuevoSegmento] = useState("");

  /**  Consultar el segmento del cliente */
  const handleConsultarSegmento = async () => {
    try {
      const response = await axios.get(`/api/consultar-segmento?cedula=${cedulaConsulta}`);
      setSegmentoActual(response.data.segmento);
    } catch (error) {
      console.error("Error al consultar segmento:", error);
      alert("Hubo un error al consultar el segmento.");
    }
  };

  /**  Actualizar el segmento */
  const handleCambiarSegmento = async () => {
    try {
      await axios.put("/api/cambiar-segmento", { cedula: cedulaActualizar, nuevoSegmento });
      alert("¡Segmento actualizado correctamente!");
      setSegmentoActual(nuevoSegmento);
    } catch (error) {
      console.error("Error al cambiar segmento:", error);
      alert("Hubo un error al actualizar el segmento.");
    }
  };

return (
    <Box sx={{
        minHeight: "90vh",
        marginTop: "30px",
        p: 1,
        backgroundColor: "background.default",
        width: "1200px",
        marginLeft: "50vh"
       }}>

  <Paper elevation={3} sx={{ maxWidth: 1200, mx: "auto", p: 4, borderRadius: 4 }}>
    <Typography variant="h5" fontWeight="bold" gutterBottom color="primary" textAlign="center">
      Gestión de Segmento
    </Typography>

    <Divider sx={{ my: 3 }} />

    {/* 🔹 Sección de búsqueda por cédula */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
      <TextField
        label="Consultar por Cédula/RNC"
        variant="outlined"
        value={cedulaConsulta}
        onChange={(e) => setCedulaConsulta(e.target.value)}
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={handleConsultarSegmento}>
        Consultar
      </Button>
    </Box>

    {/* 🔹 Sección de Segmento del Cliente */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        justifyContent: "space-between",
        backgroundColor: "background.paper",
        p: 2,
        borderRadius: 2,
        boxShadow: 1,
        mb: 3,
      }}
    >
      <Typography variant="h6" fontWeight="bold" color="primary">
        Segmento del cliente:
      </Typography>
      <TextField
        variant="outlined"
        value={segmentoActual || "Click en Consultar"}
        InputProps={{ readOnly: true }}
        sx={{ width: "250px" }}
      />
    </Box>

    <Divider sx={{ my: 3 }} />

    {/* 🔹 Campos para actualizar segmento */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Cédula del Cliente a Modificar"
        variant="outlined"
        value={cedulaActualizar}
        onChange={(e) => setCedulaActualizar(e.target.value)}
        fullWidth
      />
      <TextField
        label="Nuevo Segmento"
        variant="outlined"
        value={nuevoSegmento}
        onChange={(e) => setNuevoSegmento(e.target.value)}
        fullWidth
      />
      </Box>
      <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={handleCambiarSegmento}>
        Actualizar Segmento
      </Button>

  </Paper>
</Box>
);
}

export default CambioSegmento;