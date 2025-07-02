import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  Divider,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Snackbar,
  Alert
} from "@mui/material";
import FiltroPortafolio from "../components/FiltroPortafolio";

// Definir la estructura de un ítem del portafolio
interface PortafolioItem {
  // id?: string; // Eliminado, ya que el backend no lo proporciona y no es estrictamente necesario para la clave
  cedula: string;
  nombre: string; // Mapea de 'nombreCompleto' del backend
  tipoCuenta: string;
  tipoPrestamo: string | null; // Puede ser null
  fechaUltimaActualizacion: string; // Mapea de 'fechaUltimaActualizacion' del backend (número a string)
  fechaDeInformacion: string; // Mapea de 'fechaInformacion' del backend (número a string)
  estatus: string;
  score: number; // Mapea de 'cvscore' del backend
  relacionClienteCuenta: string; // Mapea de 'relacion' del backend
  originalSortID: string; // Mapea de 'rowId' del backend
}

// Interfaz para los filtros (actualizada para coincidir con FiltroPortafolio.tsx)
interface PortafolioFilters {
  tipoCuenta: string;
  tipoPrestamo: string;
  estatus: string;
  cvScoreMin: number | null;
  cvScoreMax: number | null;
  fechaUltimaActualizacionDesde: string; // Formato YYYY-MM-DD
  fechaUltimaActualizacionHasta: string; // Formato YYYY-MM-DD
  fechaDeInformacionDesde: string; // Formato YYYY-MM-DD
  fechaDeInformacionHasta: string; // Formato YYYY-MM-DD
  relacionClienteCuenta: string;
}

