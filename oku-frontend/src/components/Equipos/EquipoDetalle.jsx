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
  TextField,
  Chip,
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
import { T, inputSx } from '../../theme/theme';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <Box sx={{
    background: T.bgCard,
    borderTop: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}`,
    borderBottom: `1px solid ${T.border}`, borderLeft: `2px solid ${color}`,
    borderRadius: '1px 6px 6px 1px', p: '20px 22px',
    '&:hover': { background: '#16161C' },
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.75 }}>
      <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.t3 }}>{title}</Typography>
      <Icon sx={{ fontSize: '0.875rem', color: T.t3, opacity: 0.7 }} />
    </Box>
    <Typography sx={{ fontFamily: T.fontMono, fontSize: '1.75rem', fontWeight: 500, color: T.t1, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</Typography>
    <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.6875rem', color: T.t3, mt: 0.75 }}>{subtitle}</Typography>
  </Box>
);

const EquipoDetalle = ({ open, handleClose, equipo }) => {
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [filtroTextoLibre, setFiltroTextoLibre] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

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

  const handleDialogClose = useCallback((event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown' || !reason) {
      setMovimientos([]);
      setLoadingMovimientos(false);
      setFiltroTextoLibre('');
      setFiltroFecha('');
      handleClose();
    }
  }, [handleClose]);

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

  const getEstadoColor = (estado) => {
    const colors = {
      'Activo': T.green,
      'Inactivo': T.red,
      'Mantenimiento': T.yellow,
      'Disponible': T.blue,
    };
    return colors[estado] || T.t3;
  };

  if (!equipo || Object.keys(equipo).length === 0) {
    return (
      <Dialog open={open} onClose={handleDialogClose} maxWidth="lg" fullWidth
        PaperProps={{ sx: { background: T.bgCard, border: `1px solid ${T.borderStr}`, borderRadius: '10px', color: T.t1, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' } }}
        BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0.65)' } }}>
        <DialogContent sx={{ p: 6, textAlign: 'center' }}>
          <InfoIcon sx={{ fontSize: '3.5rem', color: T.t3, mb: 2 }} />
          <Typography sx={{ fontFamily: T.fontDisp, color: T.t1, fontWeight: 600, mb: 3 }}>
            No hay información del equipo disponible
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
    <Dialog open={open} onClose={handleDialogClose} maxWidth="lg" fullWidth
      PaperProps={{ sx: { background: T.bgCard, border: `1px solid ${T.borderStr}`, borderRadius: '10px', color: T.t1, boxShadow: '0 24px 64px rgba(0,0,0,0.7)', maxHeight: '90vh' } }}
      BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0.65)' } }}
      keepMounted={false}>
      {/* Header */}
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '8px', background: T.accentDim, border: `1px solid ${T.accentBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ComputerIcon sx={{ color: T.accent, fontSize: '1.5rem' }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: T.fontDisp, color: T.t1, fontWeight: 700, fontSize: '1.25rem', mb: 0.25 }}>
                {equipo.nombre || 'Equipo'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon sx={{ color: T.t3, fontSize: '0.9rem' }} />
                <Typography sx={{ fontFamily: T.fontMono, color: T.t3, fontSize: '0.875rem' }}>
                  ID: {equipo.id_inventario}
                </Typography>
              </Box>
            </Box>
          </Box>

          <IconButton onClick={handleDialogClose} sx={{ color: T.t3, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, borderRadius: '6px', width: 40, height: 40, '&:hover': { background: T.bgHover, color: T.t1 } }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
            <StatCard title="Empleado Asignado" value={equipo.empleado?.nombre ? "Asignado" : "Libre"} icon={PersonIcon} color={equipo.empleado?.nombre ? T.green : T.t3} subtitle={equipo.empleado?.nombre || "Sin asignar"} />
            <StatCard title="Ubicación" value={equipo.ubicacion?.fase || "N/A"} icon={LocationOnIcon} color={T.blue} subtitle="Fase actual" />
            <StatCard title="Estado" value={equipo.estado?.nombre || "N/A"} icon={BusinessIcon} color={getEstadoColor(equipo.estado?.nombre)} subtitle="Estado actual" />
          </Box>

          {/* Technical info */}
          <Box sx={{ p: 2.5, background: '#0E0E13', border: `1px solid ${T.border}`, borderRadius: '6px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <ComputerIcon sx={{ color: T.accent, fontSize: '0.9rem' }} />
              <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3 }}>
                Especificaciones Técnicas
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                {[['Elemento', equipo.elemento], ['Marca', equipo.marca], ['Departamento', equipo.departamento?.nombre]].map(([label, val]) => (
                  <Box key={label} sx={{ mb: 2.5 }}>
                    <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3, mb: 0.5 }}>{label}</Typography>
                    <Typography sx={{ fontFamily: T.fontUI, color: T.t1, fontWeight: 600 }}>{val || 'No especificado'}</Typography>
                  </Box>
                ))}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2.5 }}>
                  <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3, mb: 0.5 }}>Modelo</Typography>
                  <Typography sx={{ fontFamily: T.fontUI, color: T.t1, fontWeight: 600 }}>{equipo.modelo || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3, mb: 0.5 }}>Serial</Typography>
                  <Box sx={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`, borderRadius: '6px', p: 1.5 }}>
                    <Typography sx={{ fontFamily: T.fontMono, color: T.t1, fontWeight: 500, fontSize: '0.95rem' }}>{equipo.serial || 'No especificado'}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Movement history */}
          <Box sx={{ p: 2.5, background: '#0E0E13', border: `1px solid ${T.border}`, borderRadius: '6px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <HistoryIcon sx={{ color: T.accent, fontSize: '0.9rem' }} />
              <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3 }}>
                Historial de Movimientos
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Buscar en movimientos" variant="outlined" value={filtroTextoLibre} onChange={(e) => setFiltroTextoLibre(e.target.value)}
                  InputProps={{ startAdornment: <SearchIcon sx={{ color: T.t3, mr: 1 }} /> }} sx={inputSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Filtrar por fecha" type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} InputLabelProps={{ shrink: true }} sx={inputSx} />
              </Grid>
            </Grid>

            {loadingMovimientos ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={36} sx={{ color: T.accent, mb: 2 }} />
                  <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>Cargando movimientos...</Typography>
                </Box>
              </Box>
            ) : movimientosFiltrados.length > 0 ? (
              <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {movimientosFiltrados.map((mov, idx) => (
                  <Fade in={true} timeout={300 + idx * 100} key={mov.uniqueId || idx}>
                    <Box sx={{ mb: 1.5, p: 2, background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.border}`, borderRadius: '6px', '&:hover': { background: T.bgHover, borderColor: T.borderStr } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarTodayIcon sx={{ fontSize: '0.875rem', color: T.t3 }} />
                          <Typography sx={{ fontFamily: T.fontUI, color: T.t2, fontWeight: 600, fontSize: '0.875rem' }}>
                            {new Date(mov.fecha).toLocaleString()}
                          </Typography>
                        </Box>
                        <Chip label={mov.descripcion || mov.motivo || 'Sin motivo'} size="small" sx={{ background: T.accentDim, color: T.accent, border: `1px solid ${T.accentBdr}`, fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: '0.875rem', color: T.t3 }} />
                        <Typography sx={{ fontFamily: T.fontUI, color: T.t2, fontSize: '0.875rem' }}>
                          <strong style={{ color: T.t1 }}>Realizado por:</strong> {mov.realizado_por_nombre || mov.realizado_por || 'Usuario no especificado'}
                        </Typography>
                      </Box>
                    </Box>
                  </Fade>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <HistoryIcon sx={{ fontSize: '3rem', color: T.t3, opacity: 0.3, mb: 2 }} />
                <Typography sx={{ fontFamily: T.fontDisp, color: T.t2, fontWeight: 600, mb: 0.5 }}>No hay movimientos</Typography>
                <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>No se encontraron movimientos que coincidan con los filtros aplicados</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EquipoDetalle;
