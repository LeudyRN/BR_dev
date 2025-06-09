import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ConsultaClientes from "./routes/consultarClientes";
import CambioSegmento from "./routes/cambioSegmento";
import ActualizarBuro from "./routes/actualizarBuro";
import CambioCategoriaRiesgo from "./routes/cambiarCategoriaRiesgo";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ConsultaClientes />} />
        <Route path="/cambiar-segmento" element={<CambioSegmento />} />
        <Route path="/actualizar-buro" element={<ActualizarBuro />} />
        <Route path="/cambiar-riesgo" element={<CambioCategoriaRiesgo />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;