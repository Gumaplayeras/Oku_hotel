import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Grid,
  CircularProgress,
  Typography,
  Box,
  Paper,
  Chip,
  Alert,
  Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ComputerIcon from '@mui/icons-material/Computer';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import InfoIcon from '@mui/icons-material/Info';
import { getDepartamentos } from '../../api/departamentos';
import { getUbicaciones } from '../../api/ubicaciones';
import { getEstados } from '../../api/estados';
import { actualizarEquipo } from '../../api/equipos';
import { crearMovimiento as registrarMovimiento } from '../../api/movimientos';

const EditarEquipo = ({ open, handleClose, equipo, onEquipoActualizado }) => {
  // 🔧 ESTADO PARA PREVENIR DUPLICACIÓN
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const submitTimeoutRef = useRef(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    departamento: '',
    ubicacion: '',
    estado: '',
    motivo: '',
  });
  
  // Estados para los selectores
  const [departamentos, setDepartamentos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loadingSelectors, setLoadingSelectors] = useState(false);

  // 🔧 INICIALIZAR FORMULARIO - Solo cuando cambie el equipo
  useEffect(() => {
    if (equipo && open) {
      console.log('🔄 Inicializando formulario con equipo:', equipo.id_inventario);
      setFormData({
        departamento: equipo.departamento?.id || '',
        ubicacion: equipo.ubicacion?.id || '',
        estado: equipo.estado?.id || '',
        motivo: '',
      });
      setHasChanges(false);
      setIsSubmitting(false);
    }
  }, [equipo?.id_inventario, open]);

  // 🔧 LIMPIAR ESTADO AL CERRAR
  useEffect(() => {
    if (!open) {
      console.log('🧹 Limpiando estado del formulario');
      setFormData({
        departamento: '',
        ubicacion: '',
        estado: '',
        motivo: '',
      });
      setHasChanges(false);
      setIsSubmitting(false);
      
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = null;
      }
    }
  }, [open]);

  // 🔧 CARGAR DATOS DE SELECTORES - Solo una vez
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (loadingSelectors) return;
      
      setLoadingSelectors(true);
      try {
        const [deptData, ubicData, estadosData] = await Promise.all([
          getDepartamentos(),
          getUbicaciones(),
          getEstados()
        ]);
        
        if (isMounted) {
          setDepartamentos(deptData || []);
          setUbicaciones(ubicData || []);
          setEstados(estadosData || []);
        }
      } catch (error) {
        console.error('🔴 Error cargando datos para selectores:', error);
        if (isMounted) {
          setDepartamentos([]);
          setUbicaciones([]);
          setEstados([]);
        }
      } finally {
        if (isMounted) {
          setLoadingSelectors(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // 🔧 MANEJAR CAMBIOS DEL FORMULARIO
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      const originalValues = {
        departamento: equipo?.departamento?.id || '',
        ubicacion: equipo?.ubicacion?.id || '',
        estado: equipo?.estado?.id || '',
        motivo: '',
      };
      
      const hasRealChanges = Object.keys(newData).some(key => {
        if (key === 'motivo') return newData[key].trim() !== '';
        return newData[key] !== originalValues[key];
      });
      
      setHasChanges(hasRealChanges);
      return newData;
    });
  }, [equipo]);

  const registrarCambiosComoMovimiento = useCallback(async (cambiosReales) => {
    if (Object.keys(cambiosReales).length === 0) {
      return;
    }
    const payload = {
      equipo: equipo.id_inventario,
      motivo: formData.motivo || "Modificación del equipo desde la interfaz",
      departamento: formData.departamento || equipo.departamento?.id || '',
      ubicacion: formData.ubicacion || equipo.ubicacion?.id || '',
      estado: formData.estado || equipo.estado?.id || '',
      ...cambiosReales,
    };

    console.log('📝 Registrando movimiento (payload):', payload);

    try {
      await registrarMovimiento(payload);
    } catch (error) {
      console.error('🔴 Error registrando movimiento:', error);
      throw error;
    }
  }, [equipo?.id_inventario, formData]);

  // 🔧 MANEJAR ENVÍO CON PROTECCIÓN CONTRA DUPLICADOS
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      console.warn('⚠️ Ya hay un envío en progreso, ignorando...');
      return;
    }

    if (!hasChanges) {
      console.log('ℹ️ No hay cambios para guardar');
      handleClose();
      return;
    }

    if (!equipo?.id_inventario) {
      console.error('🔴 No hay ID de equipo para actualizar');
      return;
    }

    setIsSubmitting(true);
    
    submitTimeoutRef.current = setTimeout(() => {
      console.warn('⚠️ Desbloqueando envío por timeout');
      setIsSubmitting(false);
    }, 30000);

    try {
      const cambiosReales = {};
      const valoresOriginales = {
        departamento: equipo.departamento?.id,
        ubicacion: equipo.ubicacion?.id,
        estado: equipo.estado?.id,
      };

      Object.keys(valoresOriginales).forEach(key => {
        if (formData[key] && formData[key] !== valoresOriginales[key]) {
          cambiosReales[key] = formData[key];
        }
      });

      const datosActualizados = {
        id_inventario: equipo.id_inventario,
        nombre: equipo.nombre,
        elemento: equipo.elemento,
        marca: equipo.marca,
        modelo: equipo.modelo,
        serial: equipo.serial,
        estado: formData.estado || equipo.estado?.id,
        ubicacion: formData.ubicacion || equipo.ubicacion?.id,
        departamento: formData.departamento || equipo.departamento?.id,
      };

      console.log("🔁 Datos que se envían:", datosActualizados);
      console.log("📊 Cambios detectados:", cambiosReales);

      await actualizarEquipo(equipo.id_inventario, datosActualizados);
      
      if (Object.keys(cambiosReales).length > 0) {
        await registrarCambiosComoMovimiento(cambiosReales);
      }
      
      console.log('✅ Equipo actualizado exitosamente');
      
      if (onEquipoActualizado) {
        onEquipoActualizado();
      }
      
      handleClose();
      
    } catch (error) {
      console.error("❌ Error al actualizar equipo:", error.response?.data || error.message);
    } finally {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = null;
      }
      setIsSubmitting(false);
    }
  }, [isSubmitting, hasChanges, equipo, formData, handleClose, onEquipoActualizado, registrarCambiosComoMovimiento]);

  // 🔧 MANEJAR CIERRE DEL MODAL
  const handleDialogClose = useCallback((event, reason) => {
    if (isSubmitting) {
      console.log('⚠️ No se puede cerrar durante el envío');
      return;
    }

    if (hasChanges) {
      const confirmClose = window.confirm('¿Descartar los cambios no guardados?');
      if (!confirmClose) return;
    }

    handleClose();
  }, [isSubmitting, hasChanges, handleClose]);

  // 🧹 Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const getEstadoColor = (estado) => {
    const colors = {
      'Activo': '#22c55e',
      'Inactivo': '#ef4444',
      'Mantenimiento': '#f59e0b',
      'Disponible': '#3b82f6',
    };
    return colors[estado] || '#64748b';
  };

  if (!equipo || Object.keys(equipo).length === 0) {
    return (
      <Dialog 
        open={open} 
        onClose={handleDialogClose}
        maxWidth="md" 
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
          <EditIcon sx={{ fontSize: '4rem', color: '#64748b', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 600 }}>
            No hay información del equipo disponible para editar
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

  return (
    <Dialog 
      open={open} 
      onClose={handleDialogClose} 
      fullWidth 
      maxWidth="md"
      disableEscapeKeyDown={isSubmitting}
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
              <EditIcon sx={{ color: '#ffffff', fontSize: '1.75rem' }} />
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
                Editar Equipo
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
                  {equipo.nombre} - ID: {equipo.id_inventario}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <IconButton
            onClick={handleDialogClose}
            disabled={isSubmitting}
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
          
          {/* Información actual del equipo */}
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
              <InfoIcon sx={{ color: '#3b82f6' }} />
              Información Actual
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
                    Departamento Actual
                  </Typography>
                  <Chip
                    label={equipo.departamento?.nombre || 'No especificado'}
                    sx={{
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      fontWeight: 500
                    }}
                  />
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
                    Estado Actual
                  </Typography>
                  <Chip
                    label={equipo.estado?.nombre || 'Sin estado'}
                    sx={{
                      backgroundColor: `${getEstadoColor(equipo.estado?.nombre)}20`,
                      color: getEstadoColor(equipo.estado?.nombre),
                      border: `1px solid ${getEstadoColor(equipo.estado?.nombre)}40`,
                      fontWeight: 500
                    }}
                  />
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
                    Ubicación Actual
                  </Typography>
                  <Chip
                    label={equipo.ubicacion?.fase || 'No especificado'}
                    sx={{
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      color: '#a78bfa',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      fontWeight: 500
                    }}
                  />
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
                    Asignado a
                  </Typography>
                  <Chip
                    label={equipo.empleado?.nombre || 'No asignado'}
                    sx={{
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      color: '#4ade80',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      fontWeight: 500
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Formulario de edición */}
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
              <EditIcon sx={{ color: '#f59e0b' }} />
              Modificar Información
            </Typography>

            {loadingSelectors && (
              <Fade in timeout={300}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4, mb: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={40} sx={{ color: '#f59e0b', mb: 2 }} />
                    <Typography variant="body1" sx={{ color: '#94a3b8' }}>
                      Cargando opciones...
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <BusinessIcon sx={{ color: '#94a3b8', fontSize: '1.2rem' }} />
                  <Typography variant="subtitle2" sx={{ 
                    color: '#94a3b8', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.875rem'
                  }}>
                    Departamento
                  </Typography>
                </Box>
                <TextField
                  select 
                  fullWidth 
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  disabled={isSubmitting || loadingSelectors}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(51, 65, 85, 0.3)',
                      borderRadius: '12px',
                      color: '#f1f5f9',
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
                    '& .MuiSelect-icon': {
                      color: '#94a3b8',
                    },
                  }}
                >
                  {departamentos.map(dep => (
                    <MenuItem key={dep.id} value={dep.id}>
                      {dep.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocationOnIcon sx={{ color: '#94a3b8', fontSize: '1.2rem' }} />
                  <Typography variant="subtitle2" sx={{ 
                    color: '#94a3b8', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.875rem'
                  }}>
                    Ubicación
                  </Typography>
                </Box>
                <TextField
                  select 
                  fullWidth 
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  disabled={isSubmitting || loadingSelectors}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(51, 65, 85, 0.3)',
                      borderRadius: '12px',
                      color: '#f1f5f9',
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
                    '& .MuiSelect-icon': {
                      color: '#94a3b8',
                    },
                  }}
                >
                  {ubicaciones.map(ub => (
                    <MenuItem key={ub.id} value={ub.id}>
                      {ub.fase}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CheckCircleIcon sx={{ color: '#94a3b8', fontSize: '1.2rem' }} />
                  <Typography variant="subtitle2" sx={{ 
                    color: '#94a3b8', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.875rem'
                  }}>
                    Estado
                  </Typography>
                </Box>
                <TextField
                  select 
                  fullWidth 
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  disabled={isSubmitting || loadingSelectors}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(51, 65, 85, 0.3)',
                      borderRadius: '12px',
                      color: '#f1f5f9',
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
                    '& .MuiSelect-icon': {
                      color: '#94a3b8',
                    },
                  }}
                >
                  {estados.map(est => (
                    <MenuItem key={est.id} value={est.id}>
                      {est.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon sx={{ color: '#94a3b8', fontSize: '1.2rem' }} />
                  <Typography variant="subtitle2" sx={{ 
                    color: '#94a3b8', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.875rem'
                  }}>
                    Asignado a (Solo lectura)
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  value={equipo?.empleado?.nombre || 'No asignado'}
                  InputProps={{ readOnly: true }}
                  disabled={true}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(51, 65, 85, 0.2)',
                      borderRadius: '12px',
                      color: '#64748b',
                      '& fieldset': {
                        borderColor: 'rgba(71, 85, 105, 0.2)',
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DescriptionIcon sx={{ color: '#94a3b8', fontSize: '1.2rem' }} />
                  <Typography variant="subtitle2" sx={{ 
                    color: '#94a3b8', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.875rem'
                  }}>
                    Motivo del cambio
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Describe el motivo de los cambios..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(51, 65, 85, 0.3)',
                      borderRadius: '12px',
                      color: '#f1f5f9',
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
                    '& .MuiInputBase-input::placeholder': {
                      color: '#64748b',
                      opacity: 1,
                    },
                  }}
                />
              </Grid>
            </Grid>

            {hasChanges && (
              <Fade in timeout={300}>
                <Box sx={{ mt: 3 }}>
                  <Alert 
                    severity="info" 
                    sx={{ 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '12px',
                      color: '#60a5fa',
                      '& .MuiAlert-icon': {
                        color: '#60a5fa'
                      }
                    }}
                  >
                    Se han detectado cambios. Recuerda guardar antes de cerrar.
                  </Alert>
                </Box>
              </Fade>
            )}
          </Paper>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 4, 
        pt: 0,
        gap: 2,
        justifyContent: 'flex-end'
      }}>
        <Button 
          onClick={handleDialogClose}
          disabled={isSubmitting}
          startIcon={<CancelIcon />}
          variant="outlined"
          sx={{
            borderColor: 'rgba(71, 85, 105, 0.5)',
            color: '#94a3b8',
            fontWeight: 600,
            borderRadius: '12px',
            textTransform: 'none',
            minWidth: '120px',
            height: '44px',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: '#94a3b8',
              background: 'rgba(71, 85, 105, 0.1)',
              color: '#cbd5e1'
            }
          }}
        >
          Cancelar
        </Button>
        
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={isSubmitting || !hasChanges || loadingSelectors}
          startIcon={isSubmitting ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : <SaveIcon />}
          sx={{
            fontWeight: 600,
            borderRadius: '12px',
            textTransform: 'none',
            minWidth: '140px',
            height: '44px',
            fontSize: '0.95rem',
            background: hasChanges && !isSubmitting 
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : 'linear-gradient(135deg, #64748b, #475569)',
            boxShadow: hasChanges && !isSubmitting
              ? '0 4px 14px rgba(245, 158, 11, 0.3)'
              : '0 2px 8px rgba(100, 116, 139, 0.3)',
            color: '#ffffff',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: hasChanges && !isSubmitting 
                ? 'linear-gradient(135deg, #d97706, #b45309)'
                : 'linear-gradient(135deg, #64748b, #475569)',
              transform: hasChanges && !isSubmitting ? 'translateY(-1px)' : 'none',
              boxShadow: hasChanges && !isSubmitting
                ? '0 6px 18px rgba(245, 158, 11, 0.4)'
                : '0 2px 8px rgba(100, 116, 139, 0.3)',
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, #64748b, #475569)',
              color: '#94a3b8',
              boxShadow: 'none'
            }
          }}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditarEquipo;