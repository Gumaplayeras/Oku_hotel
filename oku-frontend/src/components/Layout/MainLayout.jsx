import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar'; // Asegúrate que la ruta sea correcta
import Header from '../Header/Header';   // Asegúrate que la ruta sea correcta

export default function Layout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    // CONTENEDOR PRINCIPAL - Flexbox
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      
      {/* SIDEBAR - Recibe el estado 'isOpen' */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* CONTENEDOR DERECHO (Header + Contenido) */}
      <Box 
        component="div"
        sx={{
          flexGrow: 1, // Permite que esta caja ocupe el resto del espacio
          display: 'flex',
          flexDirection: 'column',
          width: '100%', // Necesario para que el flexbox funcione bien
        }}
      >
        {/* HEADER - Recibe la función para cambiar el estado */}
        <Header onToggleSidebar={toggleSidebar} />
        
        {/* ÁREA DE CONTENIDO PRINCIPAL (donde va el Dashboard, etc.) */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, // Ocupa el espacio vertical restante
            p: { xs: 2, sm: 3 }, // Padding adaptable
            overflowY: 'auto', // Permite scroll si el contenido es muy largo
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}