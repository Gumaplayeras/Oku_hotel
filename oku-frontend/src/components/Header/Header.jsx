import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth'; // Revisa tu ruta
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar 
      position="static" 
      elevation={0} 
      sx={{ 
        backgroundColor: 'background.paper', 
        borderBottom: '1px solid',
        borderColor: 'divider' 
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onToggleSidebar} // Llama a la función del Layout
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Oku IT Manager
        </Typography>

        <Button 
          variant="outlined"
          color="primary"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}