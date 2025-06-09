import { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import axios from "axios";

function CambioSegmento() {
  const [cedula, setCedula] = useState("");
  const [nuevoSegmento, setNuevoSegmento] = useState("");

  const handleCambiarSegmento = async () => {
    try {
      await axios.put("/api/cambiar-segmento", { cedula, nuevoSegmento });
      alert("¡Segmento actualizado correctamente!");
    } catch (error) {
      console.error("Error al cambiar segmento:", error);
      alert("Hubo un error al actualizar el segmento.");
    }
  };

  return (

    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "300px", margin: "auto" }}>
      <TextField label="Cédula" variant="outlined" value={cedula} onChange={(e) => setCedula(e.target.value)} />
      <TextField label="Nuevo Segmento" variant="outlined" value={nuevoSegmento} onChange={(e) => setNuevoSegmento(e.target.value)} />
      <Button variant="contained" color="primary" onClick={handleCambiarSegmento}>
        Actualizar
      </Button>
    </Box>
  );
}

export default CambioSegmento;