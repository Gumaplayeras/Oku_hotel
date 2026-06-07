import React, { useEffect, useState } from 'react';
import {
  Typography, TextField, Button, MenuItem,
  CircularProgress, LinearProgress, Fade, Box, Chip, Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ViewIcon from '@mui/icons-material/VisibilityOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { DataGrid } from '@mui/x-data-grid';
import { getEquipos } from '../api/equipos';
import { getDepartamentos } from '../api/departamentos';
import { getEstados } from '../api/estados';
import EquipoDetalle from '../components/Equipos/EquipoDetalle';
import EditarEquipo from '../components/Equipos/EditarEquipo';
import { T, inputSx, menuPaperSx, dgSx } from '../theme/theme';

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

const Equipos = () => {
  const [equipos, setEquipos]             = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searching, setSearching]         = useState(false);
  const [search, setSearch]               = useState('');
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [openModal, setOpenModal]         = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [filtroDep, setFiltroDep]         = useState('');
  const [filtroEst, setFiltroEst]         = useState('');
  const [departamentos, setDepartamentos] = useState([]);
  const [estados, setEstados]             = useState([]);

  useEffect(() => {
    (async () => {
      try { const d = await getEquipos(); setEquipos(d); setFiltered(d); }
      catch (e) { console.error(e); } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    setFiltered(equipos.filter(eq => Object.values(eq).some(v => String(v).toLowerCase().includes(search.toLowerCase()))));
  }, [search, equipos]);

  useEffect(() => {
    (async () => {
      try { const [d, e] = await Promise.all([getDepartamentos(), getEstados()]); setDepartamentos(d); setEstados(e); }
      catch {}
    })();
  }, []);

  const handleBuscar = async () => {
    setSearching(true);
    await new Promise(r => setTimeout(r, 200));
    setFiltered(equipos.filter(eq => {
      const matchText = !search || eq.nombre?.toLowerCase().includes(search.toLowerCase()) || eq.id_inventario?.toLowerCase().includes(search.toLowerCase()) || eq.serial?.toLowerCase().includes(search.toLowerCase()) || eq.empleado?.nombre?.toLowerCase().includes(search.toLowerCase());
      return matchText && (!filtroDep || eq.departamento?.id === filtroDep) && (!filtroEst || eq.estado?.id === filtroEst);
    }));
    setSearching(false);
  };

  const total = equipos.length;
  const asignados = equipos.filter(eq => eq.empleado?.nombre).length;
  const libres = total - asignados;
  const depts = [...new Set(equipos.map(eq => eq.departamento?.nombre).filter(Boolean))].length;

  const columns = [
    { field: 'id_inventario', headerName: 'ID Inventario', flex: 1, minWidth: 130,
      renderCell: p => <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><InventoryOutlinedIcon sx={{ color: T.t3, fontSize: '0.9rem' }} /><Typography sx={{ fontFamily: T.fontMono, fontWeight: 500, color: T.accent, fontSize: '0.8125rem' }}>{p.value}</Typography></Box> },
    { field: 'nombre', headerName: 'Nombre', flex: 1, minWidth: 150,
      renderCell: p => <Typography sx={{ fontFamily: T.fontUI, fontWeight: 500, color: T.t1, fontSize: '0.875rem' }}>{p.value}</Typography> },
    { field: 'elemento', headerName: 'Tipo', flex: 1, minWidth: 110,
      renderCell: p => <Chip label={p.value} size="small" sx={{ background: 'rgba(96,165,250,0.1)', color: T.blue, border: '1px solid rgba(96,165,250,0.2)', fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} /> },
    { field: 'marca', headerName: 'Marca', flex: 1, minWidth: 100,
      renderCell: p => <Typography sx={{ fontFamily: T.fontUI, color: T.t2, fontSize: '0.875rem' }}>{p.value}</Typography> },
    { field: 'modelo', headerName: 'Modelo', flex: 1, minWidth: 120,
      renderCell: p => <Typography sx={{ fontFamily: T.fontUI, color: T.t1, fontSize: '0.875rem' }}>{p.value}</Typography> },
    { field: 'serial', headerName: 'Serial', flex: 1, minWidth: 140,
      renderCell: p => <Typography sx={{ fontFamily: T.fontMono, color: T.t3, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{p.value}</Typography> },
    { field: 'empleado', headerName: 'Empleado', flex: 1, minWidth: 150,
      renderCell: p => p.value?.nombre ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><PersonOutlineIcon sx={{ color: T.green, fontSize: '0.9rem' }} /><Typography sx={{ fontFamily: T.fontUI, color: T.green, fontWeight: 500, fontSize: '0.875rem' }}>{p.value.nombre}</Typography></Box>
      ) : <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.8rem' }}>Sin asignar</Typography> },
    { field: 'actions', headerName: '', minWidth: 160, sortable: false, align: 'center', headerAlign: 'center',
      renderCell: p => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<ViewIcon />} onClick={() => { setSelectedEquipo(p.row); setOpenModal(true); }}
            sx={{ border: `1px solid ${T.border}`, color: T.t2, borderRadius: '6px', textTransform: 'none', fontFamily: T.fontDisp, fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.04em', height: 28, minWidth: 64, '&:hover': { border: `1px solid ${T.borderStr}`, color: T.t1, background: T.bgHover } }}>
            Ver
          </Button>
          <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={() => { setSelectedEquipo(p.row); setOpenEditModal(true); }}
            sx={{ background: T.accent, color: T.bg, borderRadius: '6px', textTransform: 'none', fontFamily: T.fontDisp, fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.04em', height: 28, minWidth: 72, boxShadow: 'none', '&:hover': { background: '#b8924a', boxShadow: 'none' } }}>
            Editar
          </Button>
        </Box>
      ) },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: T.fontDisp, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.01em', color: T.t1, mb: 0.5 }}>
          Equipos
        </Typography>
        <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t3, letterSpacing: '0.01em' }}>
          Inventario y control del parque tecnológico
        </Typography>
      </Box>

      {!loading && equipos.length > 0 && (
        <Fade in timeout={500}>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {[
              { title: 'Total',          value: total,     icon: ComputerOutlinedIcon,    color: T.blue,    subtitle: 'En inventario' },
              { title: 'Asignados',      value: asignados, icon: PersonOutlineIcon,       color: T.green,   subtitle: 'En uso activo' },
              { title: 'Disponibles',    value: libres,    icon: AssignmentOutlinedIcon,  color: T.accent,  subtitle: 'Sin asignar' },
              { title: 'Departamentos',  value: depts,     icon: BusinessOutlinedIcon,    color: T.purple,  subtitle: 'Áreas activas' },
            ].map((c, i) => <Grid item xs={12} sm={6} lg={3} key={i}><StatCard {...c} /></Grid>)}
          </Grid>
        </Fade>
      )}

      {/* Filters */}
      <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', p: 2.5, mb: 2.5 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" label="Buscar equipo, ID, serie…" value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ color: T.t3, fontSize: '1rem', mr: 0.5 }} /> }} sx={inputSx} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth select size="small" label="Departamento" value={filtroDep} onChange={e => setFiltroDep(e.target.value)} sx={inputSx} SelectProps={menuPaperSx}>
              <MenuItem value="">Todos</MenuItem>
              {departamentos.map(d => <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth select size="small" label="Estado" value={filtroEst} onChange={e => setFiltroEst(e.target.value)} sx={inputSx} SelectProps={menuPaperSx}>
              <MenuItem value="">Todos</MenuItem>
              {estados.map(e => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button fullWidth variant="contained" size="small" onClick={handleBuscar} disabled={searching}
                sx={{ background: T.accent, color: T.bg, borderRadius: '6px', textTransform: 'none', fontFamily: T.fontDisp, fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.04em', px: 2, py: 0.875, height: 36, boxShadow: 'none', '&:hover': { background: '#b8924a', boxShadow: 'none' } }}>
                {searching ? <CircularProgress size={14} sx={{ color: T.bg }} /> : 'Buscar'}
              </Button>
              <Button size="small" onClick={() => { setSearch(''); setFiltroDep(''); setFiltroEst(''); setFiltered(equipos); }}
                sx={{ minWidth: 0, px: 1, color: T.t3, borderRadius: '6px', '&:hover': { background: T.bgHover, color: T.t2 } }}>
                ×
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {(loading || searching) && <LinearProgress sx={{ mb: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { background: T.accent } }} />}

      {!loading && filtered.length === 0 ? (
        <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', p: 6, textAlign: 'center' }}>
          <ComputerOutlinedIcon sx={{ fontSize: '2.5rem', color: T.t3, mb: 1.5 }} />
          <Typography sx={{ fontFamily: T.fontDisp, color: T.t1, fontWeight: 600, mb: 0.5 }}>Sin resultados</Typography>
          <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>Ajusta los filtros de búsqueda</Typography>
        </Box>
      ) : (
        <Box sx={{ height: 620, width: '100%' }}>
          <DataGrid rows={filtered} columns={columns} pageSize={20} rowsPerPageOptions={[10, 20, 50]}
            getRowId={r => r.id_inventario} loading={loading} disableRowSelectionOnClick sx={dgSx} />
        </Box>
      )}

      <EquipoDetalle open={openModal} handleClose={() => { setOpenModal(false); setSelectedEquipo(null); }} equipo={selectedEquipo} />
      <EditarEquipo open={openEditModal} handleClose={() => setOpenEditModal(false)} equipo={selectedEquipo}
        onEquipoActualizado={async () => { const d = await getEquipos(); setEquipos(d); setFiltered(d); setOpenEditModal(false); }} />
    </Box>
  );
};

export default Equipos;
