import { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import axios from "axios";

function CambioCategoriaRiesgo() {
  const [cedula, setCedula] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  const handleCambiarCategoria = async () => {
    try {
      await axios.put("/api/cambiar-riesgo", { cedula, nuevaCategoria });
      alert("¡Categoría de riesgo actualizada correctamente!");
    } catch (error) {
      console.error("Error al cambiar categoría de riesgo:", error);
      alert("Hubo un error al actualizar la categoría.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "300px", margin: "auto" }}>
      <TextField label="Cédula" variant="outlined" value={cedula} onChange={(e) => setCedula(e.target.value)} />
      <TextField label="Nueva Categoría de Riesgo" variant="outlined" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} />
      <Button variant="contained" color="primary" onClick={handleCambiarCategoria}>
        Cambiar
      </Button>
    </Box>
  );
}

export default CambioCategoriaRiesgo;