import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth';  // <-- Aquí la ruta depende de dónde esté tu Header.jsx
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#222' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Oku IT Manager
        </Typography>
        <Button color="inherit" onClick={handleLogout}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
}