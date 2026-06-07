import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, LinearProgress, Fade, Button, TextField, MenuItem, Tabs, Tab, Chip } from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon, Router as RouterIcon, CheckCircle as CheckIcon, Error as ErrorIcon, SettingsEthernet as PortIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getSummary, getSwitchesList, getInaccessible } from '../api/recolectorApi';
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

const Redes = () => {
  const navigate = useNavigate();
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary]     = useState(null);
  const [switches, setSwitches]   = useState([]);
  const [inaccessible, setInaccessible] = useState([]);
  const [tab, setTab]             = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [reachableFilter, setReachableFilter] = useState('');
  const [poeFilter, setPoeFilter] = useState('');

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [sumData, swData, inaccData] = await Promise.all([
        getSummary(),
        getSwitchesList({ q: searchQuery, vendor: vendorFilter, reachable: reachableFilter, poe: poeFilter }),
        getInaccessible(),
      ]);
      setSummary(sumData); setSwitches(swData); setInaccessible(inaccData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, [searchQuery, vendorFilter, reachableFilter, poeFilter]);

  const colsSwitches = [
    { field: 'hostname', headerName: 'Hostname', flex: 1, minWidth: 150, renderCell: p => <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><RouterIcon sx={{ color: T.t3, fontSize: '1.1rem' }} /><Typography sx={{ fontFamily: T.fontUI, fontWeight: 600, color: T.t1 }}>{p.value || 'Desconocido'}</Typography></Box> },
    { field: 'ip', headerName: 'IP', width: 140, renderCell: p => <Typography sx={{ fontFamily: T.fontMono, color: T.blue, fontWeight: 600 }}>{p.value}</Typography> },
    { field: 'vendor_profile', headerName: 'Vendor', width: 110, renderCell: p => <Typography sx={{ fontFamily: T.fontUI, color: T.t2 }}>{p.value?.toUpperCase()}</Typography> },
    { field: 'model', headerName: 'Modelo', flex: 1, minWidth: 120, renderCell: p => <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.85rem' }}>{p.value}</Typography> },
    { field: 'os_version', headerName: 'OS', width: 140, renderCell: p => <Typography sx={{ fontFamily: T.fontMono, color: T.t3, fontSize: '0.8rem' }}>{p.value}</Typography> },
    { field: 'ports', headerName: 'Puertos', width: 110, renderCell: p => <Typography sx={{ fontFamily: T.fontUI, color: T.t1, fontWeight: 500 }}>{p.row.used_ports} / {p.row.total_ports_seen}</Typography> },
    { field: 'mac_count', headerName: 'MACs', width: 80, align: 'center', headerAlign: 'center', renderCell: p => <Typography sx={{ fontFamily: T.fontUI, color: T.t1 }}>{p.value}</Typography> },
    { field: 'reachable', headerName: 'Estado', width: 130, align: 'center', headerAlign: 'center',
      renderCell: p => p.value
        ? <Chip label="Online" size="small" sx={{ background: 'rgba(74,222,128,0.1)', color: T.green, border: '1px solid rgba(74,222,128,0.2)', fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} />
        : <Chip label="Offline" size="small" sx={{ background: 'rgba(248,113,113,0.1)', color: T.red, border: '1px solid rgba(248,113,113,0.2)', fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} /> },
  ];

  const colsInac = [
    { field: 'ip', headerName: 'IP', width: 150, renderCell: p => <Typography sx={{ fontFamily: T.fontMono, color: T.red, fontWeight: 700 }}>{p.value}</Typography> },
    { field: 'error', headerName: 'Error', flex: 1, minWidth: 260, renderCell: p => <Typography sx={{ fontFamily: T.fontUI, color: 'rgba(248,113,113,0.8)', fontSize: '0.85rem' }}>{p.value || 'Error desconocido'}</Typography> },
    { field: 'attempted_profiles', headerName: 'Perfiles probados', flex: 1, minWidth: 200, renderCell: p => <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.85rem' }}>{p.value?.join(', ')}</Typography> },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3, mb: 3.5 }}>
        <Box>
          <Typography sx={{ fontFamily: T.fontDisp, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.01em', color: T.t1, mb: 0.5 }}>
            Redes
          </Typography>
          <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t3, letterSpacing: '0.01em' }}>
            Monitorización en tiempo real de switches Aruba y Ruckus
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={refreshing ? <CircularProgress size={14} /> : <RefreshIcon />} onClick={fetchData} disabled={loading || refreshing}
          sx={{ border: `1px solid ${T.border}`, color: T.t2, borderRadius: '6px', textTransform: 'none', fontFamily: T.fontDisp, fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.04em', '&:hover': { border: `1px solid ${T.borderStr}`, color: T.t1, background: T.bgHover } }}>
          {refreshing ? 'Actualizando…' : 'Actualizar'}
        </Button>
      </Box>

      {!loading && summary && (
        <Fade in timeout={600}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(4,1fr)' }, gap: 2.5, mb: 4 }}>
            <StatCard title="Total Switches" value={summary.total_switches} icon={RouterIcon} color={T.blue} subtitle={`${summary.vendors?.Aruba||0} Aruba · ${summary.vendors?.Ruckus||0} Ruckus`} />
            <StatCard title="Online" value={summary.reachable} icon={CheckIcon} color={T.green} subtitle="Respondiendo OK" />
            <StatCard title="Inaccesibles" value={summary.inaccessible} icon={ErrorIcon} color={T.red} subtitle="Requieren atención" />
            <StatCard title="Dispositivos" value={summary.total_macs} icon={PortIcon} color={T.purple} subtitle={`${summary.total_neighbors||0} vecinos detectados`} />
          </Box>
        </Fade>
      )}

      {(loading && !summary) ? (
        <Box sx={{ mb: 3 }}><LinearProgress sx={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { background: T.accent } }} /></Box>
      ) : (
        <Box>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{
            mb: 3,
            '& .MuiTab-root': { fontFamily: T.fontDisp, color: T.t3, textTransform: 'none', fontSize: '0.875rem', fontWeight: 500 },
            '& .Mui-selected': { color: `${T.accent} !important` },
            '& .MuiTabs-indicator': { background: T.accent, height: 2 },
          }}>
            <Tab label="Todos los Switches" />
            <Tab label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Inaccesibles
                {inaccessible.length > 0 && (
                  <Box sx={{ background: T.red, color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontFamily: T.fontMono, fontWeight: 700 }}>
                    {inaccessible.length}
                  </Box>
                )}
              </Box>
            } />
          </Tabs>

          {tab === 0 && (
            <Fade in timeout={350}>
              <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <TextField placeholder="Buscar IP o Hostname…" variant="outlined" size="small" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} sx={{ ...inputSx, minWidth: 240 }} InputProps={{ startAdornment: <SearchIcon sx={{ color: T.t3, mr: 1 }} /> }} />
                  <TextField select label="Fabricante" size="small" value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} sx={{ ...inputSx, minWidth: 150 }} SelectProps={menuPaperSx}><MenuItem value="">Todos</MenuItem><MenuItem value="Aruba">Aruba</MenuItem><MenuItem value="Ruckus">Ruckus</MenuItem></TextField>
                  <TextField select label="Estado" size="small" value={reachableFilter} onChange={e => setReachableFilter(e.target.value)} sx={{ ...inputSx, minWidth: 140 }} SelectProps={menuPaperSx}><MenuItem value="">Todos</MenuItem><MenuItem value="true">Online</MenuItem><MenuItem value="false">Offline</MenuItem></TextField>
                  <TextField select label="PoE" size="small" value={poeFilter} onChange={e => setPoeFilter(e.target.value)} sx={{ ...inputSx, minWidth: 140 }} SelectProps={menuPaperSx}><MenuItem value="">Cualquiera</MenuItem><MenuItem value="true">PoE Activo</MenuItem></TextField>
                </Box>
                <Box sx={{ height: 600, width: '100%' }}>
                  <DataGrid rows={switches} columns={colsSwitches} getRowId={r => r.ip} pageSize={20} loading={refreshing && !loading} onRowClick={p => navigate(`/redes/switches/${p.row.ip}`)} sx={{ ...dgSx, cursor: 'pointer' }} />
                </Box>
              </Box>
            </Fade>
          )}

          {tab === 1 && (
            <Fade in timeout={350}>
              <Box>
                {inaccessible.length === 0 ? (
                  <Box sx={{ p: 5, textAlign: 'center', background: 'rgba(74,222,128,0.03)', border: `1px solid rgba(74,222,128,0.12)`, borderRadius: '8px' }}>
                    <CheckIcon sx={{ fontSize: '3.5rem', color: T.green, mb: 2 }} />
                    <Typography sx={{ fontFamily: T.fontDisp, fontSize: '1.25rem', fontWeight: 700, color: T.green, mb: 0.5 }}>Todo perfecto</Typography>
                    <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>No hay switches inaccesibles en la red.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ height: 600, width: '100%' }}>
                    <DataGrid rows={inaccessible} columns={colsInac} getRowId={r => r.ip} sx={dgSx} />
                  </Box>
                )}
              </Box>
            </Fade>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Redes;
