import { useState } from "react";
import { TextField, Button, Box, Paper, Typography, Divider, Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import axios from "axios";

function CambioCategoriaRiesgo() {
  const [cedulaConsulta, setCedulaConsulta] = useState("");
  const [riesgoActual, setRiesgoActual] = useState("");
  const [cedulaActualizar, setCedulaActualizar] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  /** 🔹 Consultar el riesgo del cliente */
  const handleConsultarRiesgo = async () => {
    try {
      const response = await axios.get(`/api/consultar-riesgo?cedula=${cedulaConsulta}`);
      setRiesgoActual(response.data.riesgo);
    } catch (error) {
      console.error("Error al consultar riesgo:", error);
      alert("Hubo un error al consultar la categoría de riesgo.");
    }
  };

  /** 🔹 Cambiar la categoría de riesgo */
  const handleCambiarCategoria = async () => {
    try {
      await axios.put("/api/cambiar-riesgo", { cedula: cedulaActualizar, nuevaCategoria });
      alert("¡Categoría de riesgo actualizada correctamente!");
      setRiesgoActual(nuevaCategoria);
    } catch (error) {
      console.error("Error al cambiar categoría de riesgo:", error);
      alert("Hubo un error al actualizar la categoría.");
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
       }}
    >
      <Paper elevation={3} sx={{ maxWidth: 1200, mx: "auto", p: 4, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="primary" textAlign="center">
          Gestión de Categoría de Riesgo
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* 🔹 Sección de búsqueda por cédula */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          <TextField
            label="Consultar por Cédula"
            variant="outlined"
            value={cedulaConsulta}
            onChange={(e) => setCedulaConsulta(e.target.value)}
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={handleConsultarRiesgo}>
            Consultar
          </Button>
        </Box>

        {/* 🔹 Sección de Categoría de Riesgo */}
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
            Categoría de Riesgo:
          </Typography>
          <TextField
            variant="outlined"
            value={riesgoActual || "Click en Consultar"}
            InputProps={{ readOnly: true }}
            sx={{ width: "250px" }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 🔹 Sección para modificar la categoría de riesgo */}
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Modificar Categoría de Riesgo
        </Typography>

        {/* 🔹 Campo para ingresar la cédula a modificar */}
        <TextField
          label="Cédula del Cliente a Modificar"
          variant="outlined"
          value={cedulaActualizar}
          onChange={(e) => setCedulaActualizar(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* 🔹 Campo para ingresar la nueva categoría con icono informativo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            label="Nueva Categoría de Riesgo"
            variant="outlined"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value.toUpperCase())}
            fullWidth
          />
          <Tooltip title="La categoría de riesgo debe ingresarse en MAYÚSCULA" arrow>
            <IconButton>
              <InfoOutlinedIcon color="primary" />
            </IconButton>
          </Tooltip>
        </Box>

        <Button sx={{ mt: 2 }} variant="contained" color="secondary" onClick={handleCambiarCategoria}>
          Actualizar Categoría
        </Button>
      </Paper>
    </Box>
  );
}

export default CambioCategoriaRiesgo;