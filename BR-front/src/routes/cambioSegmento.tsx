import { useState } from "react";
<<<<<<< HEAD
import { TextField, Button, Box, Paper, Typography, Divider, Snackbar, Alert } from "@mui/material";

interface ClienteSegmentoInfo {
  identificacion: string;
  segmento: string;
  tipoPersona?: string; // Propiedad opcional para mostrar si viene de la consulta, pero no se envía
}
=======
import { TextField, Button, Box, Paper, Typography, Divider } from "@mui/material";
//import axios from "axios";
>>>>>>> 637d44f740325e0150be4366d05ff84952d8d5dd

function CambioSegmento() {
  const [cedulaConsulta, setCedulaConsulta] = useState("");
  const [cedulaActualizar, setCedulaActualizar] = useState("");
  const [segmentoActual, setSegmentoActual] = useState("");
  const [nuevoSegmento, setNuevoSegmento] = useState("");
  // Eliminado: const [tipoIdConsulta, setTipoIdConsulta] = useState<'Cédula' | 'RNC'>('Cédula');
  // Eliminado: const [tipoIdActualizar, setTipoIdActualizar] = useState<'Cédula' | 'RNC'>('Cédula');

<<<<<<< HEAD
  // Estados para Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  /** Consultar el segmento del cliente */
  const handleConsultarSegmento = async () => {
    setSegmentoActual(""); // Limpiar segmento actual antes de consultar
    setCedulaActualizar(""); // Limpiar cédula para actualizar
    setNuevoSegmento(""); // Limpiar nuevo segmento

    try {
      const trimmedCedulaConsulta = cedulaConsulta.trim();
      if (!trimmedCedulaConsulta) {
        setSnackbarMessage("Por favor, introduzca una cédula/RNC para consultar.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return;
      }

      // La URL de consulta ya no incluye tipoId, el backend lo determinará
      const constructedUrl = `http://localhost:5000/api/segmentos/${encodeURIComponent(trimmedCedulaConsulta)}`;
      console.log(`DEBUG_FRONTEND: URL de consulta construida: ${constructedUrl}`);
      console.log(`DEBUG_FRONTEND: Cédula/RNC enviada (limpia): '${trimmedCedulaConsulta}'`);

      const response = await fetch(constructedUrl);
      // Si la respuesta no es OK, intentar parsear el error.
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data: ClienteSegmentoInfo = await response.json(); // Ahora esperamos un solo objeto de vuelta

      if (data && data.identificacion) {
        setSegmentoActual(data.segmento || "Sin Segmento");
        setCedulaActualizar(data.identificacion); // Precargar cédula para actualizar
        setSnackbarMessage("Segmento consultado correctamente.");
        setSnackbarSeverity("success");
      } else {
        setSegmentoActual("No encontrado");
        setCedulaActualizar("");
        setSnackbarMessage("Cliente no encontrado o datos incompletos.");
        setSnackbarSeverity("info");
      }
    } catch (error: any) {
      console.error("❌ Error al consultar segmento:", error);
      setSegmentoActual("Error al consultar");
      setCedulaActualizar("");
      setSnackbarMessage(`Hubo un error al consultar el segmento: ${error.message}`);
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  /** Actualizar el segmento */
  const handleCambiarSegmento = async () => {
    const trimmedCedulaActualizar = cedulaActualizar.trim();
    const trimmedNuevoSegmento = nuevoSegmento.trim();

    if (!trimmedCedulaActualizar || !trimmedNuevoSegmento) {
      setSnackbarMessage("Debe proporcionar cédula/RNC y un nuevo segmento.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    // La URL de PUT se mantiene como /api/segmentos/ (ruta base del router)
    console.log(`DEBUG_FRONTEND: Enviando PUT a: http://localhost:5000/api/segmentos/`);
    console.log(`DEBUG_FRONTEND: Cuerpo de la petición PUT: ${JSON.stringify({
      cedula: trimmedCedulaActualizar,
      nuevoSegmentoCodigo: trimmedNuevoSegmento,
      // ELIMINADO: tipoId: tipoIdActualizar // Ya no se envía el tipoId
    })}`);

    try {
      // Ruta PUT ajustada a la base del router
      const response = await fetch("http://localhost:5000/api/segmentos/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: trimmedCedulaActualizar,
          nuevoSegmentoCodigo: trimmedNuevoSegmento,
          // ELIMINADO: tipoId: tipoIdActualizar // Ya no se envía el tipoId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error en la actualización.");
      }

      setSnackbarMessage("¡Segmento actualizado correctamente!");
      setSnackbarSeverity("success");
      setSegmentoActual(trimmedNuevoSegmento); // Actualiza el segmento mostrado en el UI
      setCedulaConsulta(""); // Limpiar campo de consulta
      setCedulaActualizar(""); // Limpiar campo de actualización
      setNuevoSegmento(""); // Limpia el campo de nuevo segmento
    } catch (error: any) {
      console.error("❌ Error al cambiar segmento:", error);
      setSnackbarMessage(`Hubo un error al actualizar el segmento: ${error.message}`);
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };
=======
  /**  Consultar el segmento del cliente */
const handleConsultarSegmento = async () => {
  try {
    const response = await fetch(`/api/consultar-segmento?cedula=${cedulaConsulta}`);
    const data = await response.json();
    setSegmentoActual(data.segmento);
  } catch (error) {
    console.error("❌ Error al consultar segmento:", error);
    alert("Hubo un error al consultar el segmento.");
  }
};

  /**  Actualizar el segmento */
const handleCambiarSegmento = async () => {
  try {
    const response = await fetch("/api/cambiar-segmento", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cedula: cedulaActualizar, nuevoSegmento })
    });

    if (!response.ok) throw new Error("Error en la actualización.");

    alert("¡Segmento actualizado correctamente!");
    setSegmentoActual(nuevoSegmento);
  } catch (error) {
    console.error("❌ Error al cambiar segmento:", error);
    alert("Hubo un error al actualizar el segmento.");
  }
};
>>>>>>> 637d44f740325e0150be4366d05ff84952d8d5dd

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
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
          Gestión de Segmento
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* 🔹 Sección de búsqueda por cédula/RNC - Ya no hay selección de tipo */}
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
            value={segmentoActual || "Click en Consultar o introducir datos abajo"}
            InputProps={{ readOnly: true }}
            sx={{ width: "250px" }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 🔹 Campos para actualizar segmento - Ya no hay selección de tipo */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Cédula/RNC del Cliente a Modificar"
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
        <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={handleCambiarSegmento}
            disabled={!cedulaActualizar || !nuevoSegmento}>
          Actualizar Segmento
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

export default CambioSegmento;