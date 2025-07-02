import { Select, MenuItem, Button, Box, FormControl, InputLabel, FormHelperText, Tooltip, IconButton } from "@mui/material";
import { useState, useEffect } from "react";
<<<<<<< HEAD
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
=======
>>>>>>> 637d44f740325e0150be4366d05ff84952d8d5dd

/** Definir estructura de Filtros */
interface Filters {
  estado: string;
  segmento: string;
  tipoPersona: string;
  nacionalidad: string;
  residencia: string;
}

const hardcodedTiposPersona = ["Física", "Empresa"];

const hardcodedEstados = [
  "CANCELADO", "ACTIVE", "INICIADO", "CALIFICADO", "EN PROCESO",
  "DEVUELTO/INFORMACIÓN FALTANTE", "RECHAZADO", "ACTIVO", "PENDIENTE",
  "VALIDADO", "APROBADO", "EN INVESTIGACIÓN", "CREADO"
];

// Opcional: Puedes mantener hardcodedResidencias o solo usar la dinámica
// const hardcodedResidencias = ["PERMANENTE", "TEMPORAL", "NO RESIDENTE", "CIUDADANO"];

const menuProps = {
  PaperProps: {
    style: {
      maxHeight: 340, 
      width: 350,
    },
  },
};

function FiltrosClientes({ onFilter }: { onFilter: (filtros: Filters) => void }) {
  const [estado, setEstado] = useState("");
  const [segmento, setSegmento] = useState("");
<<<<<<< HEAD
=======
  const [categoria, setCategoria] = useState("");
>>>>>>> 637d44f740325e0150be4366d05ff84952d8d5dd
  const [tipoPersona, setTipoPersona] = useState("");
  const [nacionalidad, setNacionalidad] = useState("");
  const [residencia, setResidencia] = useState("");
  const [tipoPersonaError, setTipoPersonaError] = useState(false);

  const [dynamicSegmentos, setDynamicSegmentos] = useState<string[]>([]);
  const [dynamicNacionalidades, setDynamicNacionalidades] = useState<string[]>([]);
  const [dynamicResidencias, setDynamicResidencias] = useState<string[]>([]);

<<<<<<< HEAD
  useEffect(() => {
    fetch("http://localhost:5000/api/ConsultaCliente/segmentos-unicos")
      .then(response => response.json())
      .then((data: string[]) => {
        setDynamicSegmentos(data.filter(Boolean));
      })
      .catch(error => console.error("❌ Error al cargar segmentos dinámicos:", error));

    fetch("http://localhost:5000/api/ConsultaCliente/nacionalidad-unica")
      .then(res => res.json())
      .then((data: string[]) => {
        setDynamicNacionalidades(data.filter(Boolean));
      })
      .catch(err => console.error("❌ Error al cargar nacionalidades únicas:", err));

    fetch("http://localhost:5000/api/ConsultaCliente/residencia-unica")
      .then(res => res.json())
      .then((data: string[]) => {
        setDynamicResidencias(data.filter(Boolean));
      })
      .catch(err => console.error("❌ Error al cargar residencias únicas:", err));
=======
  const [segmentos, setSegmentos] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [tiposPersona, setTiposPersona] = useState<string[]>([]);

  /** 🚀 Cargar clientes y extraer opciones únicas con tipado correcto */
  useEffect(() => {
    fetch("http://localhost:5000/api/clientes")
      .then(response => response.json())
      .then((data: Cliente[]) => {
        console.log("✅ Datos recibidos:", data);

        const segmentosUnicos = [...new Set(data.map((cliente) => cliente.segmento))];
        const categoriasUnicas = [...new Set(data.map((cliente) => cliente.categoria))];
        const tiposPersonaUnicos = [...new Set(data.map((cliente) => cliente.tipoPersona))];

        setSegmentos(segmentosUnicos);
        setCategorias(categoriasUnicas);
        setTiposPersona(tiposPersonaUnicos);
      })
      .catch(error => console.error("❌ Error al cargar clientes:", error));
>>>>>>> 637d44f740325e0150be4366d05ff84952d8d5dd
  }, []);

  const aplicarFiltro = () => {
    if (!tipoPersona) {
      setTipoPersonaError(true);
      return;
    }
    setTipoPersonaError(false);

    onFilter({
      estado,
      segmento,
      tipoPersona,
      nacionalidad: nacionalidad.trim(),
      residencia: residencia.trim()
    });
  };

  const limpiarFiltros = () => {
    setEstado("");
    setSegmento("");
    setTipoPersona("");
    setNacionalidad("");
    setResidencia("");
    setTipoPersonaError(false);
    onFilter({ estado: "", segmento: "", tipoPersona: "", nacionalidad: "", residencia: "" });
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end", p: 2, backgroundColor: "background.paper", borderRadius: 2, boxShadow: 1 }}>

      {/* Estado */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="estado-label">Estado</InputLabel>
        <Select labelId="estado-label" value={estado} label="Estado" onChange={(e) => setEstado(e.target.value)}>
          <MenuItem value="">Todos</MenuItem>
          {hardcodedEstados.map((est, index) => (
            <MenuItem key={index} value={est}>{est}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Segmento */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="segmento-label">Segmento</InputLabel>
        <Select labelId="segmento-label" value={segmento} label="Segmento" onChange={(e) => setSegmento(e.target.value)}>
          <MenuItem value="">Todos</MenuItem>
<<<<<<< HEAD
          {dynamicSegmentos.map((seg, index) => (
            <MenuItem key={index} value={seg}>{seg}</MenuItem>
=======
          {segmentos.map((seg, index) => (
            <MenuItem key={`${seg}-${index}`} value={seg}>{seg}</MenuItem>
>>>>>>> 637d44f740325e0150be4366d05ff84952d8d5dd
          ))}
        </Select>
      </FormControl>

<<<<<<< HEAD
      {/* Tipo de Persona */}
      <FormControl sx={{ minWidth: 160 }} size="small" error={tipoPersonaError}>
        <InputLabel id="tipoPersona-label">Tipo de Persona</InputLabel>
        <Select
          labelId="tipoPersona-label"
          value={tipoPersona}
          label="Tipo de Persona"
          onChange={(e) => {
            setTipoPersona(e.target.value);
            if (e.target.value) setTipoPersonaError(false);
          }}
        >
          <MenuItem value="">Seleccione</MenuItem>
          {hardcodedTiposPersona.map((tipo, index) => (
            <MenuItem key={index} value={tipo}>{tipo}</MenuItem>
          ))}
        </Select>
        {tipoPersonaError && <FormHelperText>Debe seleccionar un tipo de persona</FormHelperText>}
      </FormControl>

      {/* Nacionalidad */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="nacionalidad-label">Nacionalidad</InputLabel>
        <Select
          labelId="nacionalidad-label"
          value={nacionalidad}
          label="Nacionalidad"
          onChange={(e) => setNacionalidad(e.target.value)}
          MenuProps={menuProps}
        >
          <MenuItem value="">Todas</MenuItem>
          {dynamicNacionalidades.map((nac, index) => (
            <MenuItem key={index} value={nac}>{nac}</MenuItem>
=======
      {/* Categoría (Dinámico) */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="categoria-label">Categoría</InputLabel>
        <Select labelId="categoria-label" value={categoria} label="Categoría" onChange={(e) => setCategoria(e.target.value)}>
          <MenuItem value="">Todos</MenuItem>
          {categorias.map((cat, index) => (
            <MenuItem key={`${cat}-${index}`} value={cat}>{cat}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Tipo de Persona (Dinámico) */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="tipoPersona-label">Tipo de Persona</InputLabel>
        <Select labelId="tipoPersona-label" value={tipoPersona} label="Tipo de Persona" onChange={(e) => setTipoPersona(e.target.value)}>
          <MenuItem value="">Todos</MenuItem>
          {tiposPersona.map((tipo, index) => (
            <MenuItem key={`${tipo}-${index}`} value={tipo}>{tipo}</MenuItem>
>>>>>>> 637d44f740325e0150be4366d05ff84952d8d5dd
          ))}
        </Select>
      </FormControl>

      {/* Residencia */}
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="residencia-label">Residencia</InputLabel>
        <Select
          labelId="residencia-label"
          value={residencia}
          label="Residencia"
          onChange={(e) => setResidencia(e.target.value)}
          MenuProps={menuProps}
        >
          <MenuItem value="">Todas</MenuItem>
          {dynamicResidencias.map((res, index) => (
            <MenuItem key={index} value={res}>{res}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Botones */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={aplicarFiltro}
          sx={{ minWidth: 120 }}
          //disabled={!tipoPersona}
        >
          Filtrar
        </Button>
        <Tooltip
          title={`El botón de filtrar se habilita solo cuando 'Tipo de Persona' es seleccionado. Puede aplicar más filtros o simplemente filtrar por 'Tipo de Persona'.
Los resultados van a depender de 'Filas por página' en la parte inferior a la izquierda.`}
          arrow
          placement="top"
        >
          <IconButton size="small" sx={{ p: 0.5 }}>
            <InfoOutlinedIcon color="action" fontSize="small" />
          </IconButton>
        </Tooltip>

        <Button variant="contained" color="secondary" onClick={limpiarFiltros} sx={{ minWidth: 120 }}>
          Limpiar
        </Button>
      </Box>
    </Box>
  );
}

export default FiltrosClientes;