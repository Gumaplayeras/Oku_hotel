import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import Header from '../Header/Header';

export default function Layout({ children }) {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh', 
      background: `
        linear-gradient(135deg, #0f1117 0%, #1a1d29 50%, #0f1117 100%)
      `,
      color: '#ffffff',
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      position: 'relative',
    }}>
      <CssBaseline />
      <Header />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          overflowY: 'auto',
          position: 'relative',
          zIndex: 2,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
          }
        }}
      >
        {children}
      </Box>
    </Box>
  );
}