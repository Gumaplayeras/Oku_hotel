import { Box, Toolbar } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Equipos from './pages/Equipos';
import Sims from './pages/Sims';
import Empleados from './pages/Empleados';
import Incidencias from './pages/Incidencias';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/Layout/MainLayout';
import Movimientos from './pages/Movimientos';
import Sidebar from './components/Sidebar/Sidebar';
import Redes from "./pages/Redes";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <PrivateRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        } />

        <Route path="/equipos" element={
          <PrivateRoute>
            <MainLayout>
              <Equipos />
            </MainLayout>
          </PrivateRoute>
        } />

        <Route path="/sims" element={
          <PrivateRoute>
            <MainLayout>
              <Sims />
            </MainLayout>
          </PrivateRoute>
        } />

        <Route path="/empleados" element={
          <PrivateRoute>
            <MainLayout>
              <Empleados />
            </MainLayout>
          </PrivateRoute>
        } />

        <Route path="/incidencias" element={
          <PrivateRoute>
            <MainLayout>
              <Incidencias />
            </MainLayout>
          </PrivateRoute>
        } />

        <Route path="/movimientos" element={
          <PrivateRoute>
            <Box sx={{ display: 'flex' }}>
              <Sidebar />
              <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Movimientos />
              </Box>
            </Box>
          </PrivateRoute>
        } />

        <Route path="/redes" element={
          <PrivateRoute>
            <MainLayout>
              <Redes />
            </MainLayout>
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;