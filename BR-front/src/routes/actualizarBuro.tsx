import { useState, type SyntheticEvent } from "react";
import { TextField, Button, Box, Paper, Typography, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Select, MenuItem, FormControl, InputLabel } from "@mui/material";

function ActualizarBuro() {
  // Estados para la gestión y modificación del buró interno (API de BD)
  const [internalBuroCedulaConsulta, setInternalBuroCedulaConsulta] = useState(""); // Cédula para consultar/modificar el buró interno
  const [buroActual, setBuroActual] = useState(""); // Buró actual mostrado en el diálogo
  const [nuevoBuro, setNuevoBuro] = useState(""); // Nuevo valor para el buró en el diálogo
  const [openDialog, setOpenDialog] = useState(false); // Control del diálogo de modificación

  // Estados para la consulta del buró externo (URL externa)
  const [externalBuroIdentificacion, setExternalBuroIdentificacion] = useState(""); // Identificación para la URL externa
  const [externalBuroTipoId, setExternalBuroTipoId] = useState<'Cedula' | 'RNC'>('Cedula'); // Tipo de ID para la URL externa

  // Estados para la transferencia de buró
  const [cedula1, setCedula1] = useState("");
  const [cedula2, setCedula2] = useState("");

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

  /**  Consultar el buró del cliente para MODIFICACIÓN INTERNA (API de BD) */
  const handleConsultarBuroInternal = async () => {
    const trimmedCedulaConsulta = internalBuroCedulaConsulta.trim();
    if (!trimmedCedulaConsulta) {
      showSnackbar("Por favor, introduzca una cédula para gestionar el buró interno.", "warning");
      return;
    }

    try {
      const response = await fetch(`/api/consultar-buro?cedula=${encodeURIComponent(trimmedCedulaConsulta)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al consultar buró.");
      }

      const data = await response.json();
      // Asume que data.buro es el string XML
      setBuroActual(data.buro || "No encontrado");
      setNuevoBuro(data.buro || "");
      setOpenDialog(true); // Abre el pop-up de modificación
      showSnackbar("Buró interno consultado correctamente.", "success");
    } catch (error: unknown) {
      console.error("❌ Error al consultar buró interno:", error);
      showSnackbar(`Hubo un error al consultar el buró interno: ${(error as Error).message}`, "error");
    }
  };

  /**  Guardar el nuevo buró (API de BD) */
  const handleGuardarBuroInternal = async () => {
    const trimmedNuevoBuro = nuevoBuro.trim();
    const trimmedCedulaConsulta = internalBuroCedulaConsulta.trim();

    if (!trimmedCedulaConsulta || !trimmedNuevoBuro) {
      showSnackbar("Debe proporcionar la cédula y el nuevo buró.", "warning");
      return;
    }

    try {
      const response = await fetch("/api/modificar-buro", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula: trimmedCedulaConsulta, buro: trimmedNuevoBuro })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al modificar buró.");
      }

      showSnackbar("¡Buró interno actualizado correctamente!", "success");
      setOpenDialog(false);
      setInternalBuroCedulaConsulta(""); // Limpia el campo de consulta después de guardar
    } catch (error: unknown) {
      console.error("❌ Error al modificar buró interno:", error);
      showSnackbar(`Hubo un error al actualizar el buró interno: ${(error as Error).message}`, "error");
    }
  };

  /**  Consultar Buró EXTERNAMENTE (Abre URL en nueva pestaña) */
  const handleConsultarBuroExternal = () => {
    const trimmedIdentificacion = externalBuroIdentificacion.trim();
    if (!trimmedIdentificacion) {
      showSnackbar("Por favor, introduzca una identificación para la consulta de Buró externo.", "warning");
      return;
    }

    // Asegurarse de que el tipoId para la URL externa sea 'Cedula' o 'RNC'
    const tipoIdParam = externalBuroTipoId === 'Cedula' ? 'Cedula' : 'RNC';

    const buroUrl = `http://10.16.20.135/vsnet2012/ConsultaBuro/Transunion/Buro?identificacion=${encodeURIComponent(trimmedIdentificacion)}&tipoId=${encodeURIComponent(tipoIdParam)}&xml=False`;

    console.log(`DEBUG_FRONTEND: Abriendo URL de Buró externo: ${buroUrl}`);
    window.open(buroUrl, '_blank'); // Abre la URL en una nueva pestaña
    showSnackbar("Abriendo consulta de Buró externo en una nueva pestaña.", "info");
  };

  /**  Actualizar el buró de un cliente usando otro (Transferencia) */
  const handleActualizarBuroTransfer = async () => {
    const trimmedCedula1 = cedula1.trim();
    const trimmedCedula2 = cedula2.trim();

    if (!trimmedCedula1 || !trimmedCedula2) {
      showSnackbar("Debe proporcionar ambas cédulas para la transferencia de buró.", "warning");
      return;
    }

    try {
      const response = await fetch("/api/actualizar-buro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula1: trimmedCedula1, cedula2: trimmedCedula2 })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al transferir buró.");
      }

      showSnackbar("¡Buró transferido correctamente!", "success");
      setCedula1("");
      setCedula2("");
    } catch (error: unknown) {
      console.error("❌ Error al actualizar buró (transferencia):", error);
      showSnackbar(`Hubo un error al transferir el buró: ${(error as Error).message}`, "error");
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
          Gestión de Buró
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/*  Sección de Consulta Buró Externo */}
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
          Consultar Buró Externo (Transunion)
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="external-buro-tipo-id-label">Tipo de Identificación</InputLabel>
            <Select
              labelId="external-buro-tipo-id-label"
              value={externalBuroTipoId}
              label="Tipo de Identificación"
              onChange={(e) => setExternalBuroTipoId(e.target.value as 'Cedula' | 'RNC')}
            >
              <MenuItem value="Cedula">Cédula</MenuItem>
              <MenuItem value="RNC">RNC</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Identificación para Buró Externo"
            variant="outlined"
            value={externalBuroIdentificacion}
            onChange={(e) => setExternalBuroIdentificacion(e.target.value)}
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={handleConsultarBuroExternal}>
            Consultar Buró Externo
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/*  Sección de Modificación de Buró Interno */}
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Modificar Buró Interno
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Cédula a Gestionar"
            variant="outlined"
            value={internalBuroCedulaConsulta}
            onChange={(e) => setInternalBuroCedulaConsulta(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button variant="contained" color="secondary" onClick={handleConsultarBuroInternal}>
            Modificar Buró
          </Button>
        </Box>

        {/*  Pop-up para modificar el buró */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth> {/* Ajustado maxWidth y fullWidth para el XML */}
          <DialogTitle>Modificar Buró del Cliente</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}> {/* Añadido white-space y font-family para XML */}
              Buró actual del cliente: <br/>
              <strong>{buroActual}</strong>
            </Typography>
            <TextField
              label="Nuevo Buró"
              variant="outlined"
              value={nuevoBuro}
              onChange={(e) => setNuevoBuro(e.target.value)}
              fullWidth
              multiline
              rows={10} // Altura inicial del campo de texto
              maxRows={20} // Altura máxima
              spellCheck="false" // Desactivar el corrector ortográfico para XML
              sx={{ fontFamily: 'monospace' }} // Fuente monoespaciada para el XML
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button variant="contained" color="secondary" onClick={handleGuardarBuroInternal}>
              Guardar Cambios
            </Button>
          </DialogActions>
        </Dialog>

        <Divider sx={{ my: 3 }} />

        {/*  Transferencia de buró */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Transferir Buró de un Cliente a Otro
          </Typography>
          <TextField
            label="Cédula con Buró válido"
            variant="outlined"
            value={cedula1}
            onChange={(e) => setCedula1(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Cédula con Buró no válido"
            variant="outlined"
            value={cedula2}
            onChange={(e) => setCedula2(e.target.value)}
            fullWidth
          />
        </Box>
        <Button sx={{ mt: 2 }} variant="contained" color="secondary" onClick={handleActualizarBuroTransfer}>
          Actualizar Buró (Transferir)
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

export default ActualizarBuro;