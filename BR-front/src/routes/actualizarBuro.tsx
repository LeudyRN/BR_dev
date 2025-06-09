import { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import axios from "axios";

function ActualizarBuro() {
  const [cedula1, setCedula1] = useState("");
  const [cedula2, setCedula2] = useState("");

  const handleActualizarBuro = async () => {
    try {
      await axios.post("/api/actualizar-buro", { cedula1, cedula2 });
      alert("¡Buró actualizado correctamente!");
    } catch (error) {
      console.error("Error al actualizar buró:", error);
      alert("Hubo un error al actualizar el buró.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "300px", margin: "auto" }}>
      <TextField label="Cédula 1" variant="outlined" value={cedula1} onChange={(e) => setCedula1(e.target.value)} />
      <TextField label="Cédula 2" variant="outlined" value={cedula2} onChange={(e) => setCedula2(e.target.value)} />
      <Button variant="contained" color="primary" onClick={handleActualizarBuro}>
        Actualizar
      </Button>
    </Box>
  );
}

export default ActualizarBuro;