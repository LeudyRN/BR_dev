import { Select, MenuItem, Button, Box, FormControl, InputLabel } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

/** 🔹 Definir estructura de Cliente */
interface Cliente {
  estado: string;
  segmento: string;
  categoria: string;
  tipoPersona: string;
}

function FiltrosClientes({ onFilter }: { onFilter: (filtros: { estado: string; segmento: string; categoria: string; tipoPersona: string; }) => void }) {
  const [estado, setEstado] = useState("");
  const [segmentos, setSegmentos] = useState<string[]>([]);
  const [segmento, setSegmento] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoria, setCategoria] = useState("");
  const [tiposPersona, setTiposPersona] = useState<string[]>([]);
  const [tipoPersona, setTipoPersona] = useState("");

  /** 🚀 Cargar clientes y extraer opciones únicas con tipado correcto */
  useEffect(() => {
    axios.get<Cliente[]>("http://localhost:5000/api/clientes")
      .then((response) => {
        const data = response.data;

        // 🔹 Extraer opciones únicas con conversión de tipo
        setSegmentos([...new Set(data.map((cliente) => cliente.segmento))] as string[]);
        setCategorias([...new Set(data.map((cliente) => cliente.categoria))] as string[]);
        setTiposPersona([...new Set(data.map((cliente) => cliente.tipoPersona))] as string[]);
      })
      .catch((error) => console.error("❌ Error al cargar clientes:", error));
  }, []);

  /** 🚀 Aplicar filtros */
  const aplicarFiltro = () => {
    onFilter({ estado, segmento, categoria, tipoPersona });
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end", p: 2, backgroundColor: "background.paper", borderRadius: 2, boxShadow: 1 }}>
      {/* Estado */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="estado-label">Estado</InputLabel>
        <Select labelId="estado-label" value={estado} label="Estado" onChange={(e) => setEstado(e.target.value)}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="activo">Activos</MenuItem>
          <MenuItem value="inactivo">Inactivos</MenuItem>
        </Select>
      </FormControl>

      {/* Segmento (Dinámico) */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="segmento-label">Segmento</InputLabel>
        <Select labelId="segmento-label" value={segmento} label="Segmento" onChange={(e) => setSegmento(e.target.value)}>
          <MenuItem value="">Todos</MenuItem>
          {segmentos.map((seg) => <MenuItem key={seg} value={seg}>{seg}</MenuItem>)}
        </Select>
      </FormControl>

      {/* Categoría (Dinámico) */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="categoria-label">Categoría</InputLabel>
        <Select labelId="categoria-label" value={categoria} label="Categoría" onChange={(e) => setCategoria(e.target.value)}>
          <MenuItem value="">Todos</MenuItem>
          {categorias.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
        </Select>
      </FormControl>

      {/* Tipo de Persona (Dinámico) */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="tipoPersona-label">Tipo de Persona</InputLabel>
        <Select labelId="tipoPersona-label" value={tipoPersona} label="Tipo de Persona" onChange={(e) => setTipoPersona(e.target.value)}>
          <MenuItem value="">Todos</MenuItem>
          {tiposPersona.map((tipo) => <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>)}
        </Select>
      </FormControl>

      {/* Botón */}
      <Box>
        <Button variant="contained" color="primary" onClick={aplicarFiltro} sx={{ minWidth: 120 }}>
          Filtrar
        </Button>
      </Box>
    </Box>
  );
}

export default FiltrosClientes;