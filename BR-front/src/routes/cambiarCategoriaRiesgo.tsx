import { useState, type SyntheticEvent } from "react";
import { TextField, Button, Box, Paper, Typography, Divider, Tooltip, IconButton, Snackbar, Alert } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

function CambioCategoriaRiesgo() {
  const [cedulaConsulta, setCedulaConsulta] = useState("");
  const [riesgoActual, setRiesgoActual] = useState("");
  const [cedulaActualizar, setCedulaActualizar] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  // Estados para Snackbar (notificaciones)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  /**
   * Muestra un mensaje en el Snackbar.
   * @param {string} message - El mensaje a mostrar.
   * @param {'success' | 'error' | 'info' | 'warning'} severity - La severidad del mensaje.
   */
  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  /**
   * Cierra el Snackbar.
   * @param {SyntheticEvent | Event} [event] - Objeto del evento (opcional).
   * @param {string} [reason] - Razón por la que se cierra el Snackbar (opcional).
   */
  const handleCloseSnackbar = (event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  /** 🔹 Consultar la categoría de riesgo del cliente */
  const handleConsultarRiesgo = async () => {
    const trimmedCedulaConsulta = cedulaConsulta.trim();
    if (!trimmedCedulaConsulta) {
      showSnackbar("Por favor, introduzca una cédula para consultar.", "warning");
      return;
    }

    try {
      console.log(`DEBUG_FRONTEND: Consultando riesgo para cédula: '${trimmedCedulaConsulta}'`);
      // URL CORRECTA para GET: /api/categoria-riesgo/:cedula
      const response = await fetch(`http://localhost:5000/api/categoria-riesgo/${encodeURIComponent(trimmedCedulaConsulta)}`);

      if (!response.ok) {
        try {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
        } catch (jsonError) {
            throw new Error(`Error ${response.status}: ${response.statusText}. Respuesta no válida o vacía.`);
        }
      }

      const data = await response.json();
      setRiesgoActual(data.riesgo || "No encontrado");
      setCedulaActualizar(trimmedCedulaConsulta); // Precargar cédula para actualizar
      setNuevaCategoria(data.riesgo || ""); // Precargar categoría actual para modificar
      showSnackbar("Categoría de riesgo consultada correctamente.", "success");
    } catch (error: unknown) {
      console.error("❌ Error al consultar riesgo:", error);
      showSnackbar(`Hubo un error al consultar la categoría de riesgo: ${(error as Error).message}`, "error");
    }
  };

  /** 🔹 Cambiar la categoría de riesgo */
  const handleCambiarCategoria = async () => {
    const trimmedCedulaActualizar = cedulaActualizar.trim();
    const trimmedNuevaCategoria = nuevaCategoria.trim();

    if (!trimmedCedulaActualizar || !trimmedNuevaCategoria) {
      showSnackbar("Debe proporcionar cédula y nueva categoría.", "warning");
      return;
    }

    console.log(`DEBUG_FRONTEND: Actualizando riesgo para cédula: '${trimmedCedulaActualizar}' con nueva categoría: '${trimmedNuevaCategoria}'`);
    try {
      // URL CORRECTA para PUT: /api/categoria-riesgo/
      const response = await fetch("http://localhost:5000/api/categoria-riesgo/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula: trimmedCedulaActualizar, nuevaCategoria: trimmedNuevaCategoria })
      });

      if (!response.ok) {
        try {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
        } catch (jsonError) {
            throw new Error(`Error ${response.status}: ${response.statusText}. Respuesta no válida o vacía.`);
        }
      }

      showSnackbar("¡Categoría de riesgo actualizada correctamente!", "success");
      setRiesgoActual(trimmedNuevaCategoria); // Actualiza el riesgo mostrado
      setCedulaConsulta(""); // Limpia campos después de actualizar
      setCedulaActualizar("");
      setNuevaCategoria("");
    } catch (error: unknown) {
      console.error("❌ Error al cambiar categoría de riesgo:", error);
      showSnackbar(`Hubo un error al actualizar la categoría: ${(error as Error).message}`, "error");
    }
  };

  return (
    <Box sx={{
      minHeight: "90vh",
      p: 1,
      backgroundColor: "background.default",
      width: "1200px",
      marginLeft: "40vh"
    }}>

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

      {/* Snackbar para notificaciones */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CambioCategoriaRiesgo;
