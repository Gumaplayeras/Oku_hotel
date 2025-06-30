import React, { useEffect, useState } from 'react';
import {
  Typography, Container, Grid, Card, CardContent, CardActions,
  Chip, Button, CircularProgress, Box, Alert, Divider, useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PowerSettingsNew as PowerIcon,
  Router as SwitchIcon,
  LocationOn as LocationIcon,
  Business as BuildingIcon,
  Lan as NetworkIcon,
  SettingsEthernet as PortsIcon,
  Memory as MemoryIcon,
  Update as FirmwareIcon
} from '@mui/icons-material';
import { getSwitches, reiniciarSwitch } from '../api/switches';

const Redes = () => {
  const theme = useTheme();
  const [switches, setSwitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState({});

  useEffect(() => {
    const fetchSwitches = async () => {
      try {
        const data = await getSwitches();
        setSwitches(data);
      } catch (error) {
        alert("❌ Error al obtener los switches.");
      } finally {
        setLoading(false);
      }
    };

    fetchSwitches();
  }, []);

  const handleReiniciar = async (id) => {
    setRestarting(prev => ({ ...prev, [id]: true }));
    try {
      const response = await reiniciarSwitch(id);
      if (response.message) {
        alert(`✅ ${response.message}`);
      } else if (response.error) {
        alert(`❌ Error reiniciando: ${response.error}`);
      } else {
        alert("❌ Error reiniciando: respuesta inesperada del servidor");
      }
    } catch (error) {
      const mensajeError = error.response?.data?.error || error.message || "Error desconocido";
      alert(`❌ Error reiniciando: ${mensajeError}`);
    } finally {
      setRestarting(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleReiniciarTodos = async () => {
    if (window.confirm('¿Estás seguro de reiniciar TODOS los switches?')) {
      for (const sw of switches) {
        await handleReiniciar(sw.id);
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await getSwitches();
      setSwitches(data);
    } catch (error) {
      alert("❌ Error al actualizar los switches.");
    } finally {
      setLoading(false);
    }
  };

  // Estilo para las tarjetas
  const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: theme.shadows[6],
      borderLeft: `4px solid ${theme.palette.secondary.main}`
    }
  };

  // Estilo para los botones de acción
  const actionButtonStyle = {
    minWidth: { xs: '100%', sm: 'auto' },
    flexGrow: { xs: 1, sm: 0 }
  };

  return (
    <Container maxWidth="xl" sx={{ 
      mt: 4, 
      mb: 4,
      transition: 'margin 0.3s ease',
      marginLeft: { sm: '240px' } // Ajuste para el sidebar
    }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 4
      }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <SwitchIcon fontSize="large" color="primary" /> Gestión de Red
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitoreo y administración de switches
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          width: { xs: '100%', sm: 'auto' },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={actionButtonStyle}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<PowerIcon />}
            onClick={handleReiniciarTodos}
            disabled={loading || switches.length === 0}
            sx={actionButtonStyle}
          >
            Reiniciar todos
          </Button>
        </Box>
      </Box>

      {/* Content Section */}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '50vh'
        }}>
          <CircularProgress size={80} thickness={4} />
        </Box>
      ) : (
        <>
          {switches.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No hay switches registrados en el sistema.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {switches.map((sw) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={sw.id}>
                  <Card sx={cardStyle}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Card Header */}
                      <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                        gap: 1
                      }}>
                        <Typography variant="h6" component="h2" sx={{ 
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {sw.nombre}
                        </Typography>
                        <Chip 
                          label={sw.marca} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                          sx={{ 
                            fontWeight: 500,
                            borderWidth: '2px'
                          }}
                        />
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      {/* Card Details */}
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        mt: 2
                      }}>
                        <DetailItem 
                          icon={<NetworkIcon color="primary" />} 
                          label="IP" 
                          value={sw.ip} 
                        />
                        
                        <DetailItem 
                          icon={<BuildingIcon color="primary" />} 
                          label="Planta" 
                          value={sw.planta} 
                        />
                        
                        <DetailItem 
                          icon={<LocationIcon color="primary" />} 
                          label="Ubicación" 
                          value={sw.lugar} 
                        />
                        
                        {/* Additional details - puedes personalizar con datos reales */}
                        <Box sx={{ 
                          display: 'flex',
                          gap: 2,
                          mt: 1
                        }}>
                          <Chip 
                            icon={<PortsIcon />} 
                            label="24 Puertos" 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            icon={<MemoryIcon />} 
                            label="1GB RAM" 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </CardContent>
                    
                    {/* Card Actions */}
                    <CardActions sx={{ 
                      justifyContent: 'flex-end',
                      p: 2,
                      pt: 0
                    }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={!restarting[sw.id] && <PowerIcon />}
                        onClick={() => handleReiniciar(sw.id)}
                        disabled={restarting[sw.id]}
                        sx={{ 
                          minWidth: 120,
                          '& .MuiButton-startIcon': {
                            mr: restarting[sw.id] ? 0 : 1
                          }
                        }}
                      >
                        {restarting[sw.id] ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          'Reiniciar'
                        )}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
};

// Componente auxiliar para los detalles
const DetailItem = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: '50%',
      bgcolor: 'action.hover'
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
        {value || 'N/A'}
      </Typography>
    </Box>
  </Box>
);

export default Redes;