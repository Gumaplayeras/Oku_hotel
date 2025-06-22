import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Grid, CircularProgress } from '@mui/material';
import { getTotalEquipos, getTotalSims, getTotalEmpleados, getTotalIncidencias } from '../api/dashboard';
import CountUp from 'react-countup';

const Dashboard = () => {
  const [equipos, setEquipos] = useState(null);
  const [sims, setSims] = useState(null);
  const [empleados, setEmpleados] = useState(null);
  const [incidencias, setIncidencias] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const equiposTotal = await getTotalEquipos();
        const simsTotal = await getTotalSims();
        const empleadosTotal = await getTotalEmpleados();
        const incidenciasTotal = await getTotalIncidencias();

        setEquipos(equiposTotal);
        setSims(simsTotal);
        setEmpleados(empleadosTotal);
        setIncidencias(incidenciasTotal);
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      }
    };

    fetchData();
  }, []);

  const renderCard = (title, value) => (
    <Paper sx={{ p: 3, backgroundColor: '#1e1e1e', color: '#fff', borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{ color: '#aaa', mb: 1 }}>{title}</Typography>
      {value === null ? (
        <CircularProgress color="secondary" />
      ) : (
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
          <CountUp end={value || 0} duration={1.5} separator="," />
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" gutterBottom sx={{ color: '#fff', fontWeight: 'bold' }}>
          IT Dashboard
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ color: '#bbb' }}>
          Plataforma de Gestión IT
        </Typography>

        <Typography variant="body1" gutterBottom sx={{ color: '#888', mb: 4 }}>
          BORJA SE VA A VOLVER LOCO CADA VEZ QUE NO FUNCIONE LA RED 😅
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            {renderCard('Total Equipos', equipos)}
          </Grid>

          <Grid item xs={12} md={3}>
            {renderCard('Total SIMs', sims)}
          </Grid>

          <Grid item xs={12} md={3}>
            {renderCard('Incidencias Abiertas', incidencias)}
          </Grid>

          <Grid item xs={12} md={3}>
            {renderCard('Empleados', empleados)}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;