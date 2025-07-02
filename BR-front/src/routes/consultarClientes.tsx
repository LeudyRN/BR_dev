import { useEffect, useState, useCallback } from "react";
import FiltrosClientes from "../components/FiltrosClientes";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, Divider, Button as MuiButton, TextField, Button, TablePagination } from "@mui/material";

interface Cliente {
  id: number;
  nombre: string;
  cedula: string;
  identificacion?: string;
  estado: string;
  segmento: string;
  tipoPersona: string;
  fechaVenc: string;
  nacionalidad?: string;      // <-- Nuevo
  residencia?: string;        // <-- Nuevo
  originalSortID?: string;
}

interface LastItemKey {
  lastIdentificacion: string;
  lastOriginalSortID: string;
}

interface Filters {
  estado: string;
  segmento: string;
  tipoPersona: string;
  nacionalidad?: string;
  residencia?: string;
}

interface ApiResponse {
  clientes: Cliente[];
  totalCount: number;
  hasNextPage: boolean;
  lastItemKey: LastItemKey | null;
}

function ConsultaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [cedulaBusqueda, setCedulaBusqueda] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<Filters>({ estado: "", segmento: "", tipoPersona: "" });

  const [pageKeys, setPageKeys] = useState<(LastItemKey | null)[]>([null]);
  const [currentPageNum, setCurrentPageNum] = useState(1);

  // NUEVO: Estado para subpaginación interna
  const [subPageNum, setSubPageNum] = useState(1);
  const pageSize = 10; // Número de filas que queremos mostrar por pantalla

  const fetchClientsData = useCallback(async (
    keyToFetchWith: LastItemKey | null,
    currentLimit: number,
    filters: Filters
  ) => {
    try {
      if (!filters.tipoPersona) {
        console.warn("No se ha especificado tipoPersona. No se cargan clientes.");
        return null;
      }

      let url = `http://localhost:5000/api/ConsultaCliente?limit=${currentLimit}`;

      if (keyToFetchWith) {
        url += `&lastIdentificacion=${encodeURIComponent(keyToFetchWith.lastIdentificacion)}&lastOriginalSortID=${encodeURIComponent(keyToFetchWith.lastOriginalSortID)}`;
      }
      if (filters.estado) url += `&estado=${encodeURIComponent(filters.estado)}`;
      if (filters.segmento) url += `&segmento=${encodeURIComponent(filters.segmento)}`;
      if (filters.tipoPersona) url += `&tipoPersona=${encodeURIComponent(filters.tipoPersona)}`;
      if (filters.nacionalidad) url += `&nacionalidad=${encodeURIComponent(filters.nacionalidad)}`;
      if (filters.residencia) url += `&residencia=${encodeURIComponent(filters.residencia)}`;

      console.log(`Frontend - Fetching URL (Keyset with Filters): ${url}`);
      const response = await fetch(url);
      const data: ApiResponse = await response.json();

      const clientesMapeados: Cliente[] = (data.clientes || []).map((item: Partial<Cliente>): Cliente => ({
        id: item.id ?? (item.identificacion ? parseInt(item.identificacion.replace(/\D/g, '')) || 0 : Math.random()),
        nombre: item.nombre ?? "Sin nombre",
        cedula: item.identificacion ?? "N/A",
        identificacion: item.identificacion ?? "N/A",
        estado: item.estado ?? "Desconocido",
        segmento: item.segmento ?? "Sin segmento",
        tipoPersona: item.tipoPersona ?? "Sin tipo",
        fechaVenc: item.fechaVenc ?? "N/A",
        nacionalidad: item.nacionalidad ?? "N/A",
        residencia: item.residencia ?? "N/A",
        originalSortID: item.originalSortID ?? "0"
      }));


      setClientes(clientesMapeados);
      setTotalCount(data.totalCount || 0);
      setHasNextPage(data.hasNextPage);
      setSubPageNum(1);

      return data.lastItemKey;

    } catch (error) {
      console.error("❌ Error al obtener clientes:", error);
      setClientes([]);
      setTotalCount(0);
      setHasNextPage(false);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchPage = async () => {
      if (cedulaBusqueda.trim() === "") {
        if (!currentFilters.tipoPersona) {
          console.warn("No se ha especificado tipoPersona. No se cargan clientes.");
          return;
        }

        const keyToUse = pageKeys[currentPageNum - 1];
        const nextKey = await fetchClientsData(keyToUse, limit, currentFilters);

        if (nextKey && currentPageNum === pageKeys.length) {
          setPageKeys(prev => [...prev, nextKey]);
        }
      }
    };
    fetchPage();
  }, [limit, currentFilters, cedulaBusqueda, currentPageNum, pageKeys.length, fetchClientsData]);

  useEffect(() => {
    setPageKeys([null]);
    setCurrentPageNum(1);
    setClientes([]);
    setTotalCount(0);
    setSubPageNum(1); // Reiniciar subpaginación cuando cambian filtros
  }, [currentFilters]);

  // Slice para mostrar solo lo que corresponde en la subpaginación
  const startIndex = (subPageNum - 1) * pageSize;
  const visibleClientes = clientes.slice(startIndex, startIndex + pageSize);

  // Manejar cambio de filas por página (limit)
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setLimit(newLimit);
    setCurrentPageNum(1);
    setPageKeys([null]);
    setSubPageNum(1); // Reiniciar subpaginación también
  };

  // Navegar páginas completas (backend)
  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPageNum(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageNum > 1) {
      setCurrentPageNum(prev => prev - 1);
      setPageKeys(prev => prev.slice(0, currentPageNum - 1));
    }
  };

  const handleSubPageNext = () => {
    if (subPageNum < Math.ceil(clientes.length / pageSize)) {
      setSubPageNum(prev => prev + 1);
    }

  };

  const cellStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    py: 1.2,
    borderRight: '1px solid rgba(224, 224, 224, 1)',
    fontFamily: 'Inter, sans-serif',
  };

  const handleSubPagePrev = () => {
    if (subPageNum > 1) {
      setSubPageNum(prev => prev - 1);
    }
  };

  // Manejar cambio de filtros
  const handleFilterChange = (newFilters: Filters) => {
    setCurrentFilters(newFilters);
    setCurrentPageNum(1);
    setPageKeys([null]);
    setSubPageNum(1);
  };

  // Búsqueda por cédula (sin keyset)
  const handleBuscarPorCedula = () => {
    const url = cedulaBusqueda
      ? `http://localhost:5000/api/ConsultaCliente/${cedulaBusqueda}`
      : `http://localhost:5000/api/ConsultaCliente?limit=${limit}`;

    fetch(url)
      .then(response => response.json())
      .then((data: Cliente | Cliente[] | ApiResponse) => {
        let clientesArray: Cliente[] = [];
        let fetchedTotalCount = 0;
        let fetchedHasNextPage = false;

        if (Array.isArray(data)) {
          clientesArray = data;
          fetchedTotalCount = data.length;
        } else if ('clientes' in data && 'totalCount' in data) {
          clientesArray = (data as ApiResponse).clientes;
          fetchedTotalCount = (data as ApiResponse).totalCount || 0;
          fetchedHasNextPage = (data as ApiResponse).hasNextPage || false;
        } else {
          clientesArray = [data as Cliente];
          fetchedTotalCount = 1;
        }

        setClientes(clientesArray);
        setTotalCount(fetchedTotalCount);
        setHasNextPage(fetchedHasNextPage); // 👈 este era importante
        setCurrentPageNum(1);
        setPageKeys([null]);
        setSubPageNum(1); // Si usas subpaginación
      })

      .catch(error => console.error("❌ Error en la búsqueda por cédula:", error));
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
          Consultar Clientes
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FiltrosClientes onFilter={handleFilterChange} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Buscar por Cédula o RNC"
            variant="outlined"
            value={cedulaBusqueda}
            onChange={(e) => {
              const nuevaCedula = e.target.value;
              setCedulaBusqueda(nuevaCedula);
              if (nuevaCedula.trim() === "") {
                setCurrentPageNum(1);
                setPageKeys([null]);
                setHasNextPage(false);
                setCurrentFilters({ estado: "", segmento: "", tipoPersona: "" });
                setSubPageNum(1);
              }
            }}

            sx={{ width: 280 }}
            InputProps={{
              sx: { height: 50 }
            }}

          />
          <Button variant="contained" color="primary" onClick={handleBuscarPorCedula}>
            Consultar
          </Button>
        </Box>

        {/* CONTENEDOR DE LA TABLA CON SCROLL VERTICAL */}
        <Box sx={{
          maxHeight: '300px', // Altura fija para la tabla, ajusta si es necesario (ej: 280px para 5-6 filas)
          overflowY: 'auto', // Siempre permite el scroll vertical si el contenido excede el maxHeight
          width: '100%',
          borderRadius: 2,
          // 'my: 4' y 'marginTop: -5px' de TableContainer original se manejan externamente o pueden ajustarse aquí si es necesario
        }}>
          <TableContainer component={Paper}
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              overflowX: 'auto', // Sigue permitiendo el scroll horizontal
              // overflowY y maxHeight ya no son necesarios aquí, el Box padre los controla
              width: '100%',
              mx: 'auto',
              // Los márgenes `my: 4` y `marginTop: -5px` deberían estar en el Box que envuelve,
              // o si se quieren aplicar a TableContainer, que no entre en conflicto con el Box padre.
              // Para este fragmento, se asume que el contenedor padre (Box) maneja el espaciado vertical
              // o que estos estilos son deseados específicamente en el TableContainer sin conflicto.
              my: 4, // Mantenido del código original del usuario
              marginTop: '-5px', // Mantenido del código original del usuario
            }}
          >
            <Table sx={{ minWidth: 1000, tableLayout: "auto" }} aria-label="tabla de clientes">
              <TableHead sx={{ backgroundColor: "#002f6c" }}>
                <TableRow>
                  {[
                    "ID", "Nombre", "Cédula/RNC", "Estado", "Segmento",
                    "Tipo de Persona", "Nacionalidad", "Residencia", "Fecha de vencimiento"
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
                {visibleClientes.map((cliente: Cliente, index: number) => (
                  <TableRow
                    key={`${cliente.identificacion}-${cliente.originalSortID}-${index}`}
                    hover
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.2s ease-in-out',
                    }}
                  >
                    <TableCell sx={cellStyle}>{cliente.id}</TableCell>
                    <TableCell sx={cellStyle}>{cliente.nombre}</TableCell>
                    <TableCell sx={cellStyle}>{cliente.identificacion}</TableCell>
                    <TableCell sx={cellStyle}>{cliente.estado}</TableCell>
                    <TableCell sx={cellStyle}>{cliente.segmento}</TableCell>
                    <TableCell sx={cellStyle}>{cliente.tipoPersona}</TableCell>
                    <TableCell sx={cellStyle}>{cliente.nacionalidad ?? "N/A"}</TableCell>
                    <TableCell sx={cellStyle}>{cliente.residencia ?? "N/A"}</TableCell>
                    <TableCell sx={{ ...cellStyle, borderRight: 0 }}>
                      {cliente.fechaVenc ? cliente.fechaVenc.split("T")[0] : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Navegación subpáginas internas */}
        {clientes.length > pageSize && (
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
                &lt;  Anterior
              </Button>
              <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary', minWidth: 150, textAlign: 'center' }}>
                Páginas: {subPageNum} / {Math.ceil(clientes.length / pageSize)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubPageNext}
                disabled={subPageNum >= Math.ceil(clientes.length / pageSize)}
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
    </Box>
  );
}

export default ConsultaClientes;