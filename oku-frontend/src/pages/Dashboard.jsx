import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Grid, CircularProgress, Icon } from '@mui/material';
import { getTotalEquipos, getTotalSims, getTotalEmpleados, getTotalIncidencias } from '../api/dashboard';
import CountUp from 'react-countup';

import DevicesIcon from '@mui/icons-material/Devices';
import SimCardIcon from '@mui/icons-material/SimCard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';

const Dashboard = () => {
  // La lógica de estado y useEffect permanece igual...
  const [equipos, setEquipos] = useState(null);
  const [sims, setSims] = useState(null);
  const [empleados, setEmpleados] = useState(null);
  const [incidencias, setIncidencias] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equiposTotal, simsTotal, empleadosTotal, incidenciasTotal] = await Promise.all([
          getTotalEquipos(), getTotalSims(), getTotalEmpleados(), getTotalIncidencias()
        ]);
        setEquipos(equiposTotal); setSims(simsTotal); setEmpleados(empleadosTotal); setIncidencias(incidenciasTotal);
      } catch (error) { console.error('Error cargando datos del dashboard:', error); }
    };
    fetchData();
  }, []);

  // NOTA: 'theme.palette.primary.main' viene directamente de tu theme.js
  const renderCard = (title, value, icon, iconBgColor) => (
    <Paper elevation={0} sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
        {value === null ? (
          <CircularProgress color="primary" size={24} sx={{ mt: 1 }} />
        ) : (
          <Typography variant="h3" sx={{ color: 'text.primary' }}>
            <CountUp end={value || 0} duration={1.5} separator="," />
          </Typography>
        )}
      </Box>
      <Box sx={{
        width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', backgroundColor: iconBgColor, color: '#fff'
      }}>
        {icon}
      </Box>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="h6" gutterBottom color="text.secondary">
        Resumen general de la plataforma de gestión IT.
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* CAMBIO CLAVE: Los colores de los iconos ahora se leen de tu tema */}
        <Grid item xs={12} sm={6} md={3}>
          {renderCard('Total Equipos', equipos, <DevicesIcon />, (theme) => theme.palette.primary.main)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderCard('Total SIMs', sims, <SimCardIcon />, (theme) => theme.palette.secondary.main)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderCard('Incidencias', incidencias, <AssignmentIcon />, (theme) => theme.palette.secondary.main)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderCard('Empleados', empleados, <PeopleIcon />, (theme) => theme.palette.primary.main)}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;