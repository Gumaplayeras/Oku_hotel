import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Paper, CircularProgress,
  LinearProgress, Fade, Button, TextField, MenuItem, Tabs, Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Router as RouterIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  SettingsEthernet as PortIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getSummary, getSwitchesList, getInaccessible } from '../api/recolectorApi';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Paper sx={{
    p: 3, flex: '1 1 200px', minWidth: 200, height: '100%',
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderRadius: '16px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(20px)',
    transition: 'all 0.4s ease',
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)',
      background: 'rgba(30, 41, 59, 0.8)',
      border: `1px solid ${color}40`,
      boxShadow: `0 20px 40px -12px ${color}20`,
      '& .stat-icon': {
        transform: 'scale(1.1)',
        backgroundColor: color,
        color: '#ffffff',
        boxShadow: `0 8px 20px ${color}40`
      }
    },
    '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${color}, ${color}80, transparent)` }
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500, mb: 1.5, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block' }}>
          {title}
        </Typography>
        <Typography variant="h3" sx={{ color: '#f1f5f9', fontWeight: 700, fontSize: '2.25rem', fontFamily: '"Inter", sans-serif', lineHeight: 1.1, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
          {subtitle}
        </Typography>
      </Box>
      <Box className="stat-icon" sx={{ width: 60, height: 60, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${color}15`, color: color, border: `1px solid ${color}20`, transition: 'all 0.3s' }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

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
  // Fix for Select: ensure the displayed value and dropdown arrow are visible
  '& .MuiSelect-select': { color: '#f1f5f9' },
  '& .MuiSelect-icon': { color: '#94a3b8' },
};

const Redes = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [summary, setSummary] = useState(null);
  const [switches, setSwitches] = useState([]);
  const [inaccessible, setInaccessible] = useState([]);

  const [tab, setTab] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [reachableFilter, setReachableFilter] = useState('');
  const [poeFilter, setPoeFilter] = useState('');

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const sumData = await getSummary();
      setSummary(sumData);

      const filters = {
        q: searchQuery,
        vendor: vendorFilter,
        reachable: reachableFilter,
        poe: poeFilter
      };
      
      const swData = await getSwitchesList(filters);
      setSwitches(swData);

      const inaccData = await getInaccessible();
      setInaccessible(inaccData);

    } catch (err) {
      console.error("Error fetching data from API recolector:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, vendorFilter, reachableFilter, poeFilter]);

  const handleRefresh = () => {
    fetchData();
  };

  // Columns for main switches datagrid
  const columnsSwitches = [
    {
      field: 'hostname', headerName: 'Hostname', flex: 1, minWidth: 150,
      renderCell: (p) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RouterIcon sx={{ color: '#94a3b8', fontSize: '1.2rem' }} />
          <Typography sx={{ fontWeight: 600, color: '#f1f5f9' }}>{p.value || 'Desconocido'}</Typography>
        </Box>
      )
    },
    { field: 'ip', headerName: 'Dirección IP', width: 130, renderCell: (p) => <Typography sx={{ color: '#60a5fa', fontFamily: 'monospace', fontWeight: 600 }}>{p.value}</Typography> },
    { field: 'vendor_profile', headerName: 'Vendor', width: 110, renderCell: (p) => <Typography sx={{ color: '#cbd5e1' }}>{p.value?.toUpperCase()}</Typography> },
    { field: 'model', headerName: 'Modelo', flex: 1, minWidth: 120, renderCell: (p) => <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{p.value}</Typography> },
    { field: 'os_version', headerName: 'OS', width: 140, renderCell: (p) => <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>{p.value}</Typography> },
    { 
      field: 'ports', headerName: 'Puertos Utlz.', width: 110, 
      renderCell: (p) => (
        <Typography sx={{ color: '#e2e8f0', fontWeight: 500 }}>
          {p.row.used_ports} / {p.row.total_ports_seen}
        </Typography>
      ) 
    },
    { field: 'mac_count', headerName: 'MACs', width: 80, align: 'center', headerAlign: 'center', renderCell: (p) => <Typography sx={{ color: '#e2e8f0' }}>{p.value}</Typography> },
    {
      field: 'reachable', headerName: 'Estado', width: 100, align: 'center', headerAlign: 'center',
      renderCell: (p) => (
        p.value 
          ? <Box sx={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 0.5 }}><CheckIcon fontSize="small"/> Online</Box>
          : <Box sx={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 0.5 }}><ErrorIcon fontSize="small"/> Offline</Box>
      )
    }
  ];

  // Columns for inaccessible datagrid
  const columnsInaccessible = [
    { field: 'ip', headerName: 'Dirección IP', width: 140, renderCell: (p) => <Typography sx={{ color: '#ef4444', fontFamily: 'monospace', fontWeight: 600 }}>{p.value}</Typography> },
    { field: 'error', headerName: 'Error Detalle', flex: 1, minWidth: 250, renderCell: (p) => <Typography sx={{ color: '#f87171', fontSize: '0.85rem' }}>{p.value || 'Error desconocido'}</Typography> },
    { field: 'attempted_profiles', headerName: 'Perfiles probados', flex: 1, minWidth: 200, renderCell: (p) => <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{p.value?.join(', ')}</Typography> },
  ];

  const dgSx = {
    background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(71, 85, 105, 0.3)', borderRadius: '16px', backdropFilter: 'blur(20px)',
    color: '#f1f5f9', cursor: 'pointer',
    '& .MuiDataGrid-cell': { borderColor: 'rgba(71, 85, 105, 0.2)', color: '#f1f5f9', '&:focus': { outline: 'none' } },
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: '#0f172a !important',
      color: '#f1f5f9 !important',
      borderColor: 'rgba(71, 85, 105, 0.3)',
    },
    '& .MuiDataGrid-columnHeader': {
      backgroundColor: '#0f172a !important',
      color: '#f1f5f9 !important',
    },
    '& .MuiDataGrid-columnHeaderTitle': { color: '#f1f5f9 !important', fontWeight: 700 },
    '& .MuiDataGrid-sortIcon': { color: '#94a3b8' },
    '& .MuiDataGrid-menuIconButton': { color: '#94a3b8' },
    '& .MuiDataGrid-footerContainer': { background: 'rgba(15, 23, 42, 0.6)', color: '#f1f5f9', borderTop: '1px solid rgba(71, 85, 105, 0.3)' },
    '& .MuiTablePagination-root': { color: '#94a3b8' },
    '& .MuiDataGrid-row': { '&:hover': { background: 'rgba(59, 130, 246, 0.1)' } }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 600, fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RouterIcon sx={{ color: '#ffffff', fontSize: '1.5rem' }} />
            </Box>
            Inventario de Red
          </Typography>
          <Typography variant="body1" sx={{ color: '#cbd5e1', mt: 1 }}>Monitorización en tiempo real de switches Aruba y Ruckus</Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading || refreshing}
          sx={{ borderColor: '#60a5fa', color: '#60a5fa', borderRadius: '12px', textTransform: 'none', px: 3 }}
        >
          {refreshing ? 'Sincronizando...' : 'Actualizar'}
        </Button>
      </Box>

      {/* Stats Dashboard */}
      {!loading && summary && (
        <Fade in timeout={600}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
            <StatCard title="Total Switches" value={summary.total_switches} icon={<RouterIcon />} color="#3b82f6" subtitle={`${summary.vendors?.Aruba || 0} Aruba, ${summary.vendors?.Ruckus || 0} Ruckus`} />
            <StatCard title="Online (Reachable)" value={summary.reachable} icon={<CheckIcon />} color="#22c55e" subtitle="Switches respondiendo OK" />
            <StatCard title="Inaccesibles" value={summary.inaccessible} icon={<ErrorIcon />} color="#ef4444" subtitle="Requieren intervención" />
            <StatCard title="Total Dispositivos" value={summary.total_macs} icon={<PortIcon />} color="#8b5cf6" subtitle={`Con ${summary.total_neighbors || 0} vecinos detectados`} />
          </Box>
        </Fade>
      )}

      {(loading && !summary) ? (
        <LinearProgress sx={{ borderRadius: 2, '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)' } }} />
      ) : (
        <Box sx={{ mt: 3 }}>
          <Tabs 
            value={tab} 
            onChange={(e, v) => setTab(v)} 
            sx={{ mb: 3, '& .MuiTab-root': { color: '#94a3b8', textTransform: 'none', fontSize: '1rem', fontWeight: 500 }, '& .Mui-selected': { color: '#60a5fa !important' }, '& .MuiTabs-indicator': { backgroundColor: '#60a5fa' } }}
          >
            <Tab label="Todos los Switches" />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Inaccesibles
                  {inaccessible.length > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '12px' }}>{inaccessible.length}</span>}
                </Box>
              } 
            />
          </Tabs>

          {tab === 0 && (
            <Fade in timeout={400}>
              <Box>
                {/* Filters */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <TextField 
                    placeholder="Buscar IP o Hostname..." 
                    variant="outlined" 
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ ...inputSx, minWidth: 250 }}
                    InputProps={{ startAdornment: <SearchIcon sx={{ color: '#64748b', mr: 1 }} /> }}
                  />
                  <TextField select label="Fabricante" size="small" value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} sx={{ ...inputSx, minWidth: 150 }}
                    SelectProps={{ MenuProps: { PaperProps: { sx: { background: '#1e293b', color: '#f1f5f9', '& .MuiMenuItem-root:hover': { background: 'rgba(96,165,250,0.15)' } } } } }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="Aruba">Aruba</MenuItem>
                    <MenuItem value="Ruckus">Ruckus</MenuItem>
                  </TextField>
                  <TextField select label="Estado" size="small" value={reachableFilter} onChange={e => setReachableFilter(e.target.value)} sx={{ ...inputSx, minWidth: 150 }}
                    SelectProps={{ MenuProps: { PaperProps: { sx: { background: '#1e293b', color: '#f1f5f9', '& .MuiMenuItem-root:hover': { background: 'rgba(96,165,250,0.15)' } } } } }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="true">Online</MenuItem>
                    <MenuItem value="false">Offline</MenuItem>
                  </TextField>
                  <TextField select label="PoE" size="small" value={poeFilter} onChange={e => setPoeFilter(e.target.value)} sx={{ ...inputSx, minWidth: 150 }}
                    SelectProps={{ MenuProps: { PaperProps: { sx: { background: '#1e293b', color: '#f1f5f9', '& .MuiMenuItem-root:hover': { background: 'rgba(96,165,250,0.15)' } } } } }}
                  >
                    <MenuItem value="">Cualquiera</MenuItem>
                    <MenuItem value="true">PoE Activo</MenuItem>
                  </TextField>
                </Box>

                <Box sx={{ height: 600, width: '100%' }}>
                  <DataGrid
                    rows={switches}
                    columns={columnsSwitches}
                    getRowId={(r) => r.ip}
                    pageSize={20}
                    loading={refreshing && !loading}
                    onRowClick={(params) => navigate(`/redes/switches/${params.row.ip}`)}
                    sx={dgSx}
                  />
                </Box>
              </Box>
            </Fade>
          )}

          {tab === 1 && (
            <Fade in timeout={400}>
              <Box sx={{ height: 600, width: '100%' }}>
                {inaccessible.length === 0 ? (
                  <Paper sx={{ p: 5, textAlign: 'center', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '16px' }}>
                    <CheckIcon sx={{ fontSize: '3rem', color: '#22c55e', mb: 2 }} />
                    <Typography variant="h5" sx={{ color: '#22c55e', fontWeight: 600 }}>Todo Perfecto</Typography>
                    <Typography sx={{ color: '#cbd5e1' }}>No hay switches inaccesibles en la red actualmente.</Typography>
                  </Paper>
                ) : (
                  <DataGrid
                    rows={inaccessible}
                    columns={columnsInaccessible}
                    getRowId={(r) => r.ip}
                    sx={dgSx}
                  />
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