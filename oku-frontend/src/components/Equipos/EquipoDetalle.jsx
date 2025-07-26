import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  IconButton,
  Box,
  CircularProgress,
  Paper,
  TextField,
  Chip,
  Card,
  CardContent,
  Avatar,
  Fade,
  Button
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
import InventoryIcon from '@mui/icons-material/Inventory';
import { getMovimientosPorEquipo } from '../../api/movimientos';

const StatCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <Paper sx={{
      p: 3, 
      flex: '1 1 200px', 
      minWidth: 200, 
      height: '100%',
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid rgba(71, 85, 105, 0.3)',
      borderRadius: '16px',
      position: 'relative',
      overflow: 'hidden',
      backdropFilter: 'blur(20px)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-4px) scale(1.02)',
        background: 'rgba(30, 41, 59, 0.8)',
        border: `1px solid ${color}40`,
        boxShadow: `0 20px 40px -12px ${color}20`,
        '& .stat-icon': {
          transform: 'scale(1.1)',
          backgroundColor: color,
          color: '#ffffff',
          boxShadow: `0 8px 20px ${color}40`
        },
        '& .stat-value': {
          color: '#ffffff'
        },
        '& .stat-title': {
          color: '#e2e8f0'
        }
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg, ${color}, ${color}80, transparent)`,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: -2,
        right: -2,
        width: '4px',
        height: '40px',
        background: `linear-gradient(180deg, ${color}60, transparent)`,
        borderRadius: '2px'
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography 
            variant="caption" 
            className="stat-title"
            sx={{ 
              color: '#94a3b8',
              fontWeight: 500,
              fontSize: '0.875rem',
              mb: 1.5,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease',
              display: 'block'
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h3" 
            className="stat-value"
            sx={{ 
              color: '#f1f5f9',
              fontWeight: 700,
              fontSize: '2.25rem',
              transition: 'color 0.3s ease',
              fontFamily: '"Inter", sans-serif',
              lineHeight: 1.1,
              mb: 0.5
            }}
          >
            {value}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b',
              fontSize: '0.8rem',
              lineHeight: 1.4
            }}
          >
            {subtitle}
          </Typography>
        </Box>
        
        <Box 
          className="stat-icon"
          sx={{
            width: 60, 
            height: 60, 
            borderRadius: '14px', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center', 
            backgroundColor: `${color}15`,
            color: color,
            border: `1px solid ${color}20`,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '& svg': {
              fontSize: '1.75rem',
              transition: 'all 0.3s ease'
            }
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

const EquipoDetalle = ({ open, handleClose, equipo }) => {
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [filtroTextoLibre, setFiltroTextoLibre] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  // Memorizar la función de filtrado
  const movimientosFiltrados = React.useMemo(() => {
    return movimientos.filter((mov) => {
      const coincideFecha = filtroFecha
        ? new Date(mov.fecha).toISOString().split('T')[0] === filtroFecha
        : true;
      const coincideTextoLibre = filtroTextoLibre
        ? (mov.motivo?.toLowerCase().includes(filtroTextoLibre.toLowerCase()) ||
           mov.realizado_por_nombre?.toLowerCase().includes(filtroTextoLibre.toLowerCase()) ||
           mov.descripcion?.toLowerCase().includes(filtroTextoLibre.toLowerCase()))
        : true;
      return coincideFecha && coincideTextoLibre;
    });
  }, [movimientos, filtroFecha, filtroTextoLibre]);

  // Función de cierre mejorada
  const handleDialogClose = useCallback((event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown' || !reason) {
      setMovimientos([]);
      setLoadingMovimientos(false);
      setFiltroTextoLibre('');
      setFiltroFecha('');
      handleClose();
    }
  }, [handleClose]);

  // Cargar movimientos cuando se abre el modal
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
      setMovimientos([]);
      setLoadingMovimientos(false);
      setFiltroTextoLibre('');
      setFiltroFecha('');
    }
  }, [open, equipo?.id_inventario]);

  if (!equipo || Object.keys(equipo).length === 0) {
    return (
      <Dialog 
        open={open} 
        onClose={handleDialogClose}
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            color: '#f1f5f9'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }
        }}
      >
        <DialogContent sx={{ p: 6, textAlign: 'center' }}>
          <InfoIcon sx={{ fontSize: '4rem', color: '#64748b', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 600 }}>
            No hay información del equipo disponible
          </Typography>
          <Button 
            onClick={handleDialogClose}
            variant="outlined"
            sx={{
              mt: 3,
              borderColor: 'rgba(71, 85, 105, 0.5)',
              color: '#94a3b8',
              '&:hover': {
                borderColor: '#94a3b8',
                background: 'rgba(71, 85, 105, 0.1)'
              }
            }}
          >
            Cerrar
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const getEstadoColor = (estado) => {
    const colors = {
      'Activo': '#22c55e',
      'Inactivo': '#ef4444',
      'Mantenimiento': '#f59e0b',
      'Disponible': '#3b82f6',
    };
    return colors[estado] || '#64748b';
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleDialogClose}
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          maxHeight: '90vh',
          color: '#f1f5f9'
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }
      }}
      keepMounted={false}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 4, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
            }}>
              <ComputerIcon sx={{ color: '#ffffff', fontSize: '1.75rem' }} />
            </Box>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '1.875rem',
                  mb: 0.5,
                  letterSpacing: '-0.025em'
                }}
              >
                {equipo.nombre || 'Equipo'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon sx={{ color: '#94a3b8', fontSize: '1.1rem' }} />
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: '#94a3b8',
                    fontFamily: 'monospace',
                    fontSize: '1rem'
                  }}
                >
                  ID: {equipo.id_inventario}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <IconButton
            onClick={handleDialogClose}
            sx={{ 
              color: '#94a3b8',
              backgroundColor: 'rgba(71, 85, 105, 0.3)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '12px',
              width: 48,
              height: 48,
              '&:hover': { 
                backgroundColor: 'rgba(71, 85, 105, 0.5)',
                borderColor: 'rgba(148, 163, 184, 0.5)',
                color: '#f1f5f9'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 4, pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          {/* Estadísticas principales */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            },
            gap: 3
          }}>
            <StatCard
              title="Empleado Asignado"
              value={equipo.empleado?.nombre ? "Asignado" : "Libre"}
              icon={<PersonIcon />}
              color={equipo.empleado?.nombre ? "#22c55e" : "#64748b"}
              subtitle={equipo.empleado?.nombre || "Sin asignar"}
            />
            <StatCard
              title="Ubicación"
              value={equipo.ubicacion?.fase || "N/A"}
              icon={<LocationOnIcon />}
              color="#3b82f6"
              subtitle="Fase actual"
            />
            <StatCard
              title="Estado"
              value={equipo.estado?.nombre || "N/A"}
              icon={<BusinessIcon />}
              color={getEstadoColor(equipo.estado?.nombre)}
              subtitle="Estado actual"
            />
          </Box>

          {/* Información técnica */}
          <Paper sx={{
            p: 3,
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#f1f5f9', 
                mb: 3, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <ComputerIcon sx={{ color: '#f59e0b' }} />
              Especificaciones Técnicas
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ 
                    color: '#94a3b8',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 1
                  }}>
                    Elemento
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#f1f5f9',
                    fontWeight: 600
                  }}>
                    {equipo.elemento || 'No especificado'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ 
                    color: '#94a3b8',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 1
                  }}>
                    Marca
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#f1f5f9',
                    fontWeight: 600
                  }}>
                    {equipo.marca || 'No especificado'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ 
                    color: '#94a3b8',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 1
                  }}>
                    Departamento
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#f1f5f9',
                    fontWeight: 600
                  }}>
                    {equipo.departamento?.nombre || 'No especificado'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ 
                    color: '#94a3b8',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 1
                  }}>
                    Modelo
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#f1f5f9',
                    fontWeight: 600
                  }}>
                    {equipo.modelo || 'No especificado'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ 
                    color: '#94a3b8',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 1
                  }}>
                    Serial
                  </Typography>
                  <Box sx={{
                    backgroundColor: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    borderRadius: '8px',
                    p: 2
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: '#f1f5f9',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {equipo.serial || 'No especificado'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Historial de movimientos */}
          <Paper sx={{
            p: 3,
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#f1f5f9', 
                mb: 3, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <HistoryIcon sx={{ color: '#f59e0b' }} />
              Historial de Movimientos
            </Typography>

            {/* Filtros */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Buscar en movimientos"
                  variant="outlined"
                  value={filtroTextoLibre}
                  onChange={(e) => setFiltroTextoLibre(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(51, 65, 85, 0.3)',
                      borderRadius: '12px',
                      '& fieldset': {
                        borderColor: 'rgba(71, 85, 105, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(96, 165, 250, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#60a5fa',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#94a3b8',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: '#f1f5f9',
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Filtrar por fecha"
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(51, 65, 85, 0.3)',
                      borderRadius: '12px',
                      '& fieldset': {
                        borderColor: 'rgba(71, 85, 105, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(96, 165, 250, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#60a5fa',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#94a3b8',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: '#f1f5f9',
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* Lista de movimientos */}
            {loadingMovimientos ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={48} sx={{ color: '#f59e0b', mb: 2 }} />
                  <Typography variant="body1" sx={{ color: '#94a3b8' }}>
                    Cargando movimientos...
                  </Typography>
                </Box>
              </Box>
            ) : movimientosFiltrados.length > 0 ? (
              <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {movimientosFiltrados.map((mov, idx) => (
                  <Fade in={true} timeout={300 + idx * 100} key={mov.uniqueId || idx}>
                    <Paper 
                      sx={{ 
                        mb: 2, 
                        p: 3,
                        background: 'rgba(51, 65, 85, 0.3)',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(20px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          background: 'rgba(51, 65, 85, 0.5)',
                          borderColor: 'rgba(96, 165, 250, 0.5)',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarTodayIcon sx={{ fontSize: '1rem', color: '#94a3b8' }} />
                          <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                            {new Date(mov.fecha).toLocaleString()}
                          </Typography>
                        </Box>
                        
                        <Chip
                          label={mov.descripcion || mov.motivo || 'Sin motivo'}
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            fontWeight: 500
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: '1rem', color: '#94a3b8' }} />
                        <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                          <strong>Realizado por:</strong> {mov.realizado_por_nombre || mov.realizado_por || 'Usuario no especificado'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Fade>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <HistoryIcon sx={{ fontSize: '4rem', color: '#64748b', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1, fontWeight: 600 }}>
                  No hay movimientos
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  No se encontraron movimientos que coincidan con los filtros aplicados
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EquipoDetalle;