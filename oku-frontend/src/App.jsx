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
import Redes from "./pages/Redes";
import SwitchDetail from "./pages/SwitchDetail";
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

        <Route
          path="/movimientos"
          element={
            <PrivateRoute>
              <MainLayout>
                <Movimientos />
              </MainLayout>
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

        {/* Detalle Switch */}
        <Route
          path="/redes/switches/:ip"
          element={
            <PrivateRoute>
              <MainLayout>
                <SwitchDetail />
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

        <Route path="/dashboard" element={<PrivateRoute><MainLayout><Dashboard /></MainLayout></PrivateRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;