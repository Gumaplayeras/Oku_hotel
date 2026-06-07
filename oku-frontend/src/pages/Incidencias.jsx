import React, { useEffect, useState } from 'react';
import {
  Typography, Paper, TextField, Box,
  CircularProgress, LinearProgress, Fade, Chip
} from '@mui/material';
import {
  BugReport as BugIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getIncidencias } from '../api/incidencias';

const ESTADOS = {
  abierta:    { label: 'Abierta',     color: '#f59e0b' },
  en_proceso: { label: 'En proceso',  color: '#3b82f6' },
  resuelta:   { label: 'Resuelta',    color: '#22c55e' },
  cerrada:    { label: 'Cerrada',     color: '#22c55e' },
  cancelada:  { label: 'Cancelada',   color: '#ef4444' },
  pendiente:  { label: 'Pendiente',   color: '#f59e0b' },
};

const resolveEstado = (raw) => {
  if (!raw) return { label: '—', color: '#64748b' };
  const key = String(raw).toLowerCase().replace(/\s+/g, '_');
  if (ESTADOS[key]) return ESTADOS[key];
  return { label: raw, color: '#94a3b8' };
};

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Paper sx={{
    p: 3, height: '100%',
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderRadius: '16px', position: 'relative', overflow: 'hidden',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'default',
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)',
      background: 'rgba(30, 41, 59, 0.8)',
      border: `1px solid ${color}40`,
      boxShadow: `0 20px 40px -12px ${color}20`,
      '& .stat-icon': {
        transform: 'scale(1.1)', backgroundColor: color,
        color: '#ffffff', boxShadow: `0 8px 20px ${color}40`,
      },
    },
    '&::before': {
      content: '""', position: 'absolute',
      top: 0, left: 0, right: 0, height: '2px',
      background: `linear-gradient(90deg, ${color}, ${color}80, transparent)`,
    },
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="caption" sx={{
          color: '#94a3b8', fontWeight: 500, fontSize: '0.875rem',
          mb: 1.5, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block',
        }}>
          {title}
        </Typography>
        <Typography variant="h3" sx={{
          color: '#f1f5f9', fontWeight: 700, fontSize: '2.25rem',
          fontFamily: '"Inter", sans-serif', lineHeight: 1.1, mb: 0.5,
        }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.4 }}>
          {subtitle}
        </Typography>
      </Box>
      <Box className="stat-icon" sx={{
        width: 60, height: 60, borderRadius: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: `${color}15`, color: color,
        border: `1px solid ${color}20`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '& svg': { fontSize: '1.75rem', transition: 'all 0.3s ease' },
      }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

const inputSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(51, 65, 85, 0.3)', borderRadius: '12px',
    '& fieldset': { borderColor: 'rgba(71, 85, 105, 0.3)' },
    '&:hover fieldset': { borderColor: 'rgba(239, 68, 68, 0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#ef4444' },
  },
  '& .MuiInputLabel-root': { color: '#94a3b8' },
  '& .MuiOutlinedInput-input': { color: '#f1f5f9' },
};

