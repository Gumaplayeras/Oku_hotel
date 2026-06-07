import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';
import TopBar from '../Header/Header';
import { T } from '../../theme/theme';

export default function MainLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', height: '100vh', background: T.bg, overflow: 'hidden' }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar />
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: { xs: 3, md: 3.5 },
            background: T.bg,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
