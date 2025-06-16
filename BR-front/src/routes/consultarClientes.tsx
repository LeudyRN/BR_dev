import { useEffect, useState, useCallback } from "react";
import FiltrosClientes from "../components/FiltrosClientes";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, Divider, TablePagination, Button as MuiButton } from "@mui/material"; // Removed ButtonGroup as it's not used directly here
import { TextField, Button } from "@mui/material";

/** Interface para Clientes */
interface Cliente {
  id: number;
  nombre: string;
  cedula: string;
  identificacion?: string;
  estado: string;
  segmento: string;
  tipoPersona: string;
  fechaVenc: string;
  originalSortID?: string;
}

/** Interfaz para la clave del último elemento (Keyset Pagination) */
interface LastItemKey {
  lastIdentificacion: string;
  lastOriginalSortID: string;
}

/** Interfaz para los filtros */
interface Filters {
  estado: string;
  segmento: string;
  tipoPersona: string;
}

/** Interfaz para la respuesta de la API de paginación Keyset */
interface ApiResponse {
  clientes: Cliente[];
  totalCount: number;
  hasNextPage: boolean;
  lastItemKey: LastItemKey | null;
}

/** Componente Principal */
function ConsultaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [cedulaBusqueda, setCedulaBusqueda] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<Filters>({ estado: "", segmento: "", tipoPersona: "" });

  // Keyset Pagination specific states
  // pageKeys[0] is null (for page 1). pageKeys[i] is the lastItemKey needed to fetch page (i+1).
  const [pageKeys, setPageKeys] = useState<(LastItemKey | null)[]>([null]);
  const [currentPageNum, setCurrentPageNum] = useState(1); // 1-based current page number

  /** Cargar clientes desde la API usando Keyset Pagination y filtros */
  const fetchClientsData = useCallback(async (
    keyToFetchWith: LastItemKey | null, // The key from the END of the PREVIOUS page
    currentLimit: number,
    filters: Filters
  ) => {
    try {
      let url = `http://localhost:5000/api/ConsultaCliente?limit=${currentLimit}`;

      if (keyToFetchWith) {
        url += `&lastIdentificacion=${keyToFetchWith.lastIdentificacion}&lastOriginalSortID=${keyToFetchWith.lastOriginalSortID}`;
      }
      if (filters.estado) url += `&estado=${filters.estado}`;
      if (filters.segmento) url += `&segmento=${filters.segmento}`;
      if (filters.tipoPersona) url += `&tipoPersona=${filters.tipoPersona}`;


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
        originalSortID: item.originalSortID ?? "0"
      }));

      setClientes(clientesMapeados);
      setTotalCount(data.totalCount || 0);
      setHasNextPage(data.hasNextPage);
      
      // Return the new lastItemKey to be handled by the calling useEffect
      return data.lastItemKey;

    } catch (error) {
      console.error("❌ Error al obtener clientes:", error);
      setClientes([]); // Clear clients on error
      setTotalCount(0);
      setHasNextPage(false);
      return null; // Return null if fetch fails
      // Optional: Show an error message to the user
    }
  }, []); // Empty dependencies for useCallback means it doesn't change unless its definition changes.
           // This function will be called with explicit arguments.

  // Primary effect to trigger data loading
  useEffect(() => {
    const fetchPage = async () => {
        // Only fetch if not in search mode
        if (cedulaBusqueda.trim() === "") {
            // Get the key for the current page from pageKeys array
            const keyToUse = pageKeys[currentPageNum - 1]; // currentPageNum is 1-based, array index is 0-based
            const nextKey = await fetchClientsData(keyToUse, limit, currentFilters);

            // Update pageKeys if we've successfully loaded a new page
            // and we are at the end of our current pageKeys history (navigating forward)
            if (nextKey && currentPageNum === pageKeys.length) {
                setPageKeys(prev => [...prev, nextKey]);
            }
        }
    };
    fetchPage();
  }, [limit, currentFilters, cedulaBusqueda, currentPageNum, pageKeys, fetchClientsData]);


  // Manejar el cambio de filas por página (limit)
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setLimit(newLimit);
    setCurrentPageNum(1); // Reset to the first visual page
    setPageKeys([null]); // Reset Keyset pagination history
  };

  // Manejar la navegación a la siguiente página
  const handleNextPage = () => {
    if (hasNextPage) { // We have a next page confirmed by API
      setCurrentPageNum(prev => prev + 1);
      // useEffect will trigger fetchClientsData based on currentPageNum change
    }
  };

  // Manejar la navegación a la página anterior (más complejo con Keyset Pagination)
  const handlePrevPage = () => {
    if (currentPageNum > 1) { // Ensure we are not on the first page
      setCurrentPageNum(prev => prev - 1);
      // We need to slice off the "future" keys if the user navigates back and then forward again
      // The useEffect will handle fetching the correct page based on the new currentPageNum
      setPageKeys(prev => prev.slice(0, currentPageNum - 1));
    }
  };


  /** Manejar el cambio de filtros y reiniciar la paginación */
  const handleFilterChange = (newFilters: Filters) => {
    setCurrentFilters(newFilters); // Update active filters
    // Reset pagination to apply filters from the first page
    setCurrentPageNum(1);
    setPageKeys([null]); // Reset Keyset pagination history
    // fetchClientsData will be triggered by useEffect due to 'currentFilters' dependency
  };

  /** Búsqueda por cédula desde la API (sin Keyset, usa ruta dedicada) */
  const handleBuscarPorCedula = () => {
    const url = cedulaBusqueda
      ? `http://localhost:5000/api/ConsultaCliente/${cedulaBusqueda}`
      : `http://localhost:5000/api/ConsultaCliente?limit=${limit}`; // When clearing search, revert to general list's first page

    fetch(url)
      .then(response => response.json())
      .then((data: Cliente | Cliente[] | ApiResponse) => {
        let clientesArray: Cliente[] = [];
        let fetchedTotalCount = 0;

        if (Array.isArray(data)) {
          clientesArray = data;
          fetchedTotalCount = data.length;
        } else if ('clientes' in data && 'totalCount' in data) {
          clientesArray = (data as ApiResponse).clientes;
          fetchedTotalCount = (data as ApiResponse).totalCount || 0;
        } else {
          clientesArray = [data as Cliente];
          fetchedTotalCount = 1;
        }

        setClientes(clientesArray);
        setTotalCount(fetchedTotalCount);
        // Reset Keyset Pagination states when doing a search
        setCurrentPageNum(1);
        setPageKeys([null]);
        setHasNextPage(false); // Search results usually don't have next page logic unless explicitly handled
        setCurrentFilters({ estado: "", segmento: "", tipoPersona: "" }); // Clear filters when searching by cedula
      })
      .catch(error => console.error("❌ Error en la búsqueda por cédula:", error));
  };


  return (
    <Box sx={{
      minHeight: "90vh",
      marginTop: "30px",
      p: 1,
      backgroundColor: "background.default",
      width: "1200px",
      marginLeft: "50vh"
    }}>

      <Paper elevation={3} sx={{ maxWidth: 1200, mx: "auto", p: 4, borderRadius: 4 }}>
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
                // If search is cleared, reset to initial Keyset pagination and clear filters
                setCurrentPageNum(1);
                setPageKeys([null]);
                setHasNextPage(false);
                setCurrentFilters({ estado: "", segmento: "", tipoPersona: "" }); // Clear filters
              }
            }}
          />
          <Button variant="contained" color="primary" onClick={handleBuscarPorCedula}>
            Consultar
          </Button>
        </Box>

        <Box sx={{ maxHeight: limit > 10 ? "500px" : "none", overflowY: limit > 10 ? "auto" : "hidden" }}>
          <TableContainer component={Paper} sx={{ boxShadow: 1, borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#002f6c" }}>
                <TableRow>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ID</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Nombre</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Cédula/RNC</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Estado</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Segmento</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Tipo de Persona</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Fecha de vencimiento</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {clientes.map((cliente, index) => (
                  <TableRow key={`${cliente.identificacion}-${cliente.originalSortID}-${index}`} hover>
                    <TableCell>{cliente.id}</TableCell>
                    <TableCell>{cliente.nombre}</TableCell>
                    <TableCell>{cliente.cedula}</TableCell>
                    <TableCell>{cliente.estado}</TableCell>
                    <TableCell>{cliente.segmento}</TableCell>
                    <TableCell>{cliente.tipoPersona}</TableCell>
                    <TableCell>{cliente.fechaVenc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>

            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2 }}>
          <MuiButton
            variant="contained"
            onClick={handlePrevPage}
            disabled={currentPageNum === 1}
          >
            Anterior
          </MuiButton>
          <Typography>Página: {currentPageNum}</Typography>
          <MuiButton
            variant="contained"
            onClick={handleNextPage}
            disabled={!hasNextPage}
          >
            Siguiente
          </MuiButton>
        </Box>

        <TablePagination
          rowsPerPageOptions={[10, 15, 20]}
          component="div"
          count={totalCount}
          rowsPerPage={limit}
          page={currentPageNum - 1} // TablePagination expects page 0-based
          onPageChange={() => {}} // Empty to satisfy TypeScript, as navigation is controlled by custom buttons
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          sx={{
            mt: 1,
            "& .MuiTablePagination-actions": { display: 'none' }, // Hide MUI's default pagination arrows and numbers
            "& .MuiTablePagination-toolbar": { justifyContent: 'center' },
            "& .MuiTablePagination-root": { fontSize: "1.2rem" }
          }}
        />

      </Paper>
    </Box>
  );
}

export default ConsultaClientes;