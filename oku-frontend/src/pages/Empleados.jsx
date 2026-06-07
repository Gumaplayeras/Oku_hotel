import React, { useEffect, useState } from 'react';
import { Typography, TextField, Box, Chip, LinearProgress, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { DataGrid } from '@mui/x-data-grid';
import { getEmpleados } from '../api/empleados';
import { T, inputSx, dgSx } from '../theme/theme';

const DEPT_PAL = [T.blue, T.green, T.accent, T.purple, '#06b6d4', '#ec4899', '#f97316', '#0ea5e9'];
const deptColor = d => { if (!d) return T.t3; let h = 0; for (let i = 0; i < d.length; i++) h = d.charCodeAt(i) + ((h << 5) - h); return DEPT_PAL[Math.abs(h) % DEPT_PAL.length]; };

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

const Empleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    (async () => { try { const d = await getEmpleados(); setEmpleados(d); setFiltered(d); } catch {} finally { setLoading(false); } })();
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(empleados); return; }
    const s = search.toLowerCase();
    setFiltered(empleados.filter(e => e.nombre?.toLowerCase().includes(s) || e.email?.toLowerCase().includes(s) || e.departamento_nombre?.toLowerCase().includes(s)));
  }, [search, empleados]);

  const depts = [...new Set(empleados.map(e => e.departamento_nombre).filter(Boolean))].length;

  const columns = [
    { field: 'id', headerName: 'ID', width: 68, renderCell: p => <Typography sx={{ fontFamily: T.fontMono, color: T.t3, fontSize: '0.8rem' }}>#{p.value}</Typography> },
    { field: 'nombre', headerName: 'Empleado', flex: 1, minWidth: 200,
      renderCell: p => {
        const ini = p.value ? p.value.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase() : '?';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '5px', flexShrink: 0, background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.fontMono, fontSize: '0.72rem', fontWeight: 700, color: T.green }}>{ini}</Box>
            <Typography sx={{ fontFamily: T.fontUI, fontWeight: 600, color: T.t1, fontSize: '0.875rem' }}>{p.value || '—'}</Typography>
          </Box>
        );
      } },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 220,
      renderCell: p => <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>{p.value && <EmailOutlinedIcon sx={{ color: T.t3, fontSize: '0.875rem' }} />}<Typography sx={{ fontFamily: T.fontUI, color: T.t2, fontSize: '0.875rem' }}>{p.value || <span style={{ color: T.t3 }}>—</span>}</Typography></Box> },
    { field: 'departamento_nombre', headerName: 'Departamento', flex: 1, minWidth: 160,
      renderCell: p => {
        if (!p.value) return <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.8rem' }}>—</Typography>;
        const c = deptColor(p.value);
        return <Chip label={p.value} size="small" sx={{ background: `${c}18`, color: c, border: `1px solid ${c}28`, fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} />;
      } },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: T.fontDisp, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.01em', color: T.t1, mb: 0.5 }}>
          Empleados
        </Typography>
        <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t3, letterSpacing: '0.01em' }}>
          Directorio de personal y departamentos
        </Typography>
      </Box>

      {!loading && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {[
            { title: 'Total',        value: empleados.length,                         icon: PeopleOutlinedIcon,   color: T.green,   subtitle: 'En el directorio' },
            { title: 'Departamentos', value: depts,                                   icon: BusinessOutlinedIcon, color: T.blue,    subtitle: 'Áreas activas' },
            { title: 'Con Email',    value: empleados.filter(e=>e.email).length,       icon: EmailOutlinedIcon,    color: T.accent,  subtitle: 'Contacto registrado' },
            { title: 'Resultados',   value: filtered.length,                          icon: PersonOutlineIcon,    color: T.purple,  subtitle: 'Según filtro actual' },
          ].map((c, i) => <Grid item xs={12} sm={6} lg={3} key={i}><StatCard {...c} /></Grid>)}
        </Grid>
      )}

      <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', p: 2.5, mb: 2.5 }}>
        <TextField fullWidth size="small" label="Buscar por nombre, email o departamento…" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: T.t3, fontSize: '1rem', mr: 0.5 }} /> }} sx={inputSx} />
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { background: T.green } }} />}

      {!loading && filtered.length === 0 ? (
        <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', p: 6, textAlign: 'center' }}>
          <PeopleOutlinedIcon sx={{ fontSize: '2.5rem', color: T.t3, mb: 1.5 }} />
          <Typography sx={{ fontFamily: T.fontDisp, color: T.t1, fontWeight: 600, mb: 0.5 }}>Sin resultados</Typography>
          <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>Prueba con otro término de búsqueda</Typography>
        </Box>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid rows={filtered} columns={columns} pageSize={20} rowsPerPageOptions={[10, 20, 50]} loading={loading} disableRowSelectionOnClick sx={dgSx} />
        </Box>
      )}
    </Box>
  );
};

export default Empleados;
