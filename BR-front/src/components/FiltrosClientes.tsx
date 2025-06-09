/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FiltrosClientes({ onFilter }: { onFilter: (filtros: any) => void }) {
  const [estado, setEstado] = useState("");
  const [segmento, setSegmento] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipoPersona, setTipoPersona] = useState("");

  const aplicarFiltro = () => {
    onFilter({ estado, segmento, categoria, tipoPersona });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "flex-end",
        p: 2,
        backgroundColor: "background.paper",
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      {/* Estado */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="estado-label">Estado</InputLabel>
        <Select
          labelId="estado-label"
          value={estado}
          label="Estado"
          onChange={(e) => setEstado(e.target.value)}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="activo">Activos</MenuItem>
          <MenuItem value="inactivo">Inactivos</MenuItem>
        </Select>
      </FormControl>

      {/* Segmento */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="segmento-label">Segmento</InputLabel>
        <Select
          labelId="segmento-label"
          value={segmento}
          label="Segmento"
          onChange={(e) => setSegmento(e.target.value)}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="1">1</MenuItem>
          <MenuItem value="2">2</MenuItem>
          <MenuItem value="7">7</MenuItem>
        </Select>
      </FormControl>

      {/* Categoría */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="categoria-label">Categoría</InputLabel>
        <Select
          labelId="categoria-label"
          value={categoria}
          label="Categoría"
          onChange={(e) => setCategoria(e.target.value)}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="bajo">Bajo Riesgo</MenuItem>
          <MenuItem value="alto">Alto Riesgo</MenuItem>
        </Select>
      </FormControl>

      {/* Tipo de Persona */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="tipoPersona-label">Tipo de Persona</InputLabel>
        <Select
          labelId="tipoPersona-label"
          value={tipoPersona}
          label="Tipo de Persona"
          onChange={(e) => setTipoPersona(e.target.value)}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="fisica">Persona Física</MenuItem>
          <MenuItem value="empresa">Empresa</MenuItem>
        </Select>
      </FormControl>

      {/* Botón */}
      <Box>
        <Button
          variant="contained"
          color="primary"
          onClick={aplicarFiltro}
          sx={{ minWidth: 120 }}
        >
          Filtrar
        </Button>
      </Box>
    </Box>
  );
}

export default FiltrosClientes;
