// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState } from "react";
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

/** Lista original de clientes prueba*/
const clientesMock: Cliente[] = [
  { id: 1, nombre: "Juan Pérez", cedula: "22222220", estado: "activo", segmento: "1", categoria: "bajo", tipoPersona: "fisica", fechaVenc: "12/febrero/2026" },
  { id: 2, nombre: "Ana Gómez", cedula: "22222220", estado: "inactivo", segmento: "2", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2028" },
  { id: 3, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 4, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 5, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 6, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 7, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 8, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 9, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 10, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 11, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 12, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 13, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 14, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 15, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 16, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 17, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 18, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 19, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 20, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 21, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 22, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 23, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 24, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 25, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 26, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 27, nombre: "Carlos López", cedula: "22222220", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
  { id: 28, nombre: "Carlos López", cedula: "323232332312", estado: "activo", segmento: "7", categoria: "alto", tipoPersona: "empresa", fechaVenc: "12/febrero/2036" },
];

/** Componente Principal */
function ConsultaClientes() {
  const [clientesFiltrados, setClientesFiltrados] = useState(clientesMock);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cedulaBusqueda, setCedulaBusqueda] = useState(""); // 👈 Estado para la cédula ingresada

  /** 🚀 Filtrar clientes */
  const handleFilterChange = (filtros: { estado: string; segmento: string; categoria: string; tipoPersona: string }) => {
    const filtrados = clientesMock.filter(
      (cliente) =>
        (filtros.estado === "" || cliente.estado === filtros.estado) &&
        (filtros.segmento === "" || cliente.segmento === filtros.segmento) &&
        (filtros.categoria === "" || cliente.categoria === filtros.categoria) &&
        (filtros.tipoPersona === "" || cliente.tipoPersona === filtros.tipoPersona)
    );

    // Si hay una cédula ingresada, filtramos por ella
    const resultadoFinal = cedulaBusqueda ? filtrados.filter((cliente) => cliente.cedula === cedulaBusqueda) : filtrados;

    setClientesFiltrados(resultadoFinal);
    setPage(0);
  };

  /** 🚀 Búsqueda por cédula */
  const handleBuscarPorCedula = () => {
    if (cedulaBusqueda === "") {
      setClientesFiltrados(clientesMock);
    } else {
      const resultado = clientesMock.filter((cliente) => cliente.cedula === cedulaBusqueda);
      setClientesFiltrados(resultado);
    }
    setPage(0);
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#f5f6fa", height: "90vh", width: "1200px" }}>
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
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Cédula</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Estado</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Segmento</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Riesgo</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Tipo de Persona</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Fecha de vencimiento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientesFiltrados.slice(page * rowsPerPage, Math.min(clientesFiltrados.length, (page + 1) * rowsPerPage)).map((cliente) => (
                  <TableRow key={cliente.id} hover>
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