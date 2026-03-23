import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Box, Paper, CircularProgress, Button, LinearProgress,
  Tabs, Tab, Fade, Chip, Checkbox, FormControlLabel, FormGroup, TextField
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Router as RouterIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  SettingsEthernet as PortIcon,
  DeviceHub as MacIcon,
  AccountTree as VlanIcon,
  Map as NeighborIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import {
  getSwitchDetail, getSwitchPorts, getSwitchMacs,
  getSwitchVlans, getSwitchNeighbors
} from '../api/recolectorApi';

// Shared DataGrid Styles
const dgSx = {
  background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(71, 85, 105, 0.3)', borderRadius: '16px', backdropFilter: 'blur(20px)',
  color: '#f1f5f9', mt: 2,
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

const SwitchDetail = () => {
  const { ip } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const [detail, setDetail] = useState(null);
  
  // Tab States
  const [ports, setPorts] = useState([]);
  const [macs, setMacs] = useState([]);
  const [vlans, setVlans] = useState([]);
  const [neighbors, setNeighbors] = useState([]);

  // Filters for dynamic tabs
  const [portFilters, setPortFilters] = useState({ edge_only: false, active_only: false, poe_only: false });
  const [macFilters, setMacFilters] = useState({ active_only: true, exclude_uplink: true });
  const [macSearch, setMacSearch] = useState('');

  // Initial Load (Detail)
  useEffect(() => {
    const fetchRoot = async () => {
      try {
        setLoading(true);
        const data = await getSwitchDetail(ip);
        setDetail(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoot();
  }, [ip]);

  // Tab Loaders
  useEffect(() => {
    if (tab === 0) {
      if (!ports.length) loadPorts();
    } else if (tab === 1) {
      if (!macs.length) loadMacs();
    } else if (tab === 2) {
      if (!vlans.length) loadVlans();
    } else if (tab === 3) {
      if (!neighbors.length) loadNeighbors();
    }
  }, [tab]);

  // Refetch when filters change
  useEffect(() => { if (tab === 0) loadPorts(); }, [portFilters]);
  useEffect(() => { if (tab === 1) loadMacs(); }, [macFilters]);

  const loadPorts = async () => {
    try {
      const data = await getSwitchPorts(ip, portFilters);
      setPorts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMacs = async () => {
    try {
      const data = await getSwitchMacs(ip, macFilters);
      setMacs(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadVlans = async () => {
    try {
      const data = await getSwitchVlans(ip);
      setVlans(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadNeighbors = async () => {
    try {
      const data = await getSwitchNeighbors(ip);
      setNeighbors(data);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <LinearProgress sx={{ '& .MuiLinearProgress-bar': { background: '#3b82f6' } }} />;
  if (!detail) return <Typography sx={{ color: 'white', p: 4 }}>Error cargando detalles o switch no encontrado.</Typography>;

  // Columns setup
  const colPorts = [
    { field: 'port', headerName: 'Puerto', width: 120, renderCell: (p) => <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#60a5fa' }}>{p.value}</Typography> },
    { field: 'state', headerName: 'Estado', width: 100, renderCell: (p) => (
      <Chip size="small" label={p.value} sx={{ 
        bgcolor: p.value === 'active' || p.value === 'uplink' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)', 
        color: p.value === 'active' || p.value === 'uplink' ? '#22c55e' : '#94a3b8', border: '1px solid', fontWeight: 600 
      }} />
    )},
    { field: 'is_uplink', headerName: 'Tipo', width: 120, renderCell: (p) => p.value ? <Chip size="small" label="Uplink" color="primary" variant="outlined" /> : <Chip size="small" label="Edge" sx={{ color: '#94a3b8' }} variant="outlined"/> },
    { field: 'macs', headerName: 'Desp. MACs', width: 120, align: 'center', headerAlign: 'center', renderCell: (p) => <Typography sx={{ color: p.value > 0 ? '#f1f5f9' : '#64748b' }}>{p.value}</Typography> },
    { field: 'main_mac', headerName: 'MAC Principal', flex: 1, minWidth: 160, renderCell: (p) => <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#cbd5e1' }}>{p.value || '—'}</Typography> },
    { field: 'vlans', headerName: 'VLANs', flex: 1, minWidth: 120, renderCell: (p) => <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{p.value?.join(', ') || '—'}</Typography> },
    { field: 'poe', headerName: 'PoE', width: 80, align: 'center', headerAlign: 'center', renderCell: (p) => p.value ? <CheckIcon sx={{ color: '#f59e0b', fontSize: '1rem' }} /> : '—' },
  ];

  const colMacs = [
    { field: 'mac', headerName: 'MAC', width: 160, renderCell: (p) => <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#60a5fa' }}>{p.value}</Typography> },
    { field: 'port', headerName: 'Puerto', width: 120, renderCell: (p) => <Typography sx={{ color: '#cbd5e1' }}>{p.value}</Typography> },
    { field: 'vlan', headerName: 'VLAN', width: 100, renderCell: (p) => <Typography sx={{ color: '#94a3b8' }}>{p.value || '—'}</Typography> },
    { field: 'entry_type', headerName: 'Tipo Entrada', width: 140, renderCell: (p) => <Chip size="small" label={p.value} variant="outlined" sx={{ color: p.value === 'dynamic' ? '#3b82f6' : '#f59e0b' }}/> },
    { field: 'is_active', headerName: 'Activa', width: 100, align: 'center', renderCell: (p) => p.value ? <CheckIcon sx={{ color: '#22c55e', fontSize: '1rem' }} /> : '—' },
    { field: 'is_uplink_port', headerName: 'Uplink?', width: 100, align: 'center', renderCell: (p) => p.value ? <Chip size="small" label="Sí" color="default" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}/> : '—' },
  ];

  const colVlans = [
    { field: 'vlan_id', headerName: 'ID', width: 100, renderCell: (p) => <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#60a5fa' }}>{p.value}</Typography> },
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 200, renderCell: (p) => <Typography sx={{ color: '#f1f5f9' }}>{p.value}</Typography> },
    { field: 'status', headerName: 'Estado', width: 150, renderCell: (p) => <Typography sx={{ color: p.value === 'active' ? '#22c55e' : '#94a3b8' }}>{p.value?.toUpperCase()}</Typography> },
  ];

  const colNeighbors = [
    { field: 'local_port', headerName: 'Puerto Local', width: 140, renderCell: (p) => <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#60a5fa' }}>{p.value}</Typography> },
    { field: 'neighbor_name', headerName: 'Nombre Vecino', flex: 1, minWidth: 200, renderCell: (p) => <Typography sx={{ color: '#f1f5f9', fontWeight: 500 }}>{p.value}</Typography> },
    { field: 'neighbor_ip', headerName: 'IP Vecino', width: 150, renderCell: (p) => <Typography sx={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{p.value || '—'}</Typography> },
    { field: 'neighbor_port', headerName: 'Puerto Vecino', width: 150, renderCell: (p) => <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{p.value}</Typography> },
    { field: 'chassis_id', headerName: 'Chasis ID', width: 160, renderCell: (p) => <Typography sx={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.value}</Typography> },
  ];

  const filteredMacs = macSearch ? macs.filter(m => m.mac.toLowerCase().includes(macSearch.toLowerCase()) || m.port?.toLowerCase().includes(macSearch.toLowerCase())) : macs;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: '100vh' }}>
      
      {/* Top Navigation */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/redes')}
        sx={{ color: '#94a3b8', textTransform: 'none', mb: 3, '&:hover': { color: '#ffffff' } }}
      >
        Volver a Inventario
      </Button>

      {/* Header Info */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(71, 85, 105, 0.3)', borderRadius: '16px', backdropFilter: 'blur(20px)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '16px', background: detail.reachable ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #ef4444, #b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
            <RouterIcon sx={{ color: '#ffffff', fontSize: '2rem' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '2rem', mb: 0.5 }}>
              {detail.hostname || detail.ip} {detail.reachable && <CheckIcon sx={{ color: '#22c55e', fontSize: '1.5rem', verticalAlign: 'middle', ml: 1 }} />}
              {!detail.reachable && <ErrorIcon sx={{ color: '#ef4444', fontSize: '1.5rem', verticalAlign: 'middle', ml: 1 }} />}
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '1.1rem' }}>
              {detail.ip} • <span style={{ color: '#cbd5e1', textTransform: 'uppercase' }}>{detail.vendor_profile}</span>
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right', minWidth: 200 }}>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modelo / SO</Typography>
            <Typography sx={{ color: '#f1f5f9', fontWeight: 500, mb: 1 }}>{detail.model || 'Desconocido'} / {detail.os_version || '?'}</Typography>
            
            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ocupación de Puertos</Typography>
            <Typography sx={{ color: '#f1f5f9', fontWeight: 500 }}>{detail.used_ports} / {detail.total_ports_seen} activos</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main Content Tabs */}
      <Tabs 
        value={tab} 
        onChange={(e, v) => setTab(v)} 
        sx={{ mb: 3, '& .MuiTab-root': { color: '#94a3b8', textTransform: 'none', fontSize: '1.05rem', fontWeight: 500 }, '& .Mui-selected': { color: '#60a5fa !important' }, '& .MuiTabs-indicator': { backgroundColor: '#60a5fa', height: 3, borderRadius: '3px 3px 0 0' } }}
      >
        <Tab icon={<PortIcon />} iconPosition="start" label="Puertos" />
        <Tab icon={<MacIcon />} iconPosition="start" label={`MACs (${detail.mac_count})`} />
        <Tab icon={<VlanIcon />} iconPosition="start" label={`VLANs (${detail.vlan_count})`} />
        <Tab icon={<NeighborIcon />} iconPosition="start" label={`Vecinos LLDP (${detail.lldp_neighbor_count})`} />
      </Tabs>

      <Fade in timeout={500}>
        <Box sx={{ minHeight: 400 }}>
          
          {/* TAB 0: PORTS */}
          {tab === 0 && (
            <Box>
              <FormGroup row sx={{ mb: 2, gap: 3, color: '#f1f5f9' }}>
                <FormControlLabel control={<Checkbox sx={{ color: '#64748b', '&.Mui-checked': { color: '#60a5fa' } }} checked={portFilters.edge_only} onChange={e => setPortFilters(prev => ({ ...prev, edge_only: e.target.checked }))}/>} label="Solo Edge (Excluir Uplinks)" />
                <FormControlLabel control={<Checkbox sx={{ color: '#64748b', '&.Mui-checked': { color: '#60a5fa' } }} checked={portFilters.active_only} onChange={e => setPortFilters(prev => ({ ...prev, active_only: e.target.checked }))}/>} label="Solo Activos" />
                <FormControlLabel control={<Checkbox sx={{ color: '#64748b', '&.Mui-checked': { color: '#60a5fa' } }} checked={portFilters.poe_only} onChange={e => setPortFilters(prev => ({ ...prev, poe_only: e.target.checked }))}/>} label="Solo PoE Entregando Energía" />
              </FormGroup>
              <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid rows={ports} columns={colPorts} getRowId={(r) => r.port} sx={dgSx} pageSize={50} rowsPerPageOptions={[50, 100]} />
              </Box>
            </Box>
          )}

          {/* TAB 1: MACS */}
          {tab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 3, flexWrap: 'wrap' }}>
                <TextField 
                  placeholder="Buscar MAC o Puerto..." size="small" variant="outlined" 
                  value={macSearch} onChange={(e) => setMacSearch(e.target.value)}
                  sx={{ 
                    minWidth: 300, 
                    '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(51, 65, 85, 0.3)', borderRadius: '12px' }, 
                    '& fieldset': { borderColor: 'rgba(71, 85, 105, 0.3)' }, 
                    '& input': { color: '#f1f5f9' } 
                  }}
                />
                <FormGroup row sx={{ color: '#f1f5f9' }}>
                  <FormControlLabel control={<Checkbox sx={{ color: '#64748b', '&.Mui-checked': { color: '#60a5fa' } }} checked={macFilters.exclude_uplink} onChange={e => setMacFilters(prev => ({ ...prev, exclude_uplink: e.target.checked }))}/>} label="Ocultar MACs en Uplink" />
                  <FormControlLabel control={<Checkbox sx={{ color: '#64748b', '&.Mui-checked': { color: '#60a5fa' } }} checked={macFilters.active_only} onChange={e => setMacFilters(prev => ({ ...prev, active_only: e.target.checked }))}/>} label="Solo Activas Recientes" />
                </FormGroup>
              </Box>
              <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid rows={filteredMacs} columns={colMacs} getRowId={(r) => r.mac} sx={dgSx} pageSize={50} rowsPerPageOptions={[50, 100]} />
              </Box>
            </Box>
          )}

          {/* TAB 2: VLANS */}
          {tab === 2 && (
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid rows={vlans} columns={colVlans} getRowId={(r) => r.vlan_id} sx={dgSx} pageSize={50} rowsPerPageOptions={[50, 100]} />
            </Box>
          )}

          {/* TAB 3: NEIGHBORS */}
          {tab === 3 && (
            <Box sx={{ height: 600, width: '100%' }}>
              {neighbors.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(71, 85, 105, 0.3)', borderRadius: '16px' }}>
                  <Typography sx={{ color: '#cbd5e1' }}>No se han detectado vecinos por LLDP o CDP en este switch.</Typography>
                </Paper>
              ) : (
                <DataGrid rows={neighbors} columns={colNeighbors} getRowId={(r) => r.local_port + r.neighbor_name} sx={dgSx} pageSize={50} rowsPerPageOptions={[50, 100]} />
              )}
            </Box>
          )}
        </Box>
      </Fade>

    </Box>
  );
};

export default SwitchDetail;
