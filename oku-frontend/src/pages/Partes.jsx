import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Paper, TextField, Button, Grid,
  CircularProgress, LinearProgress, Fade, Box, MenuItem, Chip, IconButton
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Search as SearchIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Build as BuildIcon,
  Cancel as CancelIcon,
  DeleteOutline
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getPartes, deleteParte } from '../api/partes';

const ESTADOS_PARTE = [
  { value: 'borrador',   label: 'Borrador',    color: '#94a3b8' },
  { value: 'pendiente',  label: 'Pendiente',   color: '#f59e0b' },
  { value: 'en_proceso', label: 'En proceso',  color: '#3b82f6' },
  { value: 'resuelto',   label: 'Resuelto',    color: '#22c55e' },
  { value: 'cancelado',  label: 'Cancelado',   color: '#ef4444' },
];

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Paper sx={{
    p: 3,
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
        boxShadow: `0 8px 20px ${color}40`,
      },
      '& .stat-value': { color: '#ffffff' },
      '& .stat-title': { color: '#e2e8f0' },
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: '2px',
      background: `linear-gradient(90deg, ${color}, ${color}80, transparent)`,
    },
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="caption" className="stat-title" sx={{
          color: '#94a3b8', fontWeight: 500, fontSize: '0.875rem', mb: 1.5,
          letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'color 0.3s ease', display: 'block'
        }}>
          {title}
        </Typography>
        <Typography variant="h3" className="stat-value" sx={{
          color: '#f1f5f9', fontWeight: 700, fontSize: '2.25rem',
          transition: 'color 0.3s ease', fontFamily: '"Inter", sans-serif', lineHeight: 1.1, mb: 0.5
        }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.4 }}>
          {subtitle}
        </Typography>
      </Box>
      <Box className="stat-icon" sx={{
        width: 60, height: 60, borderRadius: '14px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', backgroundColor: `${color}15`, color: color,
        border: `1px solid ${color}20`, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '& svg': { fontSize: '1.75rem', transition: 'all 0.3s ease' }
      }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

const estadoChip = (estado) => {
  const found = ESTADOS_PARTE.find(e => e.value === estado);
  const label = found?.label || estado || '—';
  const color = found?.color || '#94a3b8';
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
        fontWeight: 600,
        fontSize: '0.78rem',
      }}
    />
  );
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    borderRadius: '12px',
    '& fieldset': { borderColor: 'rgba(71, 85, 105, 0.3)' },
    '&:hover fieldset': { borderColor: 'rgba(96, 165, 250, 0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#60a5fa' },
  },
  '& .MuiInputLabel-root': { color: '#94a3b8' },
  '& .MuiOutlinedInput-input': { color: '#f1f5f9' },
};

