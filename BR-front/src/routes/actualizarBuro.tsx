import { useState } from "react";
import { TextField, Button, Box, Paper, Typography, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import axios from "axios";

function ActualizarBuro() {
  const [cedulaConsulta, setCedulaConsulta] = useState("");
  const [buroActual, setBuroActual] = useState("");
  const [nuevoBuro, setNuevoBuro] = useState("");
  const [cedula1, setCedula1] = useState("");
  const [cedula2, setCedula2] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  /**  Consultar el buró del cliente */
  const handleConsultarBuro = async () => {
    try {
      const response = await axios.get(`/api/consultar-buro?cedula=${cedulaConsulta}`);
      setBuroActual(response.data.buro);
      setNuevoBuro(response.data.buro); // Inicializa el buró en el campo editable
      setOpenDialog(true); // Abre el pop-up
    } catch (error) {
      console.error("Error al consultar buró:", error);
      alert("Hubo un error al consultar el buró.");
    }
  };

  /**  Guardar el nuevo buró */
  const handleGuardarBuro = async () => {
    try {
      await axios.put("/api/modificar-buro", { cedula: cedulaConsulta, buro: nuevoBuro });
      alert("¡Buró actualizado correctamente!");
      setOpenDialog(false);
    } catch (error) {
      console.error("Error al modificar buró:", error);
      alert("Hubo un error al actualizar el buró.");
    }
  };

  /**  Actualizar el buró de un cliente usando otro */
  const handleActualizarBuro = async () => {
    try {
      await axios.post("/api/actualizar-buro", { cedula1, cedula2 });
      alert("¡Buró transferido correctamente!");
    } catch (error) {
      console.error("Error al actualizar buró:", error);
      alert("Hubo un error al actualizar el buró.");
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
        <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
          Gestión de Buró
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* 🔹 Consultar buró */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Consultar por Cédula"
            variant="outlined"
            value={cedulaConsulta}
            onChange={(e) => setCedulaConsulta(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button variant="contained" color="primary" onClick={handleConsultarBuro}>
            Consultar Buró
          </Button>
        </Box>

        {/* 🔹 Pop-up para modificar el buró */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Modificar Buró</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Buró actual del cliente: <strong>{buroActual}</strong>
            </Typography>
            <TextField
              label="Nuevo Buró"
              variant="outlined"
              value={nuevoBuro}
              onChange={(e) => setNuevoBuro(e.target.value)}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button variant="contained" color="secondary" onClick={handleGuardarBuro}>
              Guardar Cambios
            </Button>
          </DialogActions>
        </Dialog>

        <Divider sx={{ my: 3 }} />

        {/* 🔹 Transferencia de buró */}
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
        <Button sx={{ mt: 2 }} variant="contained" color="secondary" onClick={handleActualizarBuro}>
          Actualizar Buró
        </Button>

      </Paper>
    </Box>
  );
}

export default ActualizarBuro;