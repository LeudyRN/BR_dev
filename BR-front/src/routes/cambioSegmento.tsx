import { useState } from "react";
import { TextField, Button, Box, Paper, Typography, Divider, Alert } from "@mui/material";
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
      setSegmentoActual(nuevoSegmento); // 👈 Refleja el cambio en la pantalla
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

      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
          Cambio de Segmento
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* 🔹 Barra de búsqueda por cédula */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Consultar por Cédula"
            variant="outlined"
            value={cedulaConsulta}
            onChange={(e) => setCedulaConsulta(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button variant="contained" color="primary" onClick={handleConsultarSegmento}>
            Consultar
          </Button>
        </Box>

        {/* 🔹 Muestra el segmento actual con diseño estructurado */}
        {segmentoActual && (
          <Alert severity="info" sx={{ mb: 2, fontSize: "1rem", fontWeight: "bold" }}>
            Segmento del cliente actualmente es: <strong>{segmentoActual}</strong>
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        {/* 🔹 Campo para ingresar la cédula antes de actualizar */}
        <TextField
          label="Cédula del Cliente a Modificar"
          variant="outlined"
          value={cedulaActualizar}
          onChange={(e) => setCedulaActualizar(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* 🔹 Campo para ingresar el nuevo segmento */}
        <TextField
          label="Nuevo Segmento"
          variant="outlined"
          value={nuevoSegmento}
          onChange={(e) => setNuevoSegmento(e.target.value)}
          fullWidth
        />

        <Button sx={{ mt: 2 }} variant="contained" color="secondary" onClick={handleCambiarSegmento}>
          Actualizar Segmento
        </Button>
      </Paper>
    </Box>
  );
}

export default CambioSegmento;