const Partes = () => {
  const navigate = useNavigate();
  const [partes, setPartes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    const fetchPartes = async () => {
      try {
        const res = await getPartes();
        const resData = res.data || res;
        const list = Array.isArray(resData) ? resData : resData?.results ?? [];
        setPartes(list);
        setFiltered(list);
      } catch (err) {
        console.error('Error cargando partes:', err);
        setPartes([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPartes();
  }, []);

  const handleBuscar = async () => {
    setSearching(true);
    await new Promise(r => setTimeout(r, 250));
    const result = partes.filter(p => {
      const matchText = search === '' ||
        p.titulo?.toLowerCase().includes(search.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
        p.solicitante?.toLowerCase().includes(search.toLowerCase());
      const matchEstado = filtroEstado === '' || p.estado === filtroEstado;
      return matchText && matchEstado;
    });
    setFiltered(result);
    setSearching(false);
  };

  const handleClear = () => {
    setSearch('');
    setFiltroEstado('');
    setFiltered(partes);
  };

  const handleDelete = async (id) => {
    try {
      await deleteParte(id);
      setPartes(prev => prev.filter(p => p.id !== id));
      setFiltered(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error("Error eliminando parte:", e);
    }
  };

  const total = partes.length;
  const pendientes = partes.filter(p => p.estado === 'pendiente').length;
  const enProceso = partes.filter(p => p.estado === 'en_proceso').length;
  const resueltos = partes.filter(p => p.estado === 'resuelto').length;

  const columns = [
    {
      field: 'numero_parte',
      headerName: 'Nº Parte',
      width: 160,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: '#d4a574', fontFamily: 'monospace', fontSize: '0.8rem' }}>
          {params.value || `#${params.row.id}`}
        </Typography>
      ),
    },
    {
      field: 'emisor_nombre',
      headerName: 'Emisor',
      flex: 1,
      minWidth: 130,
      renderCell: (params) => (
        <Box>
          <Typography sx={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.85rem' }}>
            {params.value || params.row.solicitante || '—'}
          </Typography>
          {params.row.emisor_rol && (
            <Typography sx={{ color: '#64748b', fontSize: '0.72rem' }}>{params.row.emisor_rol}</Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'receptor_nombre',
      headerName: 'Receptor',
      flex: 1,
      minWidth: 130,
      renderCell: (params) => (
        <Box>
          <Typography sx={{ fontWeight: 600, color: '#cbd5e1', fontSize: '0.85rem' }}>
            {params.value || '—'}
          </Typography>
          {params.row.receptor_departamento && (
            <Typography sx={{ color: '#64748b', fontSize: '0.72rem' }}>{params.row.receptor_departamento}</Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'tipo_entrega',
      headerName: 'Tipo',
      flex: 1,
      minWidth: 130,
      renderCell: (params) => params.value ? (
        <Chip label={params.value} size="small" sx={{
          backgroundColor: 'rgba(212,165,116,0.12)', color: '#d4a574',
          border: '1px solid rgba(212,165,116,0.3)', fontWeight: 600, fontSize: '0.72rem'
        }} />
      ) : <Typography sx={{ color: '#475569', fontSize: '0.82rem' }}>—</Typography>,
    },
    {
      field: 'estado',
      headerName: 'Estado',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => estadoChip(params.value),
    },
    {
      field: 'fecha_apertura',
      headerName: 'Fecha',
      flex: 1,
      minWidth: 110,
      renderCell: (params) => (
        <Typography sx={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.82rem' }}>
          {params.value ? new Date(params.value).toLocaleDateString('es-ES') : '—'}
        </Typography>
      ),
    },
    {
      field: 'acciones',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <IconButton 
          size="small" 
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("¿Seguro que deseas eliminar este parte?")) {
               handleDelete(params.row.id);
            }
          }}
          sx={{ color: '#ef4444', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}
        >
          <DeleteOutline fontSize="small" />
        </IconButton>
      ),
    },
  ];


  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h3" sx={{
              color: '#ffffff', fontWeight: 600, fontSize: { xs: '1.875rem', sm: '2.25rem' },
              mb: 1, letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: 2
            }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
              }}>
                <DescriptionIcon sx={{ color: '#ffffff', fontSize: '1.5rem' }} />
              </Box>
              Partes de Trabajo
            </Typography>
            <Typography variant="body1" sx={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: 400, mb: 2 }}>
              Gestión y seguimiento de partes e incidencias
            </Typography>
            <Box sx={{ width: '80px', height: '2px', background: 'linear-gradient(90deg, rgba(99,102,241,0.8), transparent)', borderRadius: '1px' }} />
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/partes/nuevo')}
            sx={{
              fontWeight: 600, borderRadius: '12px', textTransform: 'none',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              px: 3, py: 1.2,
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #3730a3)', transform: 'translateY(-1px)' }
            }}
          >
            Nuevo parte
          </Button>
        </Box>
      </Box>

      {/* Stat cards */}
      {!loading && (
        <Fade in timeout={800}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: { xs: 2, sm: 3 }, mb: 4
          }}>
            <StatCard title="Total Partes" value={total} icon={<DescriptionIcon />} color="#6366f1" subtitle="Todos los partes" />
            <StatCard title="Pendientes" value={pendientes} icon={<PendingIcon />} color="#f59e0b" subtitle="Esperando atención" />
            <StatCard title="En proceso" value={enProceso} icon={<BuildIcon />} color="#3b82f6" subtitle="En curso ahora" />
            <StatCard title="Resueltos" value={resueltos} icon={<CheckCircleIcon />} color="#22c55e" subtitle="Cerrados con éxito" />
          </Box>
        </Fade>
      )}

      {/* Filtros */}
      <Paper sx={{
        p: 3, mb: 4,
        background: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        borderRadius: '16px', backdropFilter: 'blur(20px)'
      }}>
        <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 3, fontWeight: 600 }}>Filtros de Búsqueda</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth label="Buscar por título, solicitante..."
              variant="outlined" value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
              InputProps={{ startAdornment: <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} /> }}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth select label="Estado" value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)} sx={inputSx}>
              <MenuItem value="">Todos</MenuItem>
              {ESTADOS_PARTE.map(e => <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="contained" onClick={handleBuscar} disabled={searching}
                startIcon={searching ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SearchIcon />}
                sx={{
                  fontWeight: 600, borderRadius: '12px', textTransform: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                  '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #3730a3)', transform: 'translateY(-1px)' }
                }}>
                {searching ? 'Buscando...' : 'Buscar'}
              </Button>
              <Button variant="outlined" onClick={handleClear}
                sx={{
                  borderColor: 'rgba(71,85,105,0.5)', color: '#94a3b8', fontWeight: 500,
                  borderRadius: '12px', textTransform: 'none', fontSize: '0.8rem',
                  '&:hover': { borderColor: '#94a3b8', background: 'rgba(71,85,105,0.1)' }
                }}>
                Limpiar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Progress */}
      {(loading || searching) && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress sx={{
            height: 6, borderRadius: 3,
            backgroundColor: 'rgba(71, 85, 105, 0.3)',
            '& .MuiLinearProgress-bar': { borderRadius: 3, background: 'linear-gradient(90deg, #6366f1, #4f46e5)' }
          }} />
        </Box>
      )}

      {/* DataGrid */}
      {!loading && filtered.length === 0 ? (
        <Fade in timeout={600}>
          <Paper sx={{
            p: 6, background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(71, 85, 105, 0.3)',
            borderRadius: '16px', backdropFilter: 'blur(20px)', textAlign: 'center'
          }}>
            <DescriptionIcon sx={{ fontSize: '4rem', color: '#64748b', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 1, fontWeight: 600 }}>
              No hay partes disponibles
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Crea el primer parte con el botón "Nuevo parte" o ajusta los filtros.
            </Typography>
          </Paper>
        </Fade>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSize={20}
            rowsPerPageOptions={[10, 20, 50]}
            loading={loading}
            disableRowSelectionOnClick
            onRowClick={(params) => navigate(`/partes/${params.row.id}`)}
            sx={{
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '16px', backdropFilter: 'blur(20px)',
              fontSize: '0.95rem', color: '#f1f5f9',
              '& .MuiDataGrid-cell': {
                color: '#f1f5f9', borderColor: 'rgba(71, 85, 105, 0.2)',
                padding: '12px',
                '&:focus, &:focus-within': { outline: 'none' },
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgba(15, 23, 42, 0.6)', color: '#f1f5f9',
                fontWeight: 700, borderColor: 'rgba(71, 85, 105, 0.3)',
                letterSpacing: '0.025em', fontSize: '0.9rem',
                borderRadius: '16px 16px 0 0',
              },
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: 'inherit', color: 'inherit',
                '&:focus, &:focus-within': { outline: 'none' },
              },
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.05)' },
              },
              '& .MuiDataGrid-footerContainer': {
                borderColor: 'rgba(71, 85, 105, 0.3)', color: '#94a3b8',
                '& .MuiTablePagination-root': { color: '#94a3b8' },
                '& .MuiIconButton-root': { color: '#94a3b8' },
                '& .MuiSelect-select': { color: '#94a3b8' },
              },
              '& .MuiDataGrid-columnSeparator': { color: 'rgba(71, 85, 105, 0.3)' },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Partes;
