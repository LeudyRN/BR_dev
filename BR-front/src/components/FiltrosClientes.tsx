import { Select, MenuItem, Button, Box, FormControl, InputLabel } from "@mui/material";
import { useState, useEffect } from "react";

/** Definir estructura de Filtros */
interface Filters {
  estado: string;
  segmento: string;
  tipoPersona: string;
}

// Opciones de Tipo de Persona y Estado - Mantener hardcodeadas si son fijas y no vienen de DB
const hardcodedTiposPersona = ["Física", "Empresa"];
// Se ha añadido "Rechazado" a las opciones de estado
const hardcodedEstados = ["Activo", "Inactivo", "Creado", "Rechazado"];


function FiltrosClientes({ onFilter }: { onFilter: (filtros: Filters) => void }) {
  const [estado, setEstado] = useState("");
  const [segmento, setSegmento] = useState("");
  const [tipoPersona, setTipoPersona] = useState("");

  const [dynamicSegmentos, setDynamicSegmentos] = useState<string[]>([]); // Nuevo estado para segmentos dinámicos

  /** 🚀 Cargar opciones de Segmento desde la nueva API */
  useEffect(() => {
    fetch("http://localhost:5000/api/ConsultaCliente/segmentos-unicos")
      .then(response => response.json())
      .then((data: string[]) => {
        console.log("✅ Segmentos dinámicos recibidos:", data);
        setDynamicSegmentos(data.filter(Boolean)); // Asegurarse de filtrar cualquier valor nulo/vacío
      })
      .catch(error => console.error("❌ Error al cargar segmentos dinámicos:", error));
  }, []); // Se ejecuta solo una vez al montar el componente

  const aplicarFiltro = () => {
    onFilter({ estado, segmento, tipoPersona });
  };

  const limpiarFiltros = () => {
    setEstado("");
    setSegmento("");
    setTipoPersona("");
    onFilter({ estado: "", segmento: "", tipoPersona: "" }); // Notificar al componente padre que se limpiaron los filtros
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end", p: 2, backgroundColor: "background.paper", borderRadius: 2, boxShadow: 1 }}>

      {/* Estado */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="estado-label">Estado</InputLabel>
        <Select labelId="estado-label" value={estado} label="Estado" onChange={(e) => setEstado(e.target.value as string)}>
          <MenuItem value="">Todos</MenuItem>
          {hardcodedEstados.map((est, index) => (
            <MenuItem key={index} value={est}>{est}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Segmento - Ahora usa los segmentos cargados dinámicamente */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="segmento-label">Segmento</InputLabel>
        <Select labelId="segmento-label" value={segmento} label="Segmento" onChange={(e) => setSegmento(e.target.value as string)}>
          <MenuItem value="">Todos</MenuItem>
          {dynamicSegmentos.map((seg, index) => (
            <MenuItem key={index} value={seg}>{seg}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Tipo de Persona */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="tipoPersona-label">Tipo de Persona</InputLabel>
        <Select labelId="tipoPersona-label" value={tipoPersona} label="Tipo de Persona" onChange={(e) => setTipoPersona(e.target.value as string)}>
          <MenuItem value="">Todos</MenuItem>
          {hardcodedTiposPersona.map((tipo, index) => (
            <MenuItem key={index} value={tipo}>{tipo}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Botones */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" color="primary" onClick={aplicarFiltro} sx={{ minWidth: 120 }}>
          Filtrar
        </Button>
        {/* El botón "Limpiar" ahora es "contained" con color "secondary" */}
        <Button variant="contained" color="secondary" onClick={limpiarFiltros} sx={{ minWidth: 120 }}>
          Limpiar
        </Button>
      </Box>
    </Box>
  );
}

export default FiltrosClientes;