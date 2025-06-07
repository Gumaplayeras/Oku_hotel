import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DevicesIcon from '@mui/icons-material/Devices';
import SimCardIcon from '@mui/icons-material/SimCard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { NavLink } from 'react-router-dom';
import MoveDownIcon from '@mui/icons-material/MoveDown';

const Sidebar = () => {
  const drawerWidth = 240;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Equipos', icon: <DevicesIcon />, path: '/equipos' },
    { text: 'SIMs', icon: <SimCardIcon />, path: '/sims' },
    { text: 'Empleados', icon: <PeopleIcon />, path: '/empleados' },
    { text: 'Incidencias', icon: <AssignmentIcon />, path: '/incidencias' },
    { text: 'Movimientos', icon: <MoveDownIcon />, path: '/movimientos' }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#1e1e1e', color: '#fff' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map(item => (
            <NavLink 
              to={item.path} 
              key={item.text} 
              style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? '#4caf50' : '#fff',
                backgroundColor: isActive ? '#333' : 'transparent',
                borderRadius: 8,
                margin: 4,
                display: 'block'
              })}
            >
              <ListItemButton>
                <ListItemIcon sx={{ color: isActive => (isActive ? '#4caf50' : '#fff') }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </NavLink>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;