import React, { useEffect, useState } from 'react';
import {
  Typography, Container, Grid, Card, CardContent, CardActions,
  Chip, Button, CircularProgress, Box, Alert, Divider, useTheme,
  Paper, Tooltip, IconButton, LinearProgress, Fade, Zoom
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PowerSettingsNew as PowerIcon,
  Router as SwitchIcon,
  LocationOn as LocationIcon,
  Lan as NetworkIcon,
  SettingsEthernet as PortsIcon,
  Memory as MemoryIcon,
  Update as FirmwareIcon,
  SignalWifi4Bar as SignalIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Apartment as BuildingIcon,
} from '@mui/icons-material';
import { getSwitches, reiniciarSwitch } from '../api/switches';

const Redes = () => {
  const theme = useTheme();
  const [switches, setSwitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState({});
  const [refreshing, setRefreshing] = useState(false);

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
      const switchIds = switches.map(sw => sw.id);
      
      // Reiniciar todos en paralelo con un pequeño delay entre cada uno
      const promises = switchIds.map((id, index) => 
        new Promise(resolve => {
          setTimeout(async () => {
            await handleReiniciar(id);
            resolve();
          }, index * 500); // 500ms de delay entre cada reinicio
        })
      );
      
      await Promise.all(promises);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getSwitches();
      setSwitches(data);
    } catch (error) {
      alert("❌ Error al actualizar los switches.");
    } finally {
      setRefreshing(false);
    }
  };

  // Función para determinar el estado del switch (simulado basado en datos disponibles)
  const getSwitchStatus = (sw) => {
    // Aquí puedes implementar lógica real basada en datos del switch
    const statuses = ['online', 'warning', 'offline'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    return randomStatus;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'offline': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckIcon />;
      case 'warning': return <WarningIcon />;
      case 'offline': return <ErrorIcon />;
      default: return <InfoIcon />;
    }
  };

  // Estilos mejorados
  const headerStyle = {
    background: `linear-gradient(135deg, 
      ${theme.palette.primary.main}15 0%, 
      ${theme.palette.secondary.main}15 100%)`,
    borderRadius: 4,
    p: 4,
    mb: 4,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(45deg, 
        ${theme.palette.primary.main}08 25%, 
        transparent 25%, 
        transparent 75%, 
        ${theme.palette.primary.main}08 75%), 
        linear-gradient(45deg, 
        ${theme.palette.primary.main}08 25%, 
        transparent 25%, 
        transparent 75%, 
        ${theme.palette.primary.main}08 75%)`,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px',
      opacity: 0.3
    }
  };

  const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    background: `linear-gradient(145deg, 
      ${theme.palette.background.paper} 0%, 
      ${theme.palette.action.hover} 100%)`,
    borderRadius: 3,
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    border: `1px solid ${theme.palette.divider}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: `linear-gradient(90deg, 
        ${theme.palette.primary.main}, 
        ${theme.palette.secondary.main})`,
      transform: 'scaleX(0)',
      transformOrigin: 'left',
      transition: 'transform 0.3s ease'
    },
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: `0 20px 40px ${theme.palette.action.hover}`,
      '&::before': {
        transform: 'scaleX(1)'
      }
    }
  };

  const statsCardsStyle = {
    display: 'flex',
    gap: 2,
    mb: 4,
    flexWrap: 'wrap'
  };

  // Estadísticas calculadas
  const totalSwitches = switches.length;
  const onlineSwitches = switches.filter(sw => getSwitchStatus(sw) === 'online').length;
  const warningSwitches = switches.filter(sw => getSwitchStatus(sw) === 'warning').length;
  const offlineSwitches = switches.filter(sw => getSwitchStatus(sw) === 'offline').length;

  return (
    <Container maxWidth="xl" sx={{ 
      mt: 4, 
      mb: 4,
      overflowX: 'hidden',
      transition: 'margin 0.3s ease',
    }}>
      {/* Header mejorado */}
      <Paper elevation={0} sx={headerStyle}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 3
          }}>
            <Box>
              <Typography variant="h3" component="h1" sx={{ 
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 1,
                background: `linear-gradient(45deg, 
                  ${theme.palette.primary.main}, 
                  ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                <Box sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: `linear-gradient(45deg, 
                    ${theme.palette.primary.main}20, 
                    ${theme.palette.secondary.main}20)`,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <SwitchIcon fontSize="large" />
                </Box>
                Centro de Control de Red
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'text.secondary',
                fontWeight: 400,
                ml: 1
              }}>
                Monitoreo en tiempo real y gestión avanzada de infraestructura
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
                size="large"
                startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading || refreshing}
                sx={{
                  borderWidth: 2,
                  fontWeight: 600,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </Button>
              <Button
                variant="contained"
                size="large"
                color="error"
                startIcon={<PowerIcon />}
                onClick={handleReiniciarTodos}
                disabled={loading || switches.length === 0}
                sx={{
                  fontWeight: 600,
                  boxShadow: `0 4px 12px ${theme.palette.error.main}40`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${theme.palette.error.main}60`
                  }
                }}
              >
                Reiniciar Todos
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tarjetas de estadísticas */}
      {!loading && switches.length > 0 && (
        <Fade in timeout={800}>
          <Box sx={statsCardsStyle}>
            <StatCard 
              title="Total"
              value={totalSwitches}
              icon={<SwitchIcon />}
              color={theme.palette.primary.main}
              subtitle="Switches registrados"
            />
            <StatCard 
              title="Online"
              value={onlineSwitches}
              icon={<CheckIcon />}
              color={theme.palette.success.main}
              subtitle="Funcionando correctamente"
            />
            <StatCard 
              title="Advertencias"
              value={warningSwitches}
              icon={<WarningIcon />}
              color={theme.palette.warning.main}
              subtitle="Requieren atención"
            />
            <StatCard 
              title="Offline"
              value={offlineSwitches}
              icon={<ErrorIcon />}
              color={theme.palette.error.main}
              subtitle="Sin conexión"
            />
          </Box>
        </Fade>
      )}

      {/* Barra de progreso para loading/refreshing */}
      {(loading || refreshing) && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress 
            sx={{
              height: 6,
              borderRadius: 3,
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(90deg, 
                  ${theme.palette.primary.main}, 
                  ${theme.palette.secondary.main})`
              }
            }}
          />
        </Box>
      )}

      {/* Contenido principal */}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '50vh',
          gap: 3
        }}>
          <CircularProgress 
            size={80} 
            thickness={4}
            sx={{
              '& .MuiCircularProgress-circle': {
                stroke: `url(#gradient)`
              }
            }}
          />
          <svg width={0} height={0}>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={theme.palette.primary.main} />
                <stop offset="100%" stopColor={theme.palette.secondary.main} />
              </linearGradient>
            </defs>
          </svg>
          <Typography variant="h6" color="text.secondary">
            Cargando infraestructura de red...
          </Typography>
        </Box>
      ) : (
        <>
          {switches.length === 0 ? (
            <Fade in timeout={600}>
              <Alert 
                severity="info" 
                sx={{ 
                  mt: 2,
                  borderRadius: 3,
                  '& .MuiAlert-message': {
                    fontSize: '1.1rem'
                  }
                }}
              >
                No hay switches registrados en el sistema.
              </Alert>
            </Fade>
          ) : (
            <Grid container spacing={3} wrap="wrap">
              {switches.map((sw, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={sw.id}>
                  <Zoom in timeout={600 + (index * 100)}>
                    <Card sx={cardStyle}>
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        {/* Status indicator y header */}
                        <Box sx={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 3,
                          gap: 1
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" component="h2" sx={{ 
                              fontWeight: 700,
                              mb: 1,
                              color: 'text.primary'
                            }}>
                              {sw.nombre}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Chip 
                                label={sw.marca} 
                                size="small" 
                                sx={{ 
                                  fontWeight: 600,
                                  background: `linear-gradient(45deg, 
                                    ${theme.palette.primary.main}20, 
                                    ${theme.palette.secondary.main}20)`,
                                  border: `1px solid ${theme.palette.primary.main}40`
                                }}
                              />
                              <StatusIndicator status={getSwitchStatus(sw)} />
                            </Box>
                          </Box>
                        </Box>
                        
                        <Divider sx={{ 
                          my: 2,
                          background: `linear-gradient(90deg, 
                            transparent, 
                            ${theme.palette.divider}, 
                            transparent)`
                        }} />
                        
                        {/* Información detallada */}
                        <Box sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2.5
                        }}>
                          <DetailItem 
                            icon={<NetworkIcon sx={{ color: theme.palette.primary.main }} />} 
                            label="Dirección IP" 
                            value={sw.ip}
                            highlight
                          />
                          
                          <DetailItem 
                            icon={<BuildingIcon sx={{ color: theme.palette.secondary.main }} />} 
                            label="Planta" 
                            value={sw.planta} 
                          />
                          
                          <DetailItem 
                            icon={<LocationIcon sx={{ color: theme.palette.info.main }} />} 
                            label="Ubicación" 
                            value={sw.lugar} 
                          />
                          
                          {/* Chips de especificaciones */}
                          <Box sx={{ 
                            display: 'flex',
                            gap: 1,
                            mt: 2,
                            flexWrap: 'wrap'
                          }}>
                            <Tooltip title="Puertos disponibles">
                              <Chip 
                                icon={<PortsIcon />} 
                                label="24 Puertos" 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  '& .MuiChip-icon': { 
                                    color: theme.palette.success.main 
                                  }
                                }}
                              />
                            </Tooltip>
                            <Tooltip title="Memoria RAM">
                              <Chip 
                                icon={<MemoryIcon />} 
                                label="1GB RAM" 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  '& .MuiChip-icon': { 
                                    color: theme.palette.info.main 
                                  }
                                }}
                              />
                            </Tooltip>
                          </Box>
                        </Box>
                      </CardContent>
                      
                      {/* Acciones */}
                      <CardActions sx={{ 
                        justifyContent: 'center',
                        p: 3,
                        pt: 0,
                        gap: 1
                      }}>
                        <Button
                          variant="contained"
                          size="large"
                          fullWidth
                          startIcon={!restarting[sw.id] && <PowerIcon />}
                          onClick={() => handleReiniciar(sw.id)}
                          disabled={restarting[sw.id]}
                          sx={{ 
                            fontWeight: 600,
                            py: 1.5,
                            background: restarting[sw.id] 
                              ? theme.palette.action.disabled
                              : `linear-gradient(45deg, 
                                  ${theme.palette.primary.main}, 
                                  ${theme.palette.primary.dark})`,
                            '&:hover': {
                              background: `linear-gradient(45deg, 
                                ${theme.palette.primary.dark}, 
                                ${theme.palette.primary.main})`,
                              transform: 'translateY(-2px)'
                            },
                            '&:disabled': {
                              background: theme.palette.action.disabled
                            }
                          }}
                        >
                          {restarting[sw.id] ? (
                            <>
                              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                              Reiniciando...
                            </>
                          ) : (
                            'Reiniciar Switch'
                          )}
                        </Button>
                      </CardActions>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
};

