import React, { useEffect, useState } from 'react';
import { Typography, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, TextField, Button, Grid, MenuItem, Snackbar, Alert, Box, LinearProgress, Chip } from '@mui/material';
import { SwapHoriz as MovimientoIcon, Add as AddIcon } from '@mui/icons-material';
import { getMovimientos, crearMovimiento } from '../api/movimientos';
import { getEquipos } from '../api/equipos';
import { getDepartamentos } from '../api/departamentos';
import { getEstados } from '../api/estados';
import { getUbicaciones } from '../api/ubicaciones';
import { T, inputSx, menuPaperSx } from '../theme/theme';

const safeDisplay = (v) => { if (v === null || v === undefined) return '—'; if (typeof v === 'object') return JSON.stringify(v); return String(v); };

const Movimientos = () => {
  const [movimientos, setMovimientos]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [success, setSuccess]           = useState(false);
  const [error, setError]               = useState('');
  const [formData, setFormData]         = useState({ equipo: '', motivo: '', departamento: '', ubicacion: '', estado: '' });
  const [equipos, setEquipos]           = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ubicaciones, setUbicaciones]   = useState([]);
  const [estados, setEstados]           = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [eq, dep, ub, est, mov] = await Promise.all([getEquipos(), getDepartamentos(), getUbicaciones(), getEstados(), getMovimientos()]);
        setEquipos(eq||[]); setDepartamentos(dep||[]); setUbicaciones(ub||[]); setEstados(est||[]); setMovimientos(mov||[]);
      } catch { setError('Error al cargar los datos.'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!formData.equipo || !formData.motivo || !formData.departamento || !formData.ubicacion || !formData.estado) { setError('Todos los campos son obligatorios.'); return; }
    try {
      setSubmitting(true); setError('');
      const eq  = equipos.find(e => e.id_inventario === formData.equipo);
      const dep = departamentos.find(d => d.id === parseInt(formData.departamento));
      const ub  = ubicaciones.find(u => u.id === parseInt(formData.ubicacion));
      const est = estados.find(s => s.id === parseInt(formData.estado));
      if (!eq || !dep || !ub || !est) { setError('Selección inválida.'); return; }
      await crearMovimiento({ equipo: eq.id_inventario, motivo: formData.motivo, departamento: dep.id, ubicacion: ub.id, estado: est.id });
      const updated = await getMovimientos();
      setMovimientos(updated||[]);
      setFormData({ equipo: '', motivo: '', departamento: '', ubicacion: '', estado: '' });
      setSuccess(true);
    } catch { setError('Error al crear el movimiento.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: T.fontDisp, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.01em', color: T.t1, mb: 0.5 }}>Movimientos</Typography>
        <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t3, letterSpacing: '0.01em' }}>Registro de traslados y cambios de estado del inventario</Typography>
      </Box>
      <LinearProgress sx={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { background: T.accent } }} />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: T.fontDisp, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.01em', color: T.t1, mb: 0.5 }}>Movimientos</Typography>
        <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t3, letterSpacing: '0.01em' }}>Registro de traslados y cambios de estado del inventario</Typography>
      </Box>

      {/* Form */}
      <Box sx={{ p: { xs: 2.5, sm: 3 }, mb: 4, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <AddIcon sx={{ color: T.accent, fontSize: '1.1rem' }} />
          <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3 }}>Nuevo Movimiento</Typography>
        </Box>
        {(equipos.length > 0 && departamentos.length > 0) ? (
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}><TextField select fullWidth label="Equipo" name="equipo" value={formData.equipo} onChange={handleChange} required sx={inputSx} SelectProps={menuPaperSx}><MenuItem value=""><em style={{ color: T.t3 }}>Seleccione un equipo</em></MenuItem>{equipos.map(e => <MenuItem key={e.id_inventario} value={e.id_inventario}>{safeDisplay(e.id_inventario)}{e.nombre && <span style={{ color: T.t3, marginLeft: 8 }}>· {e.nombre}</span>}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Motivo" name="motivo" value={formData.motivo} onChange={handleChange} required placeholder="Descripción del motivo" sx={inputSx} /></Grid>
            <Grid item xs={12} sm={6}><TextField select fullWidth label="Departamento" name="departamento" value={formData.departamento} onChange={handleChange} required sx={inputSx} SelectProps={menuPaperSx}><MenuItem value=""><em style={{ color: T.t3 }}>Seleccione departamento</em></MenuItem>{departamentos.map(d => <MenuItem key={d.id} value={d.id.toString()}>{safeDisplay(d.nombre)}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} sm={6}><TextField select fullWidth label="Ubicación" name="ubicacion" value={formData.ubicacion} onChange={handleChange} required sx={inputSx} SelectProps={menuPaperSx}><MenuItem value=""><em style={{ color: T.t3 }}>Seleccione ubicación</em></MenuItem>{ubicaciones.map(u => <MenuItem key={u.id} value={u.id.toString()}>{safeDisplay(u.fase)}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} sm={6}><TextField select fullWidth label="Estado" name="estado" value={formData.estado} onChange={handleChange} required sx={inputSx} SelectProps={menuPaperSx}><MenuItem value=""><em style={{ color: T.t3 }}>Seleccione estado</em></MenuItem>{estados.map(e => <MenuItem key={e.id} value={e.id.toString()}>{safeDisplay(e.nombre)}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12}><Button variant="contained" onClick={handleSubmit} disabled={submitting} startIcon={submitting ? <CircularProgress size={14} sx={{ color: T.bg }} /> : <AddIcon />}
              sx={{ background: T.accent, color: T.bg, borderRadius: '6px', textTransform: 'none', fontFamily: T.fontDisp, fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.04em', px: 2, py: 0.875, boxShadow: 'none', '&:hover': { background: '#b8924a', boxShadow: 'none' }, '&:disabled': { opacity: 0.5 } }}>
              {submitting ? 'Registrando…' : 'Registrar Movimiento'}
            </Button></Grid>
          </Grid>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
            <CircularProgress size={20} sx={{ color: T.accent }} />
            <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>Cargando datos del formulario…</Typography>
          </Box>
        )}
      </Box>

      {/* Table */}
      <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 2, sm: 2.5 }, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3 }}>Registro de Movimientos</Typography>
          <Chip label={`${movimientos.length} registros`} size="small" sx={{ background: 'rgba(96,165,250,0.1)', color: T.blue, border: '1px solid rgba(96,165,250,0.2)', fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} />
        </Box>
        {error && !submitting ? (
          <Box sx={{ p: 3 }}><Alert severity="error" sx={{ borderRadius: '6px', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.18)', color: T.red, '& .MuiAlert-icon': { color: T.red } }}>{error}</Alert></Box>
        ) : movimientos.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <MovimientoIcon sx={{ fontSize: '3rem', color: T.t3, opacity: 0.3, mb: 2 }} />
            <Typography sx={{ fontFamily: T.fontDisp, color: T.t1, fontWeight: 600, mb: 1 }}>Sin movimientos registrados</Typography>
            <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>Los movimientos que registres aparecerán aquí.</Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ '& .MuiTableCell-root': { background: T.bgHdr, fontFamily: T.fontDisp, color: T.t3, fontWeight: 600, fontSize: '0.5625rem', letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` } }}>
                  {['Equipo','Fecha','Motivo','Departamento','Ubicación','Estado','Por'].map(h => <TableCell key={h}>{h}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {movimientos.map(mov => {
                  const dep = departamentos.find(d => d?.id === mov?.departamento);
                  const ub  = ubicaciones.find(u => u?.id === mov?.ubicacion);
                  const est = estados.find(e => e?.id === mov?.estado);
                  return (
                    <TableRow key={mov.id || Math.random()} sx={{ '& .MuiTableCell-root': { borderBottom: `1px solid ${T.border}`, color: T.t1, fontFamily: T.fontUI, fontSize: '0.875rem' }, '&:hover': { background: T.bgHover } }}>
                      <TableCell><Typography sx={{ fontFamily: T.fontMono, color: T.accent, fontWeight: 500, fontSize: '0.85rem' }}>{safeDisplay(mov.equipo)}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontFamily: T.fontMono, color: T.t3, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{mov?.fecha ? new Date(mov.fecha).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontFamily: T.fontUI, color: T.t1, fontSize: '0.875rem' }}>{safeDisplay(mov.motivo)}</Typography></TableCell>
                      <TableCell><Chip label={safeDisplay(dep?.nombre)} size="small" sx={{ background: 'rgba(96,165,250,0.1)', color: T.blue, border: '1px solid rgba(96,165,250,0.2)', fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} /></TableCell>
                      <TableCell><Typography sx={{ fontFamily: T.fontUI, color: T.t2, fontSize: '0.875rem' }}>{safeDisplay(ub?.fase)}</Typography></TableCell>
                      <TableCell><Chip label={safeDisplay(est?.nombre)} size="small" sx={{ background: 'rgba(74,222,128,0.1)', color: T.green, border: '1px solid rgba(74,222,128,0.2)', fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} /></TableCell>
                      <TableCell><Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>{safeDisplay(mov.realizado_por)}</Typography></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>

      <Snackbar open={success} autoHideDuration={5000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" sx={{ borderRadius: '6px' }} onClose={() => setSuccess(false)}>Movimiento registrado correctamente</Alert>
      </Snackbar>
      <Snackbar open={!!error && !submitting} autoHideDuration={5000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: '6px' }} onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Movimientos;
