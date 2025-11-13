import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { getUsers, deleteUser } from '../api/user';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Filtros
  const [search, setSearch] = useState('');
  const [delegacionFilter, setDelegacionFilter] = useState('');
  const [rolFilter, setRolFilter] = useState('');
  const [tipoRolFilter, setTipoRolFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  // Opciones de filtros dinámicos
  const delegaciones = useMemo(() => {
    const set = new Set();
    users.forEach((u) => {
      if (u.empleado?.delegacion_nombre) {
        set.add(u.empleado.delegacion_nombre);
      }
    });
    return Array.from(set).sort();
  }, [users]);

  const roles = useMemo(() => {
    const set = new Set();
    users.forEach((u) => {
      if (u.empleado?.rol) {
        set.add(u.empleado.rol);
      }
    });
    return Array.from(set).sort();
  }, [users]);

  const tiposRol = useMemo(() => {
    const set = new Set();
    users.forEach((u) => {
      if (u.empleado?.tipo_rol) {
        set.add(u.empleado.tipo_rol);
      }
    });
    return Array.from(set).sort();
  }, [users]);

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return search || delegacionFilter || rolFilter || tipoRolFilter || estadoFilter;
  }, [search, delegacionFilter, rolFilter, tipoRolFilter, estadoFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setFiltered(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setSnackbar({
        open: true,
        message: 'Error al cargar los usuarios',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const s = search.toLowerCase();
    const f = users.filter((u) => {
      const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
      const delegacion = (u.empleado?.delegacion_nombre || '').toLowerCase();
      const rol = (u.empleado?.rol || '').toLowerCase();
      const tipoRol = (u.empleado?.tipo_rol || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      const email = (u.email || '').toLowerCase();

      const matchesSearch =
        !s ||
        username.includes(s) ||
        fullName.includes(s) ||
        email.includes(s) ||
        delegacion.includes(s) ||
        rol.includes(s) ||
        tipoRol.includes(s);

      const matchesDelegacion =
        !delegacionFilter || u.empleado?.delegacion_nombre === delegacionFilter;
      const matchesRol = !rolFilter || u.empleado?.rol === rolFilter;
      const matchesTipoRol = !tipoRolFilter || u.empleado?.tipo_rol === tipoRolFilter;

      const matchesEstado =
        !estadoFilter ||
        (estadoFilter === 'activo' && u.is_active) ||
        (estadoFilter === 'inactivo' && !u.is_active) ||
        (estadoFilter === 'admin' && u.is_staff);

      return (
        matchesSearch &&
        matchesDelegacion &&
        matchesRol &&
        matchesTipoRol &&
        matchesEstado
      );
    });
    setFiltered(f);
  }, [search, users, delegacionFilter, rolFilter, tipoRolFilter, estadoFilter]);

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      setDeleting(true);
      await deleteUser(selectedUser.id);
      setConfirmOpen(false);
      setSnackbar({
        open: true,
        message: `Usuario "${selectedUser.username}" eliminado correctamente`,
        severity: 'success',
      });
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el usuario',
        severity: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setDelegacionFilter('');
    setRolFilter('');
    setTipoRolFilter('');
    setEstadoFilter('');
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <CircularProgress size={48} sx={{ color: '#60a5fa' }} />
        <Typography sx={{ color: '#9ca3af' }}>Cargando usuarios...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          background: 'rgba(15, 23, 42, 0.95)',
          borderRadius: 3,
          border: '1px solid rgba(148, 163, 184, 0.2)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              color: '#e5e7eb',
              fontWeight: 700,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            Gestión de Usuarios
            <Chip
              label={`${filtered.length} de ${users.length}`}
              size="small"
              sx={{
                backgroundColor: 'rgba(59,130,246,0.15)',
                color: '#60a5fa',
                fontWeight: 600,
              }}
            />
          </Typography>
          <Typography variant="body1" sx={{ color: '#9ca3af' }}>
            Administra los usuarios con acceso al sistema, sus roles y permisos
          </Typography>
        </Box>

        {/* Búsqueda y filtros */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              mb: 2,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por usuario, nombre, email, delegación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#9ca3af' }} />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearch('')}
                      sx={{ color: '#9ca3af' }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  color: '#e5e7eb',
                  '&:hover': {
                    backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  },
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#9ca3af' }}>
              <FilterIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Filtros:
              </Typography>
            </Box>

            <Select
              size="small"
              value={delegacionFilter}
              displayEmpty
              onChange={(e) => setDelegacionFilter(e.target.value)}
              sx={{
                minWidth: 180,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(148,163,184,0.3)',
                },
                '& .MuiSelect-select': {
                  backgroundColor: 'rgba(30,41,59,0.5)',
                  color: delegacionFilter ? '#e5e7eb' : '#9ca3af',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(148,163,184,0.5)',
                },
              }}
            >
              <MenuItem value="">
                <em>Todas las delegaciones</em>
              </MenuItem>
              {delegaciones.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>

            <Select
              size="small"
              value={rolFilter}
              displayEmpty
              onChange={(e) => setRolFilter(e.target.value)}
              sx={{
                minWidth: 160,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(148,163,184,0.3)',
                },
                '& .MuiSelect-select': {
                  backgroundColor: 'rgba(30,41,59,0.5)',
                  color: rolFilter ? '#e5e7eb' : '#9ca3af',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(148,163,184,0.5)',
                },
              }}
            >
              <MenuItem value="">
                <em>Todos los roles</em>
              </MenuItem>
              {roles.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>

            <Select
              size="small"
              value={tipoRolFilter}
              displayEmpty
              onChange={(e) => setTipoRolFilter(e.target.value)}
              sx={{
                minWidth: 180,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(148,163,184,0.3)',
                },
                '& .MuiSelect-select': {
                  backgroundColor: 'rgba(30,41,59,0.5)',
                  color: tipoRolFilter ? '#e5e7eb' : '#9ca3af',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(148,163,184,0.5)',
                },
              }}
            >
              <MenuItem value="">
                <em>Todos los tipos de rol</em>
              </MenuItem>
              {tiposRol.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>

            <Select
              size="small"
              value={estadoFilter}
              displayEmpty
              onChange={(e) => setEstadoFilter(e.target.value)}
              sx={{
                minWidth: 160,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(148,163,184,0.3)',
                },
                '& .MuiSelect-select': {
                  backgroundColor: 'rgba(30,41,59,0.5)',
                  color: estadoFilter ? '#e5e7eb' : '#9ca3af',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(148,163,184,0.5)',
                },
              }}
            >
              <MenuItem value="">
                <em>Todos los estados</em>
              </MenuItem>
              <MenuItem value="activo">Activos</MenuItem>
              <MenuItem value="inactivo">Inactivos</MenuItem>
              <MenuItem value="admin">Administradores</MenuItem>
            </Select>

            {hasActiveFilters && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearAllFilters}
                sx={{
                  color: '#f87171',
                  borderColor: 'rgba(248,113,113,0.3)',
                  '&:hover': {
                    borderColor: 'rgba(248,113,113,0.5)',
                    backgroundColor: 'rgba(248,113,113,0.1)',
                  },
                }}
                variant="outlined"
              >
                Limpiar filtros
              </Button>
            )}
          </Box>
        </Box>

        {/* Tabla */}
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}>
                <TableCell sx={{ color: '#cbd5e1', fontWeight: 600 }}>Usuario</TableCell>
                <TableCell sx={{ color: '#cbd5e1', fontWeight: 600 }}>Nombre</TableCell>
                <TableCell sx={{ color: '#cbd5e1', fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ color: '#cbd5e1', fontWeight: 600 }}>Delegación</TableCell>
                <TableCell sx={{ color: '#cbd5e1', fontWeight: 600 }}>Departamento</TableCell>
                <TableCell sx={{ color: '#cbd5e1', fontWeight: 600 }}>Rol</TableCell>
                <TableCell sx={{ color: '#cbd5e1', fontWeight: 600 }}>Tipo Rol</TableCell>
                <TableCell sx={{ color: '#cbd5e1', fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ color: '#cbd5e1', fontWeight: 600 }} align="right">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => (
                <TableRow
                  key={u.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(30, 41, 59, 0.3)',
                    },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <TableCell sx={{ color: '#e5e7eb', fontWeight: 500 }}>
                    {u.username}
                  </TableCell>
                  <TableCell sx={{ color: '#e5e7eb' }}>
                    {u.first_name} {u.last_name}
                  </TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{u.email}</TableCell>
                  <TableCell sx={{ color: '#e5e7eb' }}>
                    {u.empleado?.delegacion_nombre || (
                      <span style={{ color: '#64748b' }}>Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell sx={{ color: '#e5e7eb' }}>
                    {u.empleado?.departamento_nombre || (
                      <span style={{ color: '#64748b' }}>Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell sx={{ color: '#e5e7eb' }}>
                    {u.empleado?.rol || <span style={{ color: '#64748b' }}>Sin asignar</span>}
                  </TableCell>
                  <TableCell sx={{ color: '#e5e7eb' }}>
                    {u.empleado?.tipo_rol || (
                      <span style={{ color: '#64748b' }}>Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        label={u.is_active ? 'Activo' : 'Inactivo'}
                        sx={{
                          backgroundColor: u.is_active
                            ? 'rgba(34,197,94,0.15)'
                            : 'rgba(239,68,68,0.15)',
                          color: u.is_active ? '#4ade80' : '#f87171',
                          fontWeight: 600,
                          border: `1px solid ${u.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        }}
                      />
                      {u.is_staff && (
                        <Chip
                          size="small"
                          label="Admin"
                          sx={{
                            backgroundColor: 'rgba(59,130,246,0.15)',
                            color: '#60a5fa',
                            fontWeight: 600,
                            border: '1px solid rgba(59,130,246,0.3)',
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Eliminar usuario">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(u)}
                        sx={{
                          color: '#f87171',
                          '&:hover': {
                            backgroundColor: 'rgba(239,68,68,0.15)',
                            color: '#ef4444',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <SearchIcon sx={{ fontSize: 48, color: '#475569' }} />
                      <Typography variant="h6" sx={{ color: '#94a3b8' }}>
                        No se encontraron usuarios
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {hasActiveFilters
                          ? 'Intenta ajustar los filtros de búsqueda'
                          : 'No hay usuarios registrados en el sistema'}
                      </Typography>
                      {hasActiveFilters && (
                        <Button
                          size="small"
                          onClick={clearAllFilters}
                          sx={{ color: '#60a5fa' }}
                        >
                          Limpiar filtros
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        {/* Diálogo de confirmación */}
        <Dialog
          open={confirmOpen}
          onClose={() => !deleting && setConfirmOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(30, 41, 59, 0.98)',
              backgroundImage: 'none',
              border: '1px solid rgba(148,163,184,0.2)',
            },
          }}
        >
          <DialogTitle sx={{ color: '#e5e7eb', fontWeight: 600 }}>
            Confirmar eliminación
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Esta acción no se puede deshacer
            </Alert>
            <Typography sx={{ color: '#cbd5e1' }}>
              ¿Estás seguro de que deseas eliminar al usuario{' '}
              <strong style={{ color: '#60a5fa' }}>{selectedUser?.username}</strong>?
            </Typography>
            {selectedUser?.empleado && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(15,23,42,0.5)', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 0.5 }}>
                  <strong>Nombre:</strong> {selectedUser.first_name} {selectedUser.last_name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 0.5 }}>
                  <strong>Email:</strong> {selectedUser.email}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  <strong>Delegación:</strong>{' '}
                  {selectedUser.empleado.delegacion_nombre || 'Sin asignar'}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
              sx={{ color: '#94a3b8' }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleting}
              variant="contained"
              color="error"
              sx={{
                backgroundColor: '#ef4444',
                '&:hover': {
                  backgroundColor: '#dc2626',
                },
              }}
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}