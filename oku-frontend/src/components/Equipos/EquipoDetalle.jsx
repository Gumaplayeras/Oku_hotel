import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  IconButton,
  Divider,
  Box,
  CircularProgress,
  Paper,
  TextField,
  Chip,
  Card,
  CardContent,
  Avatar,
  Fade,
  Slide
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ComputerIcon from '@mui/icons-material/Computer';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
import { getMovimientosPorEquipo } from '../../api/movimientos';

const EquipoDetalle = ({ open, handleClose, equipo }) => {
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [filtroMotivo, setFiltroMotivo] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroTextoLibre, setFiltroTextoLibre] = useState('');

  // ✅ SOLUCIÓN 1: Memorizar la función de filtrado
  const movimientosFiltrados = React.useMemo(() => {
    return movimientos.filter((mov) => {
      const coincideUsuario = filtroUsuario
        ? mov.realizado_por_nombre?.toLowerCase().includes(filtroUsuario.toLowerCase())
        : true;
      const coincideFecha = filtroFecha
        ? new Date(mov.fecha).toISOString().split('T')[0] === filtroFecha
        : true;
      const coincideTextoLibre = filtroTextoLibre
        ? (mov.motivo?.toLowerCase().includes(filtroTextoLibre.toLowerCase()) ||
           mov.realizado_por_nombre?.toLowerCase().includes(filtroTextoLibre.toLowerCase()))
        : true;
      return coincideUsuario && coincideFecha && coincideTextoLibre;
    });
  }, [movimientos, filtroUsuario, filtroFecha, filtroTextoLibre]);

  // ✅ SOLUCIÓN 2: Función de cierre mejorada SIN limpiarEstados en dependencias
  const handleDialogClose = useCallback((event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown' || !reason) {
      // Limpiar estados directamente aquí
      setMovimientos([]);
      setLoadingMovimientos(false);
      setFiltroMotivo('');
      setFiltroUsuario('');
      setFiltroFecha('');
      setFiltroTextoLibre('');
      handleClose();
    }
  }, [handleClose]); // Solo handleClose en dependencias

  // ✅ SOLUCIÓN 3: useEffect SIN dependencias problemáticas
  useEffect(() => {
    if (open && equipo?.id_inventario) {
      console.log('🟡 Consultando movimientos para equipo:', equipo.id_inventario);
      setLoadingMovimientos(true);
      
      getMovimientosPorEquipo(equipo.id_inventario.toString())
        .then((data) => {
          console.log('🟢 Movimientos recibidos:', data);
          const movimientosConId = data.map((mov, index) => ({
            ...mov,
            uniqueId: mov.id || `${equipo.id_inventario}-${index}-${mov.fecha}`
          }));
          setMovimientos(movimientosConId);
        })
        .catch((err) => {
          console.error('🔴 Error al cargar movimientos:', err);
          setMovimientos([]);
        })
        .finally(() => setLoadingMovimientos(false));
    } else if (!open) {
      // Limpiar estados cuando se cierre el diálogo
      setMovimientos([]);
      setLoadingMovimientos(false);
      setFiltroMotivo('');
      setFiltroUsuario('');
      setFiltroFecha('');
      setFiltroTextoLibre('');
    }
  }, [open, equipo?.id_inventario]); // 🟢 SOLO estas dependencias necesarias

  if (!equipo || Object.keys(equipo).length === 0) {
    return (
      <Dialog 
        open={open} 
        onClose={handleDialogClose}
        maxWidth="lg" 
        fullWidth
        disableEscapeKeyDown={false}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }
        }}
        aria-labelledby="equipo-detalle-title"
        aria-describedby="equipo-detalle-description"
      >
        <DialogTitle id="equipo-detalle-title" sx={{ textAlign: 'center', pb: 3 }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            📦 Detalle del Equipo
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleDialogClose}
            sx={{ 
              position: 'absolute', 
              right: 16, 
              top: 16,
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: 'white', color: 'black' }}>
          <Box display="flex" justifyContent="center" alignItems="center" p={6}>
            <Box textAlign="center">
              <InfoIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No hay información del equipo disponible
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  const getEstadoColor = (estado) => {
    const colors = {
      'Activo': '#4caf50',
      'Inactivo': '#f44336',
      'Mantenimiento': '#ff9800',
      'Disponible': '#2196f3',
    };
    return colors[estado] || '#757575';
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleDialogClose}
      maxWidth="lg" 
      fullWidth
      disableEscapeKeyDown={false}
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          maxHeight: '90vh'
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }
      }}
      aria-labelledby="equipo-detalle-title"
      aria-describedby="equipo-detalle-description"
      keepMounted={false}
    >
      <DialogTitle id="equipo-detalle-title" sx={{ color: 'white', pb: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <ComputerIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {equipo.nombre || 'Equipo'}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              ID: {equipo.id_inventario}
            </Typography>
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleDialogClose}
          sx={{ 
            position: 'absolute', 
            right: 16, 
            top: 16,
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent 
        id="equipo-detalle-description"
        dividers 
        sx={{ 
          backgroundColor: '#1a1a1a', 
          p: 3,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#2c2c2c',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#555',
            borderRadius: '10px',
          },
        }}
      >
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Tarjetas de información principal */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card 
                elevation={0}
                sx={{ 
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                  color: 'white',
                  borderRadius: 3,
                  height: '100%'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Asignación
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Empleado:</strong>
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {equipo.empleado?.nombre ?? 'Sin asignar'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card 
                elevation={0}
                sx={{ 
                  background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
                  color: 'white',
                  borderRadius: 3,
                  height: '100%'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                      <LocationOnIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Ubicación
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Fase:</strong>
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {equipo.ubicacion?.fase ?? 'No especificado'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card 
                elevation={0}
                sx={{ 
                  background: 'linear-gradient(135deg, #b92b27 0%, #8e2de2 100%)',
                  color: 'white',
                  borderRadius: 3,
                  height: '100%'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                      <BusinessIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Estado
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={equipo.estado?.nombre ?? 'Sin estado'}
                      sx={{
                        bgcolor: getEstadoColor(equipo.estado?.nombre),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Información detallada del equipo */}
          <Card elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ 
              background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)', 
              p: 2, 
              color: 'white' 
            }}>
              <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                <ComputerIcon /> Especificaciones técnicas
              </Typography>
            </Box>
            <CardContent sx={{ p: 3, bgcolor: '#2c2c2c', color: 'white' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="#b0b0b0" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Elemento
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', color: 'white' }}>
                      {equipo.elemento ?? 'No especificado'}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="#b0b0b0" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Marca
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', color: 'white' }}>
                      {equipo.marca ?? 'No especificado'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="#b0b0b0" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Departamento
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', color: 'white' }}>
                      {equipo.departamento?.nombre ?? 'No especificado'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="#b0b0b0" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Modelo
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', color: 'white' }}>
                      {equipo.modelo ?? 'No especificado'}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="#b0b0b0" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Serial
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', fontFamily: 'monospace', bgcolor: '#404040', color: 'white', p: 1, borderRadius: 1 }}>
                      {equipo.serial ?? 'No especificado'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Historial de movimientos */}
          <Card elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ 
              background: 'linear-gradient(90deg, #b92b27 0%, #8e2de2 100%)', 
              p: 2, 
              color: 'white' 
            }}>
              <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                <HistoryIcon /> Historial de movimientos
              </Typography>
            </Box>
            <CardContent sx={{ p: 3, bgcolor: '#2c2c2c' }}>
              {/* Filtros modernos */}
              <Box mb={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="🔍 Buscar por texto"
                      value={filtroTextoLibre}
                      onChange={(e) => setFiltroTextoLibre(e.target.value)}
                      fullWidth
                      variant="outlined"
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: '#b0b0b0',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#2a5298',
                        },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#404040',
                          color: 'white',
                          '& fieldset': {
                            borderColor: '#555',
                          },
                          '&:hover fieldset': {
                            borderColor: '#2a5298',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#2a5298',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="📅 Filtrar por fecha"
                      type="date"
                      value={filtroFecha}
                      onChange={(e) => setFiltroFecha(e.target.value)}
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: '#b0b0b0',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#2a5298',
                        },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#404040',
                          color: 'white',
                          '& fieldset': {
                            borderColor: '#555',
                          },
                          '&:hover fieldset': {
                            borderColor: '#2a5298',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#2a5298',
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {loadingMovimientos ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={6}>
                  <Box textAlign="center">
                    <CircularProgress size={48} sx={{ color: '#2a5298', mb: 2 }} />
                    <Typography variant="body1" sx={{ color: '#b0b0b0' }}>
                      Cargando movimientos...
                    </Typography>
                  </Box>
                </Box>
              ) : movimientosFiltrados.length > 0 ? (
                <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {movimientosFiltrados.map((mov, idx) => (
                    <Fade in={true} timeout={300 + idx * 100} key={mov.uniqueId || idx}>
                      <Card 
                        elevation={0}
                        sx={{ 
                          mb: 2, 
                          backgroundColor: '#404040',
                          border: '1px solid #555',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            borderColor: '#2a5298'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Typography variant="body2" sx={{ color: '#b0b0b0' }} display="flex" alignItems="center" gap={1}>
                              <CalendarTodayIcon sx={{ fontSize: 16 }} />
                              <strong>{new Date(mov.fecha).toLocaleString()}</strong>
                            </Typography>
                            {/* <Chip
                              label={mov.motivo || 'Sin motivo'}
                              size="small"
                              sx={{ 
                                bgcolor: '#2a5298', 
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            /> */}
                            <Box display="flex" alignItems="center" gap={1}>
                              <InfoIcon sx={{ fontSize: 16, color: '#b0b0b0' }} />
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                <strong>Motivo:</strong> {mov.descripcion || mov.motivo || 'Sin motivo'}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'white' }} display="flex" alignItems="center" gap={1}>
                            <PersonIcon sx={{ fontSize: 16, color: '#b0b0b0' }} />
                            <strong>Realizado por:</strong> {mov.realizado_por_nombre || mov.realizado_por || 'Usuario no especificado'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Fade>
                  ))}
                </Box>
              ) : (
                <Box textAlign="center" py={6}>
                  <HistoryIcon sx={{ fontSize: 64, color: '#666', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#b0b0b0' }} gutterBottom>
                    No hay movimientos
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#888' }}>
                    No se encontraron movimientos que coincidan con los filtros aplicados
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EquipoDetalle;