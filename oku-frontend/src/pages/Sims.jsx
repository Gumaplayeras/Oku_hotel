import React, { useEffect, useState } from 'react';
import {
  Typography, Paper, TextField, Box,
  CircularProgress, LinearProgress, Fade, Chip, MenuItem
} from '@mui/material';
import {
  SimCard as SimCardIcon,
  Search as SearchIcon,
  Wifi as WifiIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getSims } from '../api/sims';

const OPERATOR_COLORS = {
  movistar: '#0066ff',
  vodafone: '#e60000',
  orange:   '#ff6600',
  yoigo:    '#6db33f',
  masmovil: '#00b32c',
};

const getOperatorColor = (op) => {
  if (!op) return '#8b5cf6';
  const key = op.toLowerCase().trim();
  for (const [brand, color] of Object.entries(OPERATOR_COLORS)) {
    if (key.includes(brand)) return color;
  }
  return '#8b5cf6';
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
    '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
  },
  '& .MuiInputLabel-root': { color: '#94a3b8' },
  '& .MuiOutlinedInput-input': { color: '#f1f5f9' },
  '& .MuiSelect-select': { color: '#f1f5f9' },
  '& .MuiSelect-icon': { color: '#94a3b8' },
};

const Sims = () => {
  const [sims, setSims] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [operadorFilter, setOperadorFilter] = useState('');

  useEffect(() => {
    const fetchSims = async () => {
      try {
        const data = await getSims();
        setSims(data);
        setFiltered(data);
      } catch (error) {
        console.error('Error al obtener las SIMs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSims();
  }, []);

  useEffect(() => {
    let result = sims;
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(sim =>
        sim.iccid?.toLowerCase().includes(s) ||
        sim.numero?.toLowerCase().includes(s) ||
        sim.operador?.toLowerCase().includes(s)
      );
    }
    if (operadorFilter) {
      result = result.filter(sim =>
        (sim.operador || '').toLowerCase().includes(operadorFilter.toLowerCase())
      );
    }
    setFiltered(result);
  }, [search, operadorFilter, sims]);

  const operadores = [...new Set(sims.map(s => s.operador).filter(Boolean))].sort();

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
      field: 'iccid',
      headerName: 'ICCID',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SimCardIcon sx={{ color: '#8b5cf6', fontSize: '1.1rem', flexShrink: 0 }} />
          <Typography sx={{
            fontFamily: 'monospace', color: '#a78bfa',
            fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.03em',
          }}>
            {params.value || '—'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'numero',
      headerName: 'Nº Teléfono',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {params.value && <PhoneIcon sx={{ color: '#475569', fontSize: '1rem', flexShrink: 0 }} />}
          <Typography sx={{ color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 500, fontSize: '0.9rem' }}>
            {params.value || <span style={{ color: '#475569', fontStyle: 'italic' }}>Sin número</span>}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'operador',
      headerName: 'Operador',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => {
        if (!params.value) return (
          <Typography sx={{ color: '#475569', fontStyle: 'italic', fontSize: '0.85rem' }}>Sin operador</Typography>
        );
        const color = getOperatorColor(params.value);
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              backgroundColor: `${color}18`,
              color: color,
              border: `1px solid ${color}35`,
              fontWeight: 600,
              fontSize: '0.78rem',
            }}
          />
        );
      },
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
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)',
          }}>
            <SimCardIcon sx={{ color: '#ffffff', fontSize: '1.5rem' }} />
          </Box>
          Gestión de SIMs
        </Typography>
        <Typography variant="body1" sx={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: 400, mb: 3 }}>
          Inventario y control de tarjetas SIM corporativas
        </Typography>
        <Box sx={{
          width: '80px', height: '2px',
          background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.8), transparent)',
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
              title="Total SIMs"
              value={sims.length}
              icon={<SimCardIcon />}
              color="#8b5cf6"
              subtitle="En el inventario"
            />
            <StatCard
              title="Operadores"
              value={operadores.length}
              icon={<BusinessIcon />}
              color="#0891b2"
              subtitle="Compañías distintas"
            />
            <StatCard
              title="Con Número"
              value={sims.filter(s => s.numero).length}
              icon={<PhoneIcon />}
              color="#22c55e"
              subtitle="Número de línea asignado"
            />
            <StatCard
              title="Resultados"
              value={filtered.length}
              icon={<WifiIcon />}
              color="#f59e0b"
              subtitle="Según filtros activos"
            />
          </Box>
        </Fade>
      )}

      {/* Filters */}
      <Paper sx={{
        p: 3, mb: 4,
        background: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        borderRadius: '16px', backdropFilter: 'blur(20px)',
      }}>
        <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 2.5, fontWeight: 600, fontSize: '1rem' }}>
          Filtros de Búsqueda
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Buscar por ICCID o número..."
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} /> }}
            sx={{ ...inputSx, flex: 1, minWidth: 220 }}
          />
          <TextField
            select
            label="Operador"
            value={operadorFilter}
            onChange={(e) => setOperadorFilter(e.target.value)}
            sx={{ ...inputSx, minWidth: 180 }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    background: '#1e293b', color: '#f1f5f9',
                    '& .MuiMenuItem-root:hover': { background: 'rgba(139, 92, 246, 0.15)' },
                  },
                },
              },
            }}
          >
            <MenuItem value="">Todos los operadores</MenuItem>
            {operadores.map((op) => (
              <MenuItem key={op} value={op}>{op}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {/* Loading bar */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress sx={{
            height: 6, borderRadius: 3,
            backgroundColor: 'rgba(71, 85, 105, 0.3)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
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
            <SimCardIcon sx={{ fontSize: '4rem', color: '#64748b', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 1, fontWeight: 600 }}>
              No se encontraron SIMs
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              {search || operadorFilter
                ? 'Prueba con otros filtros de búsqueda.'
                : 'No hay SIMs registradas en el inventario.'}
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
                '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.05)' },
                '&.Mui-selected': {
                  background: 'transparent',
                  '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.05)' },
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

export default Sims;