function ConsultarPortafolio() {
  const [portafolioItems, setPortafolioItems] = useState<PortafolioItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10); // Límite de registros por página del backend
  const [currentPageNum, setCurrentPageNum] = useState(1); // Página actual del backend (1-indexed)
  // pageKeys para paginación Keyset: lastIdentificacion será cedula, lastOriginalSortID será rowId
  const [pageKeys, setPageKeys] = useState<({ lastIdentificacion: string; lastOriginalSortID: string } | null)[]>([null]);
  const [hasNextPage, setHasNextPage] = useState(false); // Mantener este estado para la lógica del backend si es necesario
  const [currentFilters, setCurrentFilters] = useState<PortafolioFilters>({
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
  const [cedulaBusqueda, setCedulaBusqueda] = useState("");

  // Estados para la sub-paginación interna de la tabla
  const [subPageNum, setSubPageNum] = useState(1);
  const pageSize = 10; // Número de registros visibles en la tabla antes de que aparezca el scroll interno

  // Estados para Snackbar (notificaciones)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const cellStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    py: 1.2,
    borderRight: '1px solid rgba(224, 224, 224, 1)',
    fontFamily: 'Inter, sans-serif',
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  /**
   * Carga ítems del portafolio desde el backend.
   * @param {number} pageToLoad - La página a cargar.
   * @param {PortafolioFilters} filters - Los filtros a aplicar.
   * @param {boolean} isNewFilter - Indica si es una nueva aplicación de filtro (reinicia paginación).
   * @param {string | null} searchCedula - Cédula para búsqueda directa, si aplica.
   */
  const fetchPortafolioItems = async (pageToLoad: number, filters: PortafolioFilters, isNewFilter: boolean, searchCedula: string | null = null) => {
    console.log(`Frontend - fetching portafolio items: page=${pageToLoad}, filters=${JSON.stringify(filters)}, isNewFilter=${isNewFilter}, searchCedula=${searchCedula}`);
    try {
      // CORRECCIÓN: La URL base debe ser /api/portafolio/clientes
      let url = `http://localhost:5000/api/portafolio/clientes?limit=${limit}`;

      // Si no es una búsqueda directa por cédula
      if (!searchCedula) {
        // Añadir todos los nuevos parámetros de filtro
        if (filters.tipoCuenta) url += `&tipoCuenta=${encodeURIComponent(filters.tipoCuenta)}`;
        if (filters.tipoPrestamo) url += `&tipoPrestamo=${encodeURIComponent(filters.tipoPrestamo)}`;
        if (filters.estatus) url += `&estatus=${encodeURIComponent(filters.estatus)}`;
        if (filters.cvScoreMin != null) url += `&cvScoreMin=${encodeURIComponent(filters.cvScoreMin)}`;
        if (filters.cvScoreMax != null) url += `&cvScoreMax=${encodeURIComponent(filters.cvScoreMax)}`;
        if (filters.fechaUltimaActualizacionDesde) url += `&fechaUltimaActualizacionDesde=${encodeURIComponent(filters.fechaUltimaActualizacionDesde)}`;
        if (filters.fechaUltimaActualizacionHasta) url += `&fechaUltimaActualizacionHasta=${encodeURIComponent(filters.fechaUltimaActualizacionHasta)}`;
        if (filters.fechaDeInformacionDesde) url += `&fechaDeInformacionDesde=${encodeURIComponent(filters.fechaDeInformacionDesde)}`;
        if (filters.fechaDeInformacionHasta) url += `&fechaDeInformacionHasta=${encodeURIComponent(filters.fechaDeInformacionHasta)}`;
        if (filters.relacionClienteCuenta) url += `&relacionClienteCuenta=${encodeURIComponent(filters.relacionClienteCuenta)}`;

        // Lógica para keyset pagination
        if (!isNewFilter && pageKeys[pageToLoad - 1]) {
          url += `&lastCedula=${encodeURIComponent(pageKeys[pageToLoad - 1]!.lastIdentificacion)}`; // lastIdentificacion mapea a cedula
          url += `&lastOriginalSortID=${encodeURIComponent(pageKeys[pageToLoad - 1]!.lastOriginalSortID)}`; // Mapea a rowId
        }
      } else {
        // CORRECCIÓN: Si hay una búsqueda directa por cédula, se usa la ruta específica para buscar por cédula
        url = `http://localhost:5000/api/portafolio/clientes/${encodeURIComponent(searchCedula)}`;
      }

      console.log(`Frontend - URL de la API de Portafolio: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error en la API de Portafolio: ${response.statusText}`);
      }
      const data = await response.json();

      if (searchCedula) {
        // El backend para búsqueda por cédula puede devolver un objeto o un array.
        // Si devuelve un solo objeto (cliente), conviértelo a un array.
        // Si devuelve un array (clientes), úsalo directamente.
        // Si no devuelve nada (null/undefined), usa un array vacío.
        const fetchedData = Array.isArray(data) ? data : (data ? [data] : []);

        // Mapear los datos fetched para que coincidan con PortafolioItem
        const mappedData: PortafolioItem[] = fetchedData.map((row: any) => ({
          cedula: row.cedula,
          nombre: row.nombreCompleto, // Mapea nombreCompleto a nombre
          tipoCuenta: row.tipoCuenta,
          tipoPrestamo: row.tipoPrestamo,
          fechaUltimaActualizacion: row.fechaUltimaActualizacion ? String(row.fechaUltimaActualizacion) : "N/A", // Convertir a string
          fechaDeInformacion: row.fechaInformacion ? String(row.fechaInformacion) : "N/A", // Convertir a string
          estatus: row.estatus,
          score: row.cvscore, // Mapea cvscore a score
          relacionClienteCuenta: row.relacion, // Mapea relacion a relacionClienteCuenta
          originalSortID: row.rowId, // Mapea rowId a originalSortID
        }));

        setPortafolioItems(mappedData);
        setTotalCount(mappedData.length);
        setHasNextPage(false); // Generalmente, la búsqueda directa no tiene paginación
        setCurrentPageNum(1);
        setPageKeys([null]);
        setSubPageNum(1);
        showSnackbar(`Portafolio${mappedData.length > 1 ? 's' : ''} encontrado${mappedData.length > 1 ? 's' : ''}.`, "success");
      } else {
        // CORRECCIÓN: El backend devuelve 'clientes' no 'portafolioItems'
        const fetchedClientes = data.clientes || [];

        // Mapear los datos fetched para que coincidan con PortafolioItem
        const mappedClientes: PortafolioItem[] = fetchedClientes.map((row: any) => ({
          cedula: row.cedula,
          nombre: row.nombreCompleto, // Mapea nombreCompleto a nombre
          tipoCuenta: row.tipoCuenta,
          tipoPrestamo: row.tipoPrestamo,
          fechaUltimaActualizacion: row.fechaUltimaActualizacion ? String(row.fechaUltimaActualizacion) : "N/A", // Convertir a string
          fechaDeInformacion: row.fechaInformacion ? String(row.fechaInformacion) : "N/A", // Convertir a string
          estatus: row.estatus,
          score: row.cvscore, // Mapea cvscore a score
          relacionClienteCuenta: row.relacion, // Mapea relacion a relacionClienteCuenta
          originalSortID: row.rowId, // Mapea rowId a originalSortID
        }));

        setPortafolioItems(mappedClientes);
        setTotalCount(data.totalCount || 0);
        setHasNextPage(data.hasNextPage || false); // Mantener el hasNextPage del backend

        if (isNewFilter) {
          setPageKeys([null]);
          setCurrentPageNum(1);
        }

        // Si hay una lastItemKey de la respuesta, la guardamos para la siguiente página
        if (data.lastItemKey && pageToLoad === currentPageNum) {
          setPageKeys(prevKeys => {
            const newKeys = [...prevKeys];
            newKeys[pageToLoad] = data.lastItemKey; // Guarda la clave para la próxima página
            return newKeys;
          });
        }
        setSubPageNum(1); // Reiniciar sub-paginación
        showSnackbar("Portafolio cargado exitosamente.", "success");
      }
    } catch (error: any) {
      console.error("❌ Error al cargar ítems del portafolio:", error);
      setPortafolioItems([]);
      setTotalCount(0);
      setHasNextPage(false);
      setPageKeys([null]);
      setCurrentPageNum(1);
      setSubPageNum(1);
      showSnackbar(`Error al cargar portafolio: ${error.message}`, "error");
    }
  };

  // Efecto para cargar ítems del portafolio cuando cambian los filtros o la página (backend)
  useEffect(() => {
    fetchPortafolioItems(currentPageNum, currentFilters, false); // 'false' porque no es una nueva aplicación de filtro
  }, [currentPageNum, limit, currentFilters]); // Dependencias: página, límite o cambios en filtros

  const handleFilterChange = (newFilters: PortafolioFilters) => {
    setCurrentFilters(newFilters);
    setCurrentPageNum(1); // Siempre resetear a la primera página del backend al aplicar filtros
  };

  const handleBuscarPorCedula = () => {
    if (cedulaBusqueda.trim()) {
      // Al buscar por cédula, se resetean todos los filtros para asegurar una búsqueda limpia
      setCurrentFilters({ // Reinicia todos los filtros a sus valores por defecto/vacíos
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
      fetchPortafolioItems(1, currentFilters, true, cedulaBusqueda.trim());
    } else {
      showSnackbar("Por favor, introduzca una cédula para buscar en el portafolio.", "warning");
    }
  };

  // Lógica de paginación de la tabla interna (frontend)
  const startIndex = (subPageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const visiblePortafolioItems = portafolioItems.slice(startIndex, endIndex);

  const handleSubPageNext = () => {
    setSubPageNum(prev => prev + 1);
  };

  const handleSubPagePrev = () => {
    setSubPageNum(prev => prev - 1);
  };

  // Paginación a nivel de Backend (TablePagination)
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setCurrentPageNum(1); // Resetear a la primera página al cambiar el límite
    setPageKeys([null]); // Limpiar keyset al cambiar límite
  };

  const handlePageNext = () => {
    setCurrentPageNum(prev => prev + 1);
  };

  const handlePagePrev = () => {
    setCurrentPageNum(prev => prev - 1);
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      p: 1,
      backgroundColor: "background.default",
      width: "1600px",
      marginLeft: "14vh"
    }}>
      <Paper elevation={3} sx={{
        maxWidth: '100%',
        mx: "auto",
        p: 4,
        borderRadius: 4,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minHeight: '400px'
      }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
          Consultar Portafolio
        </Typography>

        <Box>
          {/* Aquí se reemplaza el placeholder con el componente FiltroPortafolio */}
          <FiltroPortafolio onFilter={handleFilterChange} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Buscar por Cédula"
            variant="outlined"
            size="small" // <-- Este cambio reduce la altura visual
            value={cedulaBusqueda}
            onChange={(e) => {
              const nuevaCedula = e.target.value;
              setCedulaBusqueda(nuevaCedula);
              if (nuevaCedula.trim() === "") {
                setCurrentPageNum(1);
                setPageKeys([null]);
                setHasNextPage(false);
                fetchPortafolioItems(1, currentFilters, true);
              }
            }}
            sx={{ width: 280 }}
            InputProps={{
              sx: { height: 40 } // <-- Altura más contenida
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleBuscarPorCedula}
            sx={{ height: 40, minWidth: '120px' }}
          >
            Consultar
          </Button>
        </Box>

        {/* CONTENEDOR DE LA TABLA CON SCROLL VERTICAL */}
        <Box sx={{
          maxHeight: '300px', // Altura fija para la tabla
          overflowY: 'auto', // Siempre permite el scroll vertical si el contenido excede el maxHeight
          width: '100%',
          borderRadius: 2,
        }}>
          <TableContainer component={Paper} sx={{
            boxShadow: 0,
            borderRadius: 2,
            overflowX: 'auto', // Permite el scroll horizontal
            width: '100%',
            my: 0, // Margen vertical se gestiona por el 'gap' del Box padre
          }}>
            <Table sx={{ minWidth: 1200, tableLayout: "auto" }} aria-label="tabla de portafolio">
              <TableHead sx={{ backgroundColor: "#002f6c" }}>
                <TableRow>
                  {[
                    // "ID", // Eliminado: el backend no lo proporciona
                    "Cédula", "Nombre", "Tipo Cuenta", "Tipo de Préstamo",
                    "Fecha Última Act.", "Fecha Información", "Estatus", "Score", "Relación Cta. Cliente"
                  ].map((header, index) => (
                    <TableCell
                      key={index}
                      sx={{
                        color: "#fff",
                        fontWeight: "bold",
                        py: 1.5,
                        textTransform: 'uppercase',
                        borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {visiblePortafolioItems.map((item: PortafolioItem, index: number) => (
                  <TableRow
                    key={`${item.cedula}-${item.originalSortID}-${index}`}
                    hover
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: 'action.hover'
                      },
                      '&:last-child td, &:last-child th': {
                        border: 0
                      },
                      transition: 'background-color 0.2s ease-in-out',
                    }}
                  >
                    {/* <TableCell sx={cellStyle}>{item.id}</TableCell> // Eliminado: el backend no lo proporciona */}
                    <TableCell sx={cellStyle}>{item.cedula}</TableCell>
                    <TableCell sx={cellStyle}>{item.nombre}</TableCell>
                    <TableCell sx={cellStyle}>{item.tipoCuenta}</TableCell>
                    <TableCell sx={cellStyle}>{item.tipoPrestamo}</TableCell>
                    <TableCell sx={cellStyle}>
                      {item.fechaUltimaActualizacion ? item.fechaUltimaActualizacion.split("T")[0] : "N/A"}
                    </TableCell>
                    <TableCell sx={cellStyle}>
                      {item.fechaDeInformacion ? item.fechaDeInformacion.split("T")[0] : "N/A"}
                    </TableCell>
                    <TableCell sx={cellStyle}>{item.estatus}</TableCell>
                    <TableCell sx={cellStyle}>{item.score}</TableCell>
                    <TableCell sx={{ ...cellStyle, borderRight: 0 }}>{item.relacionClienteCuenta}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {portafolioItems.length > pageSize && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
            <Paper elevation={4} sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              p: 2,
              px: 3,
              borderRadius: 3,
              backgroundColor: 'background.paper',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
            }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubPagePrev}
                disabled={subPageNum === 1}
                sx={{ minWidth: 150, py: 1, fontWeight: 'bold', borderRadius: 2 }}
              >
                &lt; Anterior
              </Button>
              <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary', minWidth: 150, textAlign: 'center' }}>
                Páginas: {subPageNum} / {Math.ceil(portafolioItems.length / pageSize)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubPageNext}
                disabled={subPageNum >= Math.ceil(portafolioItems.length / pageSize)}
                sx={{ minWidth: 150, py: 1, fontWeight: 'bold', borderRadius: 2 }}
              >
                Siguiente &gt;
              </Button>
            </Paper>
          </Box>
        )}

        <TablePagination
          rowsPerPageOptions={[10, 50, 100, 300, 1000, 4000, 8000, 32000, 100000, 1000000, 2000000, 5000000]}
          component="div"
          count={totalCount}
          rowsPerPage={limit}
          page={currentPageNum - 1}
          onPageChange={() => { }}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          sx={{
            mb: -1,
            "& .MuiTablePagination-actions": { display: 'none' },
            "& .MuiTablePagination-toolbar": { justifyContent: 'center' },
            "& .MuiTablePagination-root": { fontSize: "1.2rem" }
          }}
        />
      </Paper>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ConsultarPortafolio;