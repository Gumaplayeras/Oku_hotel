import { Box, Toolbar } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Equipos from './pages/Equipos';
import Empleados from './pages/Empleados';
import Partes from './pages/Partes';
import ParteForm from './pages/ParteForm';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/Layout/MainLayout';
import Movimientos from './pages/Movimientos';
import Sidebar from './components/Sidebar/Sidebar';
import Redes from "./pages/Redes";
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* Equipos */}
        <Route
          path="/equipos"
          element={
            <PrivateRoute>
              <MainLayout>
                <Equipos />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* Empleados */}
        <Route
          path="/empleados"
          element={
            <PrivateRoute>
              <MainLayout>
                <Empleados />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* Partes - lista */}
        <Route
          path="/partes"
          element={
            <PrivateRoute>
              <MainLayout>
                <Partes />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* Partes - nuevo parte de entrega */}
        <Route
          path="/partes/nuevo"
          element={
            <PrivateRoute>
              <ParteForm />
            </PrivateRoute>
          }
        />

        {/* Partes - editar/ver parte existente */}
        <Route
          path="/partes/:id"
          element={
            <PrivateRoute>
              <ParteForm />
            </PrivateRoute>
          }
        />

        {/* Movimientos: usa layout especial con Sidebar */}
        <Route
          path="/movimientos"
          element={
            <PrivateRoute>
              <Box sx={{ display: 'flex' }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                  <Toolbar />
                  <Movimientos />
                </Box>
              </Box>
            </PrivateRoute>
          }
        />

        {/* Redes */}
        <Route
          path="/redes"
          element={
            <PrivateRoute>
              <MainLayout>
                <Redes />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* Perfil del usuario (protegido y con layout) */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* Gestión de usuarios */}
        <Route
          path="/users/manage"
          element={
            <PrivateRoute>
              <MainLayout>
                <UserManagement />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;