const Incidencias = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchIncidencias = async () => {
      try {
        const data = await getIncidencias();
        setIncidencias(data);
        setFiltered(data);
      } catch (error) {
        console.error('Error al obtener las incidencias:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidencias();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(incidencias);
      return;
    }
    const s = search.toLowerCase();
    setFiltered(incidencias.filter(inc =>
      inc.titulo?.toLowerCase().includes(s) ||
      String(inc.estado || '').toLowerCase().includes(s) ||
      String(inc.asignado_a || '').toLowerCase().includes(s)
    ));
  }, [search, incidencias]);

  const abiertas = incidencias.filter(i => {
    const e = String(i.estado || '').toLowerCase();
    return e === 'abierta' || e === 'pendiente';
  }).length;
  const enProceso = incidencias.filter(i => String(i.estado || '').toLowerCase() === 'en_proceso').length;
  const resueltas = incidencias.filter(i => {
    const e = String(i.estado || '').toLowerCase();
    return e === 'resuelta' || e === 'cerrada';
  }).length;

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      renderCell: (params) => (
        <Typography sx={{ color: '#64748b', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem' }}>
          #{params.value}
        </Typography>
      ),
    },
    {
      field: 'titulo',
      headerName: 'Título',
      flex: 2,
      minWidth: 220,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem' }}>
          {params.value || '—'}
        </Typography>
      ),
    },
    {
      field: 'estado',
      headerName: 'Estado',
      flex: 1,
      minWidth: 130,
      renderCell: (params) => {
        const { label, color } = resolveEstado(params.value);
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
      },
    },
    {
      field: 'asignado_a',
      headerName: 'Asignado a',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => params.value ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon sx={{ color: '#3b82f6', fontSize: '1.1rem' }} />
          <Typography sx={{ color: '#cbd5e1', fontWeight: 500, fontSize: '0.875rem' }}>
            {params.value}
          </Typography>
        </Box>
      ) : (
        <Typography sx={{ color: '#475569', fontStyle: 'italic', fontSize: '0.85rem' }}>Sin asignar</Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{
          color: '#ffffff', fontWeight: 600,
          fontSize: { xs: '1.875rem', sm: '2.25rem', md: '2.5rem' },
          mb: 1, letterSpacing: '-0.025em',
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '12px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
          }}>
            <BugIcon sx={{ color: '#ffffff', fontSize: '1.5rem' }} />
          </Box>
          Gestión de Incidencias
        </Typography>
        <Typography variant="body1" sx={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: 400, mb: 3 }}>
          Seguimiento y resolución de incidencias IT
        </Typography>
        <Box sx={{
          width: '80px', height: '2px',
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.8), transparent)',
          borderRadius: '1px',
        }} />
      </Box>

      {/* Stat cards */}
      {!loading && (
        <Fade in timeout={800}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: { xs: 2, sm: 3 }, mb: 4,
          }}>
            <StatCard
              title="Total"
              value={incidencias.length}
              icon={<BugIcon />}
              color="#ef4444"
              subtitle="Incidencias registradas"
            />
            <StatCard
              title="Abiertas"
              value={abiertas}
              icon={<WarningIcon />}
              color="#f59e0b"
              subtitle="Requieren atención"
            />
            <StatCard
              title="En Proceso"
              value={enProceso}
              icon={<BuildIcon />}
              color="#3b82f6"
              subtitle="En curso ahora"
            />
            <StatCard
              title="Resueltas"
              value={resueltas}
              icon={<CheckIcon />}
              color="#22c55e"
              subtitle="Cerradas con éxito"
            />
          </Box>
        </Fade>
      )}

      {/* Search */}
      <Paper sx={{
        p: 3, mb: 4,
        background: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        borderRadius: '16px', backdropFilter: 'blur(20px)',
      }}>
        <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 2.5, fontWeight: 600, fontSize: '1rem' }}>
          Búsqueda
        </Typography>
        <TextField
          fullWidth
          label="Buscar por título, estado o responsable..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} /> }}
          sx={inputSx}
        />
      </Paper>

      {/* Loading bar */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress sx={{
            height: 6, borderRadius: 3,
            backgroundColor: 'rgba(71, 85, 105, 0.3)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: 'linear-gradient(90deg, #ef4444, #dc2626)',
            },
          }} />
        </Box>
      )}

      {/* DataGrid or empty state */}
      {!loading && filtered.length === 0 ? (
        <Fade in timeout={600}>
          <Paper sx={{
            p: 6,
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            borderRadius: '16px', backdropFilter: 'blur(20px)',
            textAlign: 'center',
          }}>
            <BugIcon sx={{ fontSize: '4rem', color: '#64748b', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 1, fontWeight: 600 }}>
              No se encontraron incidencias
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              {search ? 'Prueba con otro término de búsqueda.' : 'No hay incidencias registradas en el sistema.'}
            </Typography>
          </Paper>
        </Fade>
      ) : (
        <Box sx={{ height: 620, width: '100%' }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSize={20}
            rowsPerPageOptions={[10, 20, 50]}
            loading={loading}
            disableRowSelectionOnClick
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
              '& .MuiDataGrid-columnSeparator': { color: 'rgba(71, 85, 105, 0.3)' },
              '& .MuiDataGrid-footerContainer': {
                background: 'rgba(15, 23, 42, 0.6)', color: '#f1f5f9',
                borderColor: 'rgba(71, 85, 105, 0.3)', borderRadius: '0 0 16px 16px',
                '& .MuiTablePagination-root': { color: '#94a3b8' },
                '& .MuiIconButton-root': { color: '#94a3b8' },
                '& .MuiSelect-select': { color: '#94a3b8' },
              },
              '& .MuiDataGrid-row': {
                borderColor: 'rgba(71, 85, 105, 0.2)',
                '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.04)' },
                '&.Mui-selected': {
                  background: 'transparent',
                  '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.04)' },
                },
                '&:focus, &:focus-within': { outline: 'none' },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Incidencias;
