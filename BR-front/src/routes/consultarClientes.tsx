import { useEffect, useState } from "react";
//import axios from "axios"; //
import FiltrosClientes from "../components/FiltrosClientes";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, Divider, TablePagination } from "@mui/material";
import { TextField, Button } from "@mui/material";

/** Interface para Clientes */
interface Cliente {
  id: number;
  nombre: string;
  cedula: string;
  estado: string;
  segmento: string;
  categoria: string;
  tipoPersona: string;
  fechaVenc: string;
}

/** Componente Principal */
function ConsultaClientes() {
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cedulaBusqueda, setCedulaBusqueda] = useState("");

  /**  Cargar clientes desde la API al montar */
useEffect(() => {
  fetch("http://localhost:5000/api/clientes")
    .then(response => response.json())
    .then(data => setClientesFiltrados(data))
    .catch(error => console.error("❌ Error al obtener clientes:", error));
}, []);

  /**  Filtrar clientes desde la API */
const handleFilterChange = (filtros: { estado: string; segmento: string; categoria: string; tipoPersona: string }) => {
  const queryParams = new URLSearchParams(filtros).toString();

  fetch(`http://localhost:5000/api/clientes?${queryParams}`)
    .then(response => response.json())
    .then(data => setClientesFiltrados(data))
    .catch(error => console.error("❌ Error al filtrar clientes:", error));

  setPage(0);
};

  /**  Búsqueda por cédula desde la API */
const handleBuscarPorCedula = () => {
  const url = cedulaBusqueda ? `http://localhost:5000/api/clientes/${cedulaBusqueda}` : "http://localhost:5000/api/clientes";

  fetch(url)
    .then(response => response.json())
    .then(data => setClientesFiltrados(Array.isArray(data) ? data : [data])) // Asegura que sea un array
    .catch(error => console.error("❌ Error en la búsqueda por cédula:", error));

  setPage(0);
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


        {/* 🔹 Filtros */}
        <Box sx={{ mb: 3 }}>
          <FiltrosClientes onFilter={handleFilterChange} />
        </Box>

        <Divider sx={{ my: 2 }} />

                {/* 🔹 Barra de búsqueda por cédula */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Buscar por Cédula"
            variant="outlined"
            value={cedulaBusqueda}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCedulaBusqueda(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleBuscarPorCedula}>
            Consultar
          </Button>
        </Box>

        {/* Contenedor con Scroll */}
        <Box sx={{ maxHeight: rowsPerPage > 10 ? "500px" : "none", overflowY: rowsPerPage > 10 ? "auto" : "hidden" }}>
          <TableContainer component={Paper} sx={{ boxShadow: 1, borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#002f6c" }}>
                <TableRow>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ID</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Nombre</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Cédula/RNC</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Estado</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Segmento</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Riesgo</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Tipo de Persona</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Fecha de vencimiento</TableCell>
                </TableRow>
              </TableHead>
             <TableBody>
                {clientesFiltrados.slice(page * rowsPerPage, Math.min(clientesFiltrados.length, (page + 1) * rowsPerPage)).map((cliente, index) => (
                  <TableRow key={`${cliente.id}-${index}`} hover>
                    <TableCell>{cliente.id}</TableCell>
                    <TableCell>{cliente.nombre}</TableCell>
                    <TableCell>{cliente.cedula}</TableCell>
                    <TableCell>{cliente.estado}</TableCell>
                    <TableCell>{cliente.segmento}</TableCell>
                    <TableCell>{cliente.categoria}</TableCell>
                    <TableCell>{cliente.tipoPersona}</TableCell>
                    <TableCell>{cliente.fechaVenc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* 🔹 Paginación */}
        <TablePagination
          rowsPerPageOptions={[10, 15, 20]}
          component="div"
          count={clientesFiltrados.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
          labelRowsPerPage="Filas por página:"
          sx={{
            mt: 3,
            "& .MuiTablePagination-actions": { mx: 5 },
            "& .MuiTablePagination-root": { fontSize: "1.2rem" }
          }}
        />
      </Paper>
    </Box>
  );
}

export default ConsultaClientes;