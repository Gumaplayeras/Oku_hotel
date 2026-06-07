import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, TextField, Select, MenuItem, InputAdornment, Tooltip, Alert, Snackbar } from '@mui/material';
import { Delete as DeleteIcon, Search as SearchIcon, FilterList as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';
import { getUsers, deleteUser } from '../api/user';
import { T, inputSx, menuPaperSx } from '../theme/theme';

const selectSx = {
  minWidth: 155, borderRadius: '6px',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border },
  '& .MuiSelect-select': { background: 'rgba(255,255,255,0.03)', color: T.t1, fontFamily: T.fontUI, fontSize: '0.875rem' },
  '& .MuiSvgIcon-root': { color: T.t3 },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: T.borderStr },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: T.accentBdr },
};

export default function UsersManagement() {
  const [users, setUsers]             = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [snackbar, setSnackbar]       = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch]           = useState('');
  const [delegacionFilter, setDelegacionFilter] = useState('');
  const [rolFilter, setRolFilter]     = useState('');
  const [tipoRolFilter, setTipoRolFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  const delegaciones = useMemo(() => { const s = new Set(); users.forEach(u => { if (u.empleado?.delegacion_nombre) s.add(u.empleado.delegacion_nombre); }); return Array.from(s).sort(); }, [users]);
  const roles        = useMemo(() => { const s = new Set(); users.forEach(u => { if (u.empleado?.rol) s.add(u.empleado.rol); }); return Array.from(s).sort(); }, [users]);
  const tiposRol     = useMemo(() => { const s = new Set(); users.forEach(u => { if (u.empleado?.tipo_rol) s.add(u.empleado.tipo_rol); }); return Array.from(s).sort(); }, [users]);
  const hasActiveFilters = useMemo(() => !!(search || delegacionFilter || rolFilter || tipoRolFilter || estadoFilter), [search, delegacionFilter, rolFilter, tipoRolFilter, estadoFilter]);

  const loadUsers = async () => {
    try { setLoading(true); const data = await getUsers(); setUsers(data); setFiltered(data); }
    catch { setSnackbar({ open: true, message: 'Error al cargar los usuarios', severity: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    const s = search.toLowerCase();
    setFiltered(users.filter(u => {
      const fn = `${u.first_name||''} ${u.last_name||''}`.toLowerCase();
      return (!s || (u.username||'').toLowerCase().includes(s) || fn.includes(s) || (u.email||'').toLowerCase().includes(s) || (u.empleado?.delegacion_nombre||'').toLowerCase().includes(s) || (u.empleado?.rol||'').toLowerCase().includes(s))
        && (!delegacionFilter || u.empleado?.delegacion_nombre === delegacionFilter)
        && (!rolFilter || u.empleado?.rol === rolFilter)
        && (!tipoRolFilter || u.empleado?.tipo_rol === tipoRolFilter)
        && (!estadoFilter || (estadoFilter === 'activo' && u.is_active) || (estadoFilter === 'inactivo' && !u.is_active) || (estadoFilter === 'admin' && u.is_staff));
    }));
  }, [search, users, delegacionFilter, rolFilter, tipoRolFilter, estadoFilter]);

  const handleDeleteClick    = (user) => { setSelectedUser(user); setConfirmOpen(true); };
  const clearAllFilters      = () => { setSearch(''); setDelegacionFilter(''); setRolFilter(''); setTipoRolFilter(''); setEstadoFilter(''); };
  const handleConfirmDelete  = async () => {
    if (!selectedUser) return;
    try {
      setDeleting(true);
      await deleteUser(selectedUser.id);
      setConfirmOpen(false);
      setSnackbar({ open: true, message: `Usuario "${selectedUser.username}" eliminado`, severity: 'success' });
      setSelectedUser(null);
      await loadUsers();
    } catch { setSnackbar({ open: true, message: 'Error al eliminar el usuario', severity: 'error' }); }
    finally { setDeleting(false); }
  };

  if (loading) return (
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: T.fontDisp, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.01em', color: T.t1, mb: 0.5 }}>Usuarios</Typography>
        <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t3, letterSpacing: '0.01em' }}>Administra los usuarios con acceso al sistema, sus roles y permisos</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', mt: 6 }}>
        <CircularProgress size={24} sx={{ color: T.accent }} />
        <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>Cargando usuarios…</Typography>
      </Box>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography sx={{ fontFamily: T.fontDisp, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.01em', color: T.t1 }}>Usuarios</Typography>
          <Chip label={`${filtered.length} / ${users.length}`} size="small" sx={{ background: 'rgba(96,165,250,0.1)', color: T.blue, border: '1px solid rgba(96,165,250,0.2)', fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} />
        </Box>
        <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t3, letterSpacing: '0.01em', mt: 0.5 }}>Administra los usuarios con acceso al sistema, sus roles y permisos</Typography>
      </Box>

      <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 2, md: 2.5 }, borderBottom: `1px solid ${T.border}` }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
            <TextField fullWidth size="small" placeholder="Buscar por usuario, nombre, email, delegación…" value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: T.t3, fontSize: '1.1rem' }} /></InputAdornment>,
                endAdornment: search && <InputAdornment position="end"><IconButton size="small" onClick={() => setSearch('')} sx={{ color: T.t3 }}><ClearIcon fontSize="small" /></IconButton></InputAdornment>,
              }}
              sx={inputSx} />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: T.t3 }}>
              <FilterIcon fontSize="small" />
              <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3 }}>Filtros:</Typography>
            </Box>
            <Select size="small" value={delegacionFilter} displayEmpty onChange={e => setDelegacionFilter(e.target.value)} sx={selectSx} MenuProps={menuPaperSx}><MenuItem value=""><em style={{ color: T.t3 }}>Delegación</em></MenuItem>{delegaciones.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}</Select>
            <Select size="small" value={rolFilter} displayEmpty onChange={e => setRolFilter(e.target.value)} sx={selectSx} MenuProps={menuPaperSx}><MenuItem value=""><em style={{ color: T.t3 }}>Rol</em></MenuItem>{roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}</Select>
            <Select size="small" value={tipoRolFilter} displayEmpty onChange={e => setTipoRolFilter(e.target.value)} sx={selectSx} MenuProps={menuPaperSx}><MenuItem value=""><em style={{ color: T.t3 }}>Tipo Rol</em></MenuItem>{tiposRol.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</Select>
            <Select size="small" value={estadoFilter} displayEmpty onChange={e => setEstadoFilter(e.target.value)} sx={selectSx} MenuProps={menuPaperSx}>
              <MenuItem value=""><em style={{ color: T.t3 }}>Estado</em></MenuItem>
              <MenuItem value="activo">Activos</MenuItem>
              <MenuItem value="inactivo">Inactivos</MenuItem>
              <MenuItem value="admin">Admins</MenuItem>
            </Select>
            {hasActiveFilters && (
              <Button size="small" startIcon={<ClearIcon />} onClick={clearAllFilters} variant="outlined"
                sx={{ color: 'rgba(248,113,113,0.7)', borderColor: 'rgba(248,113,113,0.2)', fontFamily: T.fontDisp, fontSize: '0.75rem', borderRadius: '6px', textTransform: 'none', '&:hover': { borderColor: 'rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.06)', color: T.red } }}>
                Limpiar
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-root': { background: T.bgHdr, fontFamily: T.fontDisp, color: T.t3, fontWeight: 600, fontSize: '0.5625rem', letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' } }}>
                {['Usuario','Nombre','Email','Delegación','Depto.','Rol','Tipo Rol','Estado'].map(h => <TableCell key={h}>{h}</TableCell>)}
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id} sx={{ '& .MuiTableCell-root': { borderBottom: `1px solid ${T.border}`, color: T.t1, fontFamily: T.fontUI, fontSize: '0.875rem' }, '&:hover': { background: T.bgHover } }}>
                  <TableCell><Typography sx={{ fontFamily: T.fontMono, color: T.t1, fontWeight: 600, fontSize: '0.875rem' }}>{u.username}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontFamily: T.fontUI, color: T.t2, fontSize: '0.875rem' }}>{u.first_name} {u.last_name}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.82rem' }}>{u.email}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontFamily: T.fontUI, color: T.t2, fontSize: '0.875rem' }}>{u.empleado?.delegacion_nombre || <span style={{ color: T.t3 }}>—</span>}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontFamily: T.fontUI, color: T.t2, fontSize: '0.875rem' }}>{u.empleado?.departamento_nombre || <span style={{ color: T.t3 }}>—</span>}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontFamily: T.fontUI, color: T.t2, fontSize: '0.875rem' }}>{u.empleado?.rol || <span style={{ color: T.t3 }}>—</span>}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontFamily: T.fontUI, color: T.t2, fontSize: '0.875rem' }}>{u.empleado?.tipo_rol || <span style={{ color: T.t3 }}>—</span>}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <Chip size="small" label={u.is_active ? 'Activo' : 'Inactivo'} sx={{ backgroundColor: u.is_active ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: u.is_active ? T.green : T.red, border: `1px solid ${u.is_active ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`, fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} />
                      {u.is_staff && <Chip size="small" label="Admin" sx={{ backgroundColor: 'rgba(96,165,250,0.1)', color: T.blue, border: '1px solid rgba(96,165,250,0.2)', fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} />}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Eliminar usuario">
                      <IconButton size="small" onClick={() => handleDeleteClick(u)} sx={{ color: 'rgba(248,113,113,0.4)', '&:hover': { backgroundColor: 'rgba(248,113,113,0.08)', color: T.red } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 8, borderBottom: 'none' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <SearchIcon sx={{ fontSize: 40, color: T.t3, opacity: 0.3 }} />
                    <Typography sx={{ fontFamily: T.fontDisp, color: T.t1, fontWeight: 600 }}>No se encontraron usuarios</Typography>
                    <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>{hasActiveFilters ? 'Ajusta los filtros' : 'No hay usuarios registrados'}</Typography>
                    {hasActiveFilters && <Button size="small" onClick={clearAllFilters} sx={{ fontFamily: T.fontDisp, color: T.accent, textTransform: 'none', fontSize: '0.875rem' }}>Limpiar filtros</Button>}
                  </Box>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>

      <Dialog open={confirmOpen} onClose={() => !deleting && setConfirmOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: T.bgCard, border: `1px solid ${T.borderStr}`, borderRadius: '10px', color: T.t1, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' } }}
        BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0.65)' } }}>
        <DialogTitle sx={{ fontFamily: T.fontDisp, color: T.t1, fontWeight: 700, pt: 3 }}>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)', color: T.yellow, '& .MuiAlert-icon': { color: T.yellow }, borderRadius: '6px' }}>Esta acción no se puede deshacer</Alert>
          <Typography sx={{ fontFamily: T.fontUI, color: T.t2, fontSize: '0.9rem' }}>¿Eliminar al usuario <strong style={{ color: T.accent }}>{selectedUser?.username}</strong>?</Typography>
          {selectedUser?.empleado && (
            <Box sx={{ mt: 2, p: 2, background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: `1px solid ${T.border}` }}>
              {[['Nombre',`${selectedUser.first_name} ${selectedUser.last_name}`],['Email',selectedUser.email],['Delegación',selectedUser.empleado.delegacion_nombre||'—']].map(([k,v])=>(
                <Typography key={k} sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.82rem', mb: 0.4 }}><span style={{ color: T.t2, fontWeight: 600 }}>{k}:</span> {v}</Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}
            sx={{ border: `1px solid ${T.border}`, color: T.t2, borderRadius: '6px', textTransform: 'none', fontFamily: T.fontDisp, fontWeight: 500, fontSize: '0.75rem', '&:hover': { border: `1px solid ${T.borderStr}`, color: T.t1, background: T.bgHover } }}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} disabled={deleting} variant="contained" sx={{ backgroundColor: T.red, borderRadius: '6px', textTransform: 'none', fontFamily: T.fontDisp, fontWeight: 600, fontSize: '0.75rem', boxShadow: 'none', '&:hover': { backgroundColor: '#dc2626', boxShadow: 'none' } }}>
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: '6px' }} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
