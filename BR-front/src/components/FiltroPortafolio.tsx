import React, { useState, useEffect } from "react";
import {
  Select,
  MenuItem,
  Button,
  Box,
  FormControl,
  InputLabel,
  TextField,
  Tooltip,
  IconButton,
  FormHelperText,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface PortafolioFilters {
  tipoCuenta: string;
  tipoPrestamo: string;
  estatus: string;
  cvScoreMin: number | null;
  cvScoreMax: number | null;
  fechaUltimaActualizacionDesde: string;
  fechaUltimaActualizacionHasta: string;
  fechaDeInformacionDesde: string;
  fechaDeInformacionHasta: string;
  relacionClienteCuenta: string;
}

const menuProps = {
  PaperProps: {
    style: {
      maxHeight: 340,
      width: 350,
    },
  },
};

function FiltroPortafolio({ onFilter }: { onFilter: (filtros: PortafolioFilters) => void }) {
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [tipoPrestamo, setTipoPrestamo] = useState("");
  const [estatus, setEstatus] = useState("");
  const [cvScoreMin, setCvScoreMin] = useState<number | null>(null);
  const [cvScoreMax, setCvScoreMax] = useState<number | null>(null);
  const [fechaUltimaActualizacionDesde, setFechaUltimaActualizacionDesde] = useState("");
  const [fechaUltimaActualizacionHasta, setFechaUltimaActualizacionHasta] = useState("");
  const [fechaDeInformacionDesde, setFechaDeInformacionDesde] = useState("");
  const [fechaDeInformacionHasta, setFechaDeInformacionHasta] = useState("");
  const [relacionClienteCuenta, setRelacionClienteCuenta] = useState("");
  const [cvScoreError, setCvScoreError] = useState(false);

  const [tiposCuenta, setTiposCuenta] = useState<string[]>([]);
  const [tiposPrestamo, setTiposPrestamo] = useState<string[]>([]);
  const [estatusList, setEstatusList] = useState<string[]>([]);
  const [relaciones, setRelaciones] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/portafolio/tipos-cuenta")
      .then(res => res.json())
      .then(data => setTiposCuenta(data.filter(Boolean)))
      .catch(err => console.error("❌ Error cargando tipos cuenta:", err));

    fetch("http://localhost:5000/api/portafolio/tipos-prestamo")
      .then(res => res.json())
      .then(data => setTiposPrestamo(data.filter(Boolean)))
      .catch(err => console.error("❌ Error cargando tipos préstamo:", err));

    fetch("http://localhost:5000/api/portafolio/estatus")
      .then(res => res.json())
      .then(data => setEstatusList(data.filter(Boolean)))
      .catch(err => console.error("❌ Error cargando estatus:", err));

    fetch("http://localhost:5000/api/portafolio/relaciones")
      .then(res => res.json())
      .then(data => setRelaciones(data.filter(Boolean)))
      .catch(err => console.error("❌ Error cargando relaciones:", err));
  }, []);

  const aplicarFiltro = () => {
    if ((cvScoreMin !== null && isNaN(cvScoreMin)) || (cvScoreMax !== null && isNaN(cvScoreMax))) {
      setCvScoreError(true);
      return;
    }
    setCvScoreError(false);

    onFilter({
      tipoCuenta,
      tipoPrestamo,
      estatus,
      cvScoreMin,
      cvScoreMax,
      fechaUltimaActualizacionDesde,
      fechaUltimaActualizacionHasta,
      fechaDeInformacionDesde,
      fechaDeInformacionHasta,
      relacionClienteCuenta,
    });
  };

  const limpiarFiltros = () => {
    setTipoCuenta("");
    setTipoPrestamo("");
    setEstatus("");
    setCvScoreMin(null);
    setCvScoreMax(null);
    setFechaUltimaActualizacionDesde("");
    setFechaUltimaActualizacionHasta("");
    setFechaDeInformacionDesde("");
    setFechaDeInformacionHasta("");
    setRelacionClienteCuenta("");
    setCvScoreError(false);

    onFilter({
      tipoCuenta: "",
      tipoPrestamo: "",
      estatus: "",
      cvScoreMin: null,
      cvScoreMax: null,
      fechaUltimaActualizacionDesde: "",
      fechaUltimaActualizacionHasta: "",
      fechaDeInformacionDesde: "",
      fechaDeInformacionHasta: "",
      relacionClienteCuenta: "",
    });
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end", p: 2, backgroundColor: "background.paper", borderRadius: 2, boxShadow: 1 }}>
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="tipoCuenta-label">Tipo Cuenta</InputLabel>
        <Select labelId="tipoCuenta-label" value={tipoCuenta} label="Tipo Cuenta" onChange={(e) => setTipoCuenta(e.target.value)} MenuProps={menuProps}>
          <MenuItem value="">Todas</MenuItem>
          {tiposCuenta.map((tipo, index) => (
            <MenuItem key={index} value={tipo}>{tipo}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="tipoPrestamo-label">Tipo de Préstamo</InputLabel>
        <Select labelId="tipoPrestamo-label" value={tipoPrestamo} label="Tipo de Préstamo" onChange={(e) => setTipoPrestamo(e.target.value)} MenuProps={menuProps}>
          <MenuItem value="">Todos</MenuItem>
          {tiposPrestamo.map((tipo, index) => (
            <MenuItem key={index} value={tipo}>{tipo}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="estatus-label">Estatus</InputLabel>
        <Select labelId="estatus-label" value={estatus} label="Estatus" onChange={(e) => setEstatus(e.target.value)} MenuProps={menuProps}>
          <MenuItem value="">Todos</MenuItem>
          {estatusList.map((est, index) => (
            <MenuItem key={index} value={est}>{est}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Score Min."
        variant="outlined"
        size="small"
        type="number"
        value={cvScoreMin ?? ""}
        onChange={(e) => setCvScoreMin(e.target.value ? Number(e.target.value) : null)}
        error={cvScoreError}
        helperText={cvScoreError ? "Debe ser numérico" : ""}
      />

      <TextField
        label="Score Max."
        variant="outlined"
        size="small"
        type="number"
        value={cvScoreMax ?? ""}
        onChange={(e) => setCvScoreMax(e.target.value ? Number(e.target.value) : null)}
        error={cvScoreError}
        helperText={cvScoreError ? "Debe ser numérico" : ""}
      />

      <TextField
        label="Ult. Act. Desde"
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        value={fechaUltimaActualizacionDesde}
        onChange={(e) => setFechaUltimaActualizacionDesde(e.target.value)}
      />

      <TextField
        label="Ult. Act. Hasta"
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        value={fechaUltimaActualizacionHasta}
        onChange={(e) => setFechaUltimaActualizacionHasta(e.target.value)}
      />

      <TextField
        label="Inf. Desde"
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        value={fechaDeInformacionDesde}
        onChange={(e) => setFechaDeInformacionDesde(e.target.value)}
      />

      <TextField
        label="Inf. Hasta"
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        value={fechaDeInformacionHasta}
        onChange={(e) => setFechaDeInformacionHasta(e.target.value)}
      />

      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="relacion-label">Relación</InputLabel>
        <Select labelId="relacion-label" value={relacionClienteCuenta} label="Relación" onChange={(e) => setRelacionClienteCuenta(e.target.value)} MenuProps={menuProps}>
          <MenuItem value="">Todas</MenuItem>
          {relaciones.map((rel, index) => (
            <MenuItem key={index} value={rel}>{rel}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button variant="contained" color="primary" onClick={aplicarFiltro} sx={{ minWidth: 120 }}>
          Filtrar
        </Button>
        <Tooltip title="Aplique filtros para personalizar los resultados del portafolio." arrow>
          <IconButton size="small">
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

export default FiltroPortafolio;
