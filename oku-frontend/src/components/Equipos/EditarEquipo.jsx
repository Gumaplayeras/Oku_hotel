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
import { T, inputSx, menuPaperSx } from '../../theme/theme';

const EditarEquipo = ({ open, handleClose, equipo, onEquipoActualizado }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const submitTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({ departamento: '', ubicacion: '', estado: '', motivo: '' });
  const [departamentos, setDepartamentos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loadingSelectors, setLoadingSelectors] = useState(false);

  useEffect(() => {
    if (equipo && open) {
      console.log('🔄 Inicializando formulario con equipo:', equipo.id_inventario);
      setFormData({ departamento: equipo.departamento?.id || '', ubicacion: equipo.ubicacion?.id || '', estado: equipo.estado?.id || '', motivo: '' });
      setHasChanges(false);
      setIsSubmitting(false);
    }
  }, [equipo?.id_inventario, open]);

  useEffect(() => {
    if (!open) {
      console.log('🧹 Limpiando estado del formulario');
      setFormData({ departamento: '', ubicacion: '', estado: '', motivo: '' });
      setHasChanges(false);
      setIsSubmitting(false);
      if (submitTimeoutRef.current) { clearTimeout(submitTimeoutRef.current); submitTimeoutRef.current = null; }
    }
  }, [open]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (loadingSelectors) return;
      setLoadingSelectors(true);
      try {
        const [deptData, ubicData, estadosData] = await Promise.all([getDepartamentos(), getUbicaciones(), getEstados()]);
        if (isMounted) { setDepartamentos(deptData || []); setUbicaciones(ubicData || []); setEstados(estadosData || []); }
      } catch (error) {
        console.error('🔴 Error cargando datos para selectores:', error);
        if (isMounted) { setDepartamentos([]); setUbicaciones([]); setEstados([]); }
      } finally { if (isMounted) setLoadingSelectors(false); }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      const originalValues = { departamento: equipo?.departamento?.id || '', ubicacion: equipo?.ubicacion?.id || '', estado: equipo?.estado?.id || '', motivo: '' };
      const hasRealChanges = Object.keys(newData).some(key => { if (key === 'motivo') return newData[key].trim() !== ''; return newData[key] !== originalValues[key]; });
      setHasChanges(hasRealChanges);
      return newData;
    });
  }, [equipo]);

  const registrarCambiosComoMovimiento = useCallback(async (cambiosReales) => {
    if (Object.keys(cambiosReales).length === 0) return;
    const payload = { equipo: equipo.id_inventario, motivo: formData.motivo || "Modificación del equipo desde la interfaz", departamento: formData.departamento || equipo.departamento?.id || '', ubicacion: formData.ubicacion || equipo.ubicacion?.id || '', estado: formData.estado || equipo.estado?.id || '', ...cambiosReales };
    console.log('📝 Registrando movimiento (payload):', payload);
    try { await registrarMovimiento(payload); } catch (error) { console.error('🔴 Error registrando movimiento:', error); throw error; }
  }, [equipo?.id_inventario, formData]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) { console.warn('⚠️ Ya hay un envío en progreso, ignorando...'); return; }
    if (!hasChanges) { console.log('ℹ️ No hay cambios para guardar'); handleClose(); return; }
    if (!equipo?.id_inventario) { console.error('🔴 No hay ID de equipo para actualizar'); return; }
    setIsSubmitting(true);
    submitTimeoutRef.current = setTimeout(() => { console.warn('⚠️ Desbloqueando envío por timeout'); setIsSubmitting(false); }, 30000);
    try {
      const cambiosReales = {};
      const valoresOriginales = { departamento: equipo.departamento?.id, ubicacion: equipo.ubicacion?.id, estado: equipo.estado?.id };
      Object.keys(valoresOriginales).forEach(key => { if (formData[key] && formData[key] !== valoresOriginales[key]) cambiosReales[key] = formData[key]; });
      const datosActualizados = { id_inventario: equipo.id_inventario, nombre: equipo.nombre, elemento: equipo.elemento, marca: equipo.marca, modelo: equipo.modelo, serial: equipo.serial, estado: formData.estado || equipo.estado?.id, ubicacion: formData.ubicacion || equipo.ubicacion?.id, departamento: formData.departamento || equipo.departamento?.id };
      console.log("🔁 Datos que se envían:", datosActualizados);
      console.log("📊 Cambios detectados:", cambiosReales);
      await actualizarEquipo(equipo.id_inventario, datosActualizados);
      if (Object.keys(cambiosReales).length > 0) await registrarCambiosComoMovimiento(cambiosReales);
      console.log('✅ Equipo actualizado exitosamente');
      if (onEquipoActualizado) onEquipoActualizado();
      handleClose();
    } catch (error) {
      console.error("❌ Error al actualizar equipo:", error.response?.data || error.message);
    } finally {
      if (submitTimeoutRef.current) { clearTimeout(submitTimeoutRef.current); submitTimeoutRef.current = null; }
      setIsSubmitting(false);
    }
  }, [isSubmitting, hasChanges, equipo, formData, handleClose, onEquipoActualizado, registrarCambiosComoMovimiento]);

  const handleDialogClose = useCallback((event, reason) => {
    if (isSubmitting) { console.log('⚠️ No se puede cerrar durante el envío'); return; }
    if (hasChanges) { const confirmClose = window.confirm('¿Descartar los cambios no guardados?'); if (!confirmClose) return; }
    handleClose();
  }, [isSubmitting, hasChanges, handleClose]);

  useEffect(() => { return () => { if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current); }; }, []);

  const getEstadoColor = (estado) => {
    const colors = { 'Activo': T.green, 'Inactivo': T.red, 'Mantenimiento': T.yellow, 'Disponible': T.blue };
    return colors[estado] || T.t3;
  };

  if (!equipo || Object.keys(equipo).length === 0) {
    return (
      <Dialog open={open} onClose={handleDialogClose} maxWidth="md" fullWidth
        PaperProps={{ sx: { background: T.bgCard, border: `1px solid ${T.borderStr}`, borderRadius: '10px', color: T.t1, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' } }}
        BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0.65)' } }}>
        <DialogContent sx={{ p: 6, textAlign: 'center' }}>
          <EditIcon sx={{ fontSize: '3.5rem', color: T.t3, mb: 2 }} />
          <Typography sx={{ fontFamily: T.fontDisp, color: T.t1, fontWeight: 600, mb: 3 }}>
            No hay información del equipo disponible para editar
          </Typography>
          <Button onClick={handleDialogClose} variant="outlined"
            sx={{ border: `1px solid ${T.border}`, color: T.t2, borderRadius: '6px', textTransform: 'none', fontFamily: T.fontDisp, fontWeight: 500, fontSize: '0.75rem', '&:hover': { border: `1px solid ${T.borderStr}`, color: T.t1, background: T.bgHover } }}>
            Cerrar
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="md" disableEscapeKeyDown={isSubmitting}
      PaperProps={{ sx: { background: T.bgCard, border: `1px solid ${T.borderStr}`, borderRadius: '10px', color: T.t1, boxShadow: '0 24px 64px rgba(0,0,0,0.7)', maxHeight: '90vh' } }}
      BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0.65)' } }}>
      {/* Header */}
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '8px', background: T.accentDim, border: `1px solid ${T.accentBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EditIcon sx={{ color: T.accent, fontSize: '1.5rem' }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: T.fontDisp, color: T.t1, fontWeight: 700, fontSize: '1.25rem', mb: 0.25 }}>Editar Equipo</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon sx={{ color: T.t3, fontSize: '0.9rem' }} />
                <Typography sx={{ fontFamily: T.fontMono, color: T.t3, fontSize: '0.875rem' }}>{equipo.nombre} - ID: {equipo.id_inventario}</Typography>
              </Box>
            </Box>
          </Box>
          <IconButton onClick={handleDialogClose} disabled={isSubmitting} sx={{ color: T.t3, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, borderRadius: '6px', width: 40, height: 40, '&:hover': { background: T.bgHover, color: T.t1 } }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Current info */}
          <Box sx={{ p: 2.5, background: '#0E0E13', border: `1px solid ${T.border}`, borderRadius: '6px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <InfoIcon sx={{ color: T.blue, fontSize: '0.9rem' }} />
              <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3 }}>Información Actual</Typography>
            </Box>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3, mb: 0.75 }}>Departamento Actual</Typography>
                  <Chip label={equipo.departamento?.nombre || 'No especificado'} sx={{ background: 'rgba(96,165,250,0.1)', color: T.blue, border: '1px solid rgba(96,165,250,0.2)', fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3, mb: 0.75 }}>Estado Actual</Typography>
                  <Chip label={equipo.estado?.nombre || 'Sin estado'} sx={{ bgcolor: `${getEstadoColor(equipo.estado?.nombre)}15`, color: getEstadoColor(equipo.estado?.nombre), border: `1px solid ${getEstadoColor(equipo.estado?.nombre)}35`, fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3, mb: 0.75 }}>Ubicación Actual</Typography>
                  <Chip label={equipo.ubicacion?.fase || 'No especificado'} sx={{ background: T.accentDim, color: T.accent, border: `1px solid ${T.accentBdr}`, fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3, mb: 0.75 }}>Asignado a</Typography>
                  <Chip label={equipo.empleado?.nombre || 'No asignado'} sx={{ background: 'rgba(74,222,128,0.1)', color: T.green, border: '1px solid rgba(74,222,128,0.2)', fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Edit form */}
          <Box sx={{ p: 2.5, background: '#0E0E13', border: `1px solid ${T.border}`, borderRadius: '6px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <EditIcon sx={{ color: T.accent, fontSize: '0.9rem' }} />
              <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3 }}>Modificar Información</Typography>
            </Box>

            {loadingSelectors && (
              <Fade in timeout={300}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4, mb: 2 }}>
                  <CircularProgress size={32} sx={{ color: T.accent }} />
                </Box>
              </Fade>
            )}

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <BusinessIcon sx={{ color: T.t3, fontSize: '1rem' }} />
                  <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3 }}>Departamento</Typography>
                </Box>
                <TextField select fullWidth name="departamento" value={formData.departamento} onChange={handleChange} disabled={isSubmitting || loadingSelectors} sx={inputSx} SelectProps={menuPaperSx}>
                  {departamentos.map(dep => <MenuItem key={dep.id} value={dep.id}>{dep.nombre}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <LocationOnIcon sx={{ color: T.t3, fontSize: '1rem' }} />
                  <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3 }}>Ubicación</Typography>
                </Box>
                <TextField select fullWidth name="ubicacion" value={formData.ubicacion} onChange={handleChange} disabled={isSubmitting || loadingSelectors} sx={inputSx} SelectProps={menuPaperSx}>
                  {ubicaciones.map(ub => <MenuItem key={ub.id} value={ub.id}>{ub.fase}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <CheckCircleIcon sx={{ color: T.t3, fontSize: '1rem' }} />
                  <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3 }}>Estado</Typography>
                </Box>
                <TextField select fullWidth name="estado" value={formData.estado} onChange={handleChange} disabled={isSubmitting || loadingSelectors} sx={inputSx} SelectProps={menuPaperSx}>
                  {estados.map(est => <MenuItem key={est.id} value={est.id}>{est.nombre}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <PersonIcon sx={{ color: T.t3, fontSize: '1rem' }} />
                  <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3 }}>Asignado a (Solo lectura)</Typography>
                </Box>
                <TextField fullWidth value={equipo?.empleado?.nombre || 'No asignado'} InputProps={{ readOnly: true }} disabled={true}
                  sx={{ '& .MuiOutlinedInput-root': { background: 'rgba(255,255,255,0.02)', borderRadius: '6px', '& fieldset': { borderColor: T.border } }, '& .MuiOutlinedInput-input.Mui-disabled': { WebkitTextFillColor: T.t3 } }} />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <DescriptionIcon sx={{ color: T.t3, fontSize: '1rem' }} />
                  <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3 }}>Motivo del cambio</Typography>
                </Box>
                <TextField fullWidth multiline rows={3} name="motivo" value={formData.motivo} onChange={handleChange} disabled={isSubmitting} placeholder="Describe el motivo de los cambios..."
                  sx={{ ...inputSx, '& .MuiInputBase-input::placeholder': { color: T.t3, opacity: 1 } }} />
              </Grid>
            </Grid>

            {hasChanges && (
              <Fade in timeout={300}>
                <Box sx={{ mt: 2.5 }}>
                  <Alert severity="info" sx={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '6px', color: T.blue, '& .MuiAlert-icon': { color: T.blue } }}>
                    Se han detectado cambios. Recuerda guardar antes de cerrar.
                  </Alert>
                </Box>
              </Fade>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 1.5, justifyContent: 'flex-end' }}>
        <Button onClick={handleDialogClose} disabled={isSubmitting} startIcon={<CancelIcon />} variant="outlined"
          sx={{ border: `1px solid ${T.border}`, color: T.t2, borderRadius: '6px', textTransform: 'none', fontFamily: T.fontDisp, fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.04em', minWidth: '120px', '&:hover': { border: `1px solid ${T.borderStr}`, color: T.t1, background: T.bgHover } }}>
          Cancelar
        </Button>

        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting || !hasChanges || loadingSelectors}
          startIcon={isSubmitting ? <CircularProgress size={16} sx={{ color: T.bg }} /> : <SaveIcon />}
          sx={{
            fontFamily: T.fontDisp, fontWeight: 600, borderRadius: '6px', textTransform: 'none', minWidth: '140px', fontSize: '0.75rem', letterSpacing: '0.04em',
            background: hasChanges && !isSubmitting ? T.accent : 'rgba(255,255,255,0.06)',
            boxShadow: 'none',
            color: hasChanges && !isSubmitting ? T.bg : T.t3,
            '&:hover': { background: hasChanges && !isSubmitting ? '#b8924a' : 'rgba(255,255,255,0.06)', boxShadow: 'none' },
            '&:disabled': { background: 'rgba(255,255,255,0.04)', color: T.t3, boxShadow: 'none' }
          }}>
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditarEquipo;