// Componente para tarjetas de estadísticas
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Paper sx={{
    p: 3,
    flex: '1 1 200px',
    minWidth: 200,
    borderRadius: 3,
    background: `linear-gradient(135deg, ${color}15, ${color}05)`,
    border: `1px solid ${color}30`,
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)'
    }
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: `${color}20`,
        color: color,
        display: 'flex',
        alignItems: 'center'
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color }}>
          {value}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

// Componente para indicador de estado
const StatusIndicator = ({ status }) => {
  const theme = useTheme();
  const color = status === 'online' ? theme.palette.success.main : 
                status === 'warning' ? theme.palette.warning.main : 
                theme.palette.error.main;
  
  return (
    <Tooltip title={`Estado: ${status}`}>
      <Box sx={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        bgcolor: color,
        animation: status === 'online' ? 'pulse 2s infinite' : 'none',
        boxShadow: `0 0 10px ${color}60`,
        '@keyframes pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.5 },
          '100%': { opacity: 1 }
        }
      }} />
    </Tooltip>
  );
};

// Componente auxiliar mejorado para los detalles
const DetailItem = ({ icon, label, value, highlight = false }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2,
      p: 1.5,
      borderRadius: 2,
      bgcolor: highlight ? `${theme.palette.primary.main}08` : 'transparent',
      transition: 'background-color 0.3s ease'
    }}>
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: `0 2px 8px ${theme.palette.action.hover}`
      }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ 
          color: 'text.secondary',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ 
          fontWeight: 600,
          color: 'text.primary',
          fontFamily: highlight ? 'monospace' : 'inherit'
        }}>
          {value || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );
};

export default Redes;