import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, TextField, Button, Grid, CircularProgress, LinearProgress, Box, MenuItem, Chip, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { DataGrid } from '@mui/x-data-grid';
import { getPartes, deleteParte } from '../api/partes';
import { T, inputSx, menuPaperSx, dgSx } from '../theme/theme';

const ESTADOS = [
  { value: 'borrador',   label: 'Borrador',   color: T.t3 },
  { value: 'pendiente',  label: 'Pendiente',  color: T.yellow },
  { value: 'en_proceso', label: 'En proceso', color: T.blue },
  { value: 'resuelto',   label: 'Resuelto',   color: T.green },
  { value: 'cancelado',  label: 'Cancelado',  color: T.red },
];

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
    <Typography sx={{ fontFamily: T.fontMono, fontSize: '2.25rem', fontWeight: 500, color: T.t1, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</Typography>
    <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.6875rem', color: T.t3, mt: 0.75 }}>{subtitle}</Typography>
  </Box>
);

const estadoChip = val => {
  const e = ESTADOS.find(x => x.value === val);
  const label = e?.label || val || '—';
  const color = e?.color || T.t3;
  const getBg = c => {
    if (c === T.green) return 'rgba(74,222,128,0.1)';
    if (c === T.red) return 'rgba(248,113,113,0.1)';
    if (c === T.blue) return 'rgba(96,165,250,0.1)';
    if (c === T.yellow) return 'rgba(251,191,36,0.1)';
    return 'rgba(255,255,255,0.05)';
  };
  const getBdr = c => {
    if (c === T.green) return 'rgba(74,222,128,0.2)';
    if (c === T.red) return 'rgba(248,113,113,0.2)';
    if (c === T.blue) return 'rgba(96,165,250,0.2)';
    if (c === T.yellow) return 'rgba(251,191,36,0.2)';
    return T.border;
  };
  return <Chip label={label} size="small" sx={{ background: getBg(color), color, border: `1px solid ${getBdr(color)}`, fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} />;
};

const Partes = () => {
  const navigate = useNavigate();
  const [partes, setPartes]       = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searching, setSearching] = useState(false);
  const [search, setSearch]       = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getPartes();
        const list = Array.isArray(res.data || res) ? (res.data || res) : (res.data?.results ?? res?.results ?? []);
        setPartes(list); setFiltered(list);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const handleBuscar = async () => {
    setSearching(true); await new Promise(r => setTimeout(r, 200));
    setFiltered(partes.filter(p => {
      const m = !search || p.titulo?.toLowerCase().includes(search.toLowerCase()) || p.solicitante?.toLowerCase().includes(search.toLowerCase());
      return m && (!filtroEstado || p.estado === filtroEstado);
    }));
    setSearching(false);
  };

  const handleDelete = async id => {
    try { await deleteParte(id); setPartes(p => p.filter(x => x.id !== id)); setFiltered(f => f.filter(x => x.id !== id)); } catch {}
  };

  const columns = [
    { field: 'numero_parte', headerName: 'Nº Parte', width: 150,
      renderCell: p => <Typography sx={{ fontFamily: T.fontMono, fontWeight: 500, color: T.accent, fontSize: '0.8125rem' }}>{p.value || `#${p.row.id}`}</Typography> },
    { field: 'emisor_nombre', headerName: 'Emisor', flex: 1, minWidth: 130,
      renderCell: p => <Box><Typography sx={{ fontFamily: T.fontUI, fontWeight: 600, color: T.t1, fontSize: '0.875rem' }}>{p.value || p.row.solicitante || '—'}</Typography>{p.row.emisor_rol && <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.72rem' }}>{p.row.emisor_rol}</Typography>}</Box> },
    { field: 'receptor_nombre', headerName: 'Receptor', flex: 1, minWidth: 130,
      renderCell: p => <Box><Typography sx={{ fontFamily: T.fontUI, fontWeight: 500, color: T.t2, fontSize: '0.875rem' }}>{p.value || '—'}</Typography>{p.row.receptor_departamento && <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.72rem' }}>{p.row.receptor_departamento}</Typography>}</Box> },
    { field: 'tipo_entrega', headerName: 'Tipo', flex: 1, minWidth: 130,
      renderCell: p => p.value ? <Chip label={p.value} size="small" sx={{ background: T.accentDim, color: T.accent, border: `1px solid ${T.accentBdr}`, fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} /> : <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.8rem' }}>—</Typography> },
    { field: 'estado', headerName: 'Estado', flex: 1, minWidth: 120, renderCell: p => estadoChip(p.value) },
    { field: 'fecha_apertura', headerName: 'Fecha', flex: 1, minWidth: 100,
      renderCell: p => <Typography sx={{ fontFamily: T.fontMono, color: T.t3, fontSize: '0.8rem' }}>{p.value ? new Date(p.value).toLocaleDateString('es-ES') : '—'}</Typography> },
    { field: '_del', headerName: '', width: 48, sortable: false,
      renderCell: p => <IconButton size="small" onClick={e => { e.stopPropagation(); if (window.confirm('¿Eliminar?')) handleDelete(p.row.id); }} sx={{ color: 'rgba(248,113,113,0.4)', '&:hover': { background: 'rgba(248,113,113,0.08)', color: T.red } }}><DeleteOutlineIcon sx={{ fontSize: '1rem' }} /></IconButton> },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontFamily: T.fontDisp, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.01em', color: T.t1, mb: 0.5 }}>
            Partes de Trabajo
          </Typography>
          <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t3, letterSpacing: '0.01em' }}>
            Gestión y seguimiento de partes e incidencias
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} endIcon={<ArrowForwardIcon />} onClick={() => navigate('/partes/nuevo')}
          sx={{ background: T.accent, color: T.bg, borderRadius: '6px', textTransform: 'none', fontFamily: T.fontDisp, fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.04em', px: 2, py: 0.875, boxShadow: 'none', '&:hover': { background: '#b8924a', boxShadow: 'none' } }}>
          Nuevo parte
        </Button>
      </Box>

      {!loading && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {[
            { title: 'Total',      value: partes.length,                                 icon: DescriptionOutlinedIcon, color: T.accent,  subtitle: 'Todos los partes' },
            { title: 'Pendientes', value: partes.filter(p=>p.estado==='pendiente').length, icon: HourglassEmptyIcon,     color: T.yellow,  subtitle: 'Sin atender' },
            { title: 'En Proceso', value: partes.filter(p=>p.estado==='en_proceso').length,icon: BuildOutlinedIcon,      color: T.blue,    subtitle: 'En curso' },
            { title: 'Resueltos',  value: partes.filter(p=>p.estado==='resuelto').length, icon: CheckCircleOutlineIcon,  color: T.green,   subtitle: 'Finalizados' },
          ].map((c, i) => <Grid item xs={12} sm={6} lg={3} key={i}><StatCard {...c} /></Grid>)}
        </Grid>
      )}

      <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', p: 2.5, mb: 2.5 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={5}>
            <TextField fullWidth size="small" label="Buscar por título o solicitante…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBuscar()}
              InputProps={{ startAdornment: <SearchIcon sx={{ color: T.t3, fontSize: '1rem', mr: 0.5 }} /> }} sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth select size="small" label="Estado" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} sx={inputSx} SelectProps={menuPaperSx}>
              <MenuItem value="">Todos</MenuItem>
              {ESTADOS.map(e => <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button fullWidth variant="contained" size="small" onClick={handleBuscar} disabled={searching}
                sx={{ background: T.accent, color: T.bg, borderRadius: '6px', textTransform: 'none', fontFamily: T.fontDisp, fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.04em', height: 36, boxShadow: 'none', '&:hover': { background: '#b8924a', boxShadow: 'none' } }}>
                {searching ? <CircularProgress size={14} sx={{ color: T.bg }} /> : 'Buscar'}
              </Button>
              <Button size="small" onClick={() => { setSearch(''); setFiltroEstado(''); setFiltered(partes); }}
                sx={{ minWidth: 0, px: 1, color: T.t3, borderRadius: '6px', '&:hover': { background: T.bgHover, color: T.t2 } }}>×</Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {(loading || searching) && <LinearProgress sx={{ mb: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { background: T.accent } }} />}

      {!loading && filtered.length === 0 ? (
        <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', p: 6, textAlign: 'center' }}>
          <DescriptionOutlinedIcon sx={{ fontSize: '2.5rem', color: T.t3, mb: 1.5 }} />
          <Typography sx={{ fontFamily: T.fontDisp, color: T.t1, fontWeight: 600, mb: 0.5 }}>Sin partes</Typography>
          <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>Crea el primer parte o ajusta los filtros</Typography>
        </Box>
      ) : (
        <Box sx={{ height: 580, width: '100%' }}>
          <DataGrid rows={filtered} columns={columns} pageSize={20} rowsPerPageOptions={[10, 20, 50]} loading={loading} disableRowSelectionOnClick onRowClick={p => navigate(`/partes/${p.row.id}`)} sx={dgSx} />
        </Box>
      )}
    </Box>
  );
};

export default Partes;
