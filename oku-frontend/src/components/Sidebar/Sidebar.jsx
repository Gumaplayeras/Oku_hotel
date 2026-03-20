import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Typography, alpha, useTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DevicesIcon from '@mui/icons-material/Devices';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import { NavLink } from 'react-router-dom';
import LanIcon from '@mui/icons-material/Lan';

const Sidebar = ({ isOpen }) => {
  const drawerWidth = 260;
  const theme = useTheme(); // <-- Obtén el objeto del tema

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Equipos', icon: <DevicesIcon />, path: '/equipos' },
    { text: 'Empleados', icon: <PeopleIcon />, path: '/empleados' },
    { text: 'Partes', icon: <DescriptionIcon />, path: '/partes' },
    { text: 'Redes', icon: <LanIcon />, path: '/redes' },
  ];

  const navLinkBaseStyle = {
    textDecoration: 'none',
    color: 'inherit',
  };

  return (
    <Drawer
      variant="permanent"
      open={isOpen}
      sx={{
        width: isOpen ? drawerWidth : (theme) => theme.spacing(9),
        flexShrink: 0,
        whiteSpace: 'nowrap',
        transition: (theme) => theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: isOpen ? drawerWidth : (theme) => theme.spacing(9),
          overflowX: 'hidden',
          borderRight: 'none',
          backgroundColor: theme.palette.background.paper, // Acceso directo al tema
          boxShadow: theme.shadows[3], // Acceso directo al tema
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        },
      }}
    >
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Typography
          variant="h5"
          sx={{
            color: 'primary.main',
            fontWeight: 'bold',
            transition: '0.3s',
            textShadow: '0px 0px 4px rgba(0, 168, 168, 0.4)',
          }}
        >
           {isOpen ? 'OKU' : 'O'}
        </Typography>
      </Toolbar>
      <Box sx={{ px: isOpen ? 2 : 1.5, transition: '0.3s' }}>
        <List>
          {menuItems.map(item => (
            <NavLink to={item.path} key={item.text} style={navLinkBaseStyle}>
              {({ isActive }) => (
                <ListItemButton
                  sx={{
                    mb: 1,
                    py: 1.2,
                    borderRadius: 2,
                    backgroundColor: isActive
                      ? alpha(theme.palette.primary.main, 0.12) // Acceso directo al color del tema
                      : 'transparent',
                    '&:hover': {
                        backgroundColor: isActive
                            ? alpha(theme.palette.primary.main, 0.2) // Acceso directo al color del tema
                            : alpha(theme.palette.text.secondary, 0.08), // Acceso directo al color del tema
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 'auto',
                      mr: isOpen ? 2 : 'auto',
                      justifyContent: 'center',
                      color: isActive ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: isOpen ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out',
                      color: isActive ? '#FFFFFF' : 'text.primary',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              )}
            </NavLink>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;