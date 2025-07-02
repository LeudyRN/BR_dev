import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, Container } from "@mui/material";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import theme from "./routes/theme";
import ConsultaClientes from "./routes/consultarClientes";
import CambioSegmento from "./routes/cambioSegmento";
import ActualizarBuro from "./routes/actualizarBuro";
import CambioCategoriaRiesgo from "./routes/cambiarCategoriaRiesgo";
import Portafolio from "./routes/ConsultarPortafolio";
import logo from "./assets/logo.png";
import "./App.css";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Router>
        {/* Header con Logo y Título mejorado */}
        <AppBar position="fixed">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            {/* 🔹 Logo de Banreservas con mejor espaciado */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, minHeight: "80px" }}>
                <img src={logo} alt="Banreservas" style={{ height: "50px", filter: "invert(100%) saturate(0) brightness(200%)" }} />

                {/* Línea divisora */}
                <Box sx={{ width: "2px", height: "50px", backgroundColor: "white", marginX: 2 }} />

                <Typography variant="h5" sx={{ fontWeight: "bold", color: "white", marginTop: "10px" }}>
                  Gestión de Clientes
                </Typography>
              </Box>

            {/*  Menú de Navegación con botones más estilizados */}
            <nav style={{ display: "flex", gap: "30px" }}>
              <Link to="/"><Button color="inherit" sx={{ fontSize: "16px", fontWeight: "bold", color: "white" }}>CLIENTES</Button></Link>
              <Link to="/cambiar-segmento"><Button color="inherit" sx={{ fontSize: "16px", fontWeight: "bold", color: "white" }}>SEGMENTO</Button></Link>
              <Link to="/actualizar-buro"><Button color="inherit" sx={{ fontSize: "16px", fontWeight: "bold", color: "white" }}>BURO</Button></Link>
              <Link to="/cambiar-riesgo"><Button color="inherit" sx={{ fontSize: "16px", fontWeight: "bold", color: "white" }}>CATEGORIA DE RIESGO</Button></Link>
              <Link to="/portafolio"><Button color="inherit" sx={{ fontSize: "16px", fontWeight: "bold", color: "white" }}>PORTAFOLIO</Button></Link>
            </nav>
          </Toolbar>
        </AppBar>

        {/*  Contenido principal con margen para evitar solapamiento del Header */}
        <Container sx={{ marginTop: 12 }}>
          <Routes>
            <Route path="/" element={<ConsultaClientes />} />
            <Route path="/cambiar-segmento" element={<CambioSegmento />} />
            <Route path="/actualizar-buro" element={<ActualizarBuro />} />
            <Route path="/cambiar-riesgo" element={<CambioCategoriaRiesgo />} />
            <Route path="/portafolio" element={<Portafolio />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;