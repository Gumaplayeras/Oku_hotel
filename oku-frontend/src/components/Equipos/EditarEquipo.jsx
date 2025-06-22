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
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Alert
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
      'Activo': '#4caf50',
      'Inactivo': '#f44336',
      'Mantenimiento': '#ff9800',
      'Disponible': '#2196f3',
    };
    return colors[estado] || '#757575';
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
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 3 }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            ✏️ Editar Equipo
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
              <EditIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No hay información del equipo disponible para editar
              </Typography>
            </Box>
          </Box>
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
    >
      <DialogTitle sx={{ color: 'white', pb: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <EditIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              Editar Equipo
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {equipo.nombre} - ID: {equipo.id_inventario}
            </Typography>
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleDialogClose}
          disabled={isSubmitting}
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
          {/* Información actual del equipo */}
          <Card elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ 
              background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)', 
              p: 2, 
              color: 'white' 
            }}>
              <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                <ComputerIcon /> Información Actual
              </Typography>
            </Box>
            <CardContent sx={{ p: 3, bgcolor: '#2c2c2c', color: 'white' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="#b0b0b0" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Departamento Actual
                    </Typography>
                    <Chip
                      label={equipo.departamento?.nombre || 'No especificado'}
                      sx={{
                        bgcolor: '#1e3c72',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="#b0b0b0" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Ubicación Actual
                    </Typography>
                    <Chip
                      label={equipo.ubicacion?.fase || 'No especificado'}
                      sx={{
                        bgcolor: '#134e5e',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="#b0b0b0" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Estado Actual
                    </Typography>
                    <Chip
                      label={equipo.estado?.nombre || 'Sin estado'}
                      sx={{
                        bgcolor: getEstadoColor(equipo.estado?.nombre),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="#b0b0b0" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Asignado a
                    </Typography>
                    <Chip
                      label={equipo.empleado?.nombre || 'No asignado'}
                      sx={{
                        bgcolor: '#6a1b9a',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Formulario de edición */}
          <Card elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ 
              background: 'linear-gradient(90deg, #b92b27 0%, #8e2de2 100%)', 
              p: 2, 
              color: 'white' 
            }}>
              <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                <EditIcon /> Modificar Información
              </Typography>
            </Box>
            <CardContent sx={{ p: 3, bgcolor: '#2c2c2c' }}>
              {loadingSelectors && (
                <Box display="flex" justifyContent="center" alignItems="center" py={3} mb={3}>
                  <CircularProgress size={32} sx={{ color: '#2a5298', mr: 2 }} />
                  <Typography variant="body1" sx={{ color: '#b0b0b0' }}>
                    Cargando opciones...
                  </Typography>
                </Box>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <BusinessIcon sx={{ color: '#b0b0b0', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
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
                      '& .MuiSelect-icon': {
                        color: '#b0b0b0',
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
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <LocationOnIcon sx={{ color: '#b0b0b0', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
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
                      '& .MuiSelect-icon': {
                        color: '#b0b0b0',
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
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CheckCircleIcon sx={{ color: '#b0b0b0', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
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
                      '& .MuiSelect-icon': {
                        color: '#b0b0b0',
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
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PersonIcon sx={{ color: '#b0b0b0', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
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
                        borderRadius: 2,
                        backgroundColor: '#333333',
                        color: '#b0b0b0',
                        '& fieldset': {
                          borderColor: '#444',
                        },
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <DescriptionIcon sx={{ color: '#b0b0b0', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
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

              {hasChanges && (
                <Box mt={3}>
                  <Alert 
                    severity="info" 
                    sx={{ 
                      backgroundColor: 'rgba(42, 82, 152, 0.1)',
                      color: '#2a5298',
                      '& .MuiAlert-icon': {
                        color: '#2a5298'
                      }
                    }}
                  >
                    Se han detectado cambios. Recuerda guardar antes de cerrar.
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ backgroundColor: '#1a1a1a', p: 3 }}>
        <Button 
          onClick={handleDialogClose}
          disabled={isSubmitting}
          startIcon={<CancelIcon />}
          sx={{
            color: '#b0b0b0',
            borderColor: '#555',
            '&:hover': {
              borderColor: '#777',
              backgroundColor: 'rgba(255,255,255,0.05)'
            }
          }}
          variant="outlined"
        >
          Cancelar
        </Button>
        
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={isSubmitting || !hasChanges || loadingSelectors}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : <SaveIcon />}
          sx={{
            background: hasChanges && !isSubmitting 
              ? 'linear-gradient(45deg, #2a5298 0%, #1e3c72 100%)'
              : 'linear-gradient(45deg, #666 0%, #555 100%)',
            '&:hover': {
              background: hasChanges && !isSubmitting 
                ? 'linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)'
                : 'linear-gradient(45deg, #666 0%, #555 100%)',
            },
            '&:disabled': {
              background: 'linear-gradient(45deg, #666 0%, #555 100%)',
              color: '#999'
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