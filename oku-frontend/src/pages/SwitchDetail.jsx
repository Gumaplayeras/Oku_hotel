import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Box, CircularProgress, Button, LinearProgress,
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
  Map as NeighborIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import {
  getSwitchDetail, getSwitchPorts, getSwitchMacs,
  getSwitchVlans, getSwitchNeighbors
} from '../api/recolectorApi';
import { T, inputSx, dgSx } from '../theme/theme';

const StatPill = ({ label, value, color }) => (
  <Box sx={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    px: 3, py: 1.5,
    background: T.bgCard,
    border: `1px solid ${T.border}`,
    borderRadius: '6px', minWidth: 90,
  }}>
    <Typography sx={{ fontFamily: T.fontMono, color: color || T.t1, fontWeight: 500, fontSize: '1.4rem', lineHeight: 1.1 }}>
      {value ?? '—'}
    </Typography>
    <Typography sx={{ fontFamily: T.fontDisp, color: T.t3, fontSize: '0.5625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, mt: 0.5 }}>
      {label}
    </Typography>
  </Box>
);

const SwitchDetail = () => {
  const { ip } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const [detail, setDetail] = useState(null);
  const [ports, setPorts] = useState([]);
  const [macs, setMacs] = useState([]);
  const [vlans, setVlans] = useState([]);
  const [neighbors, setNeighbors] = useState([]);

  const [portFilters, setPortFilters] = useState({ edge_only: false, active_only: false, poe_only: false });
  const [macFilters, setMacFilters] = useState({ active_only: true, exclude_uplink: true });
  const [macSearch, setMacSearch] = useState('');

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

  useEffect(() => {
    if (tab === 0) { if (!ports.length) loadPorts(); }
    else if (tab === 1) { if (!macs.length) loadMacs(); }
    else if (tab === 2) { if (!vlans.length) loadVlans(); }
    else if (tab === 3) { if (!neighbors.length) loadNeighbors(); }
  }, [tab]);

  useEffect(() => { if (tab === 0) loadPorts(); }, [portFilters]);
  useEffect(() => { if (tab === 1) loadMacs(); }, [macFilters]);

  const loadPorts = async () => {
    try { const data = await getSwitchPorts(ip, portFilters); setPorts(data); } catch (e) { console.error(e); }
  };
  const loadMacs = async () => {
    try { const data = await getSwitchMacs(ip, macFilters); setMacs(data); } catch (e) { console.error(e); }
  };
  const loadVlans = async () => {
    try { const data = await getSwitchVlans(ip); setVlans(data); } catch (e) { console.error(e); }
  };
  const loadNeighbors = async () => {
    try { const data = await getSwitchNeighbors(ip); setNeighbors(data); } catch (e) { console.error(e); }
  };

  const backBtn = (
    <Button
      variant="outlined"
      size="small"
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate('/redes')}
      sx={{ border: `1px solid ${T.border}`, color: T.t2, borderRadius: '6px', textTransform: 'none', fontFamily: T.fontDisp, fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.04em', mb: 3, '&:hover': { border: `1px solid ${T.borderStr}`, color: T.t1, background: T.bgHover } }}
    >
      Volver a Inventario
    </Button>
  );

  if (loading) {
    return (
      <Box>
        {backBtn}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: 3 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: '10px', background: T.bgCard, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RouterIcon sx={{ color: T.accent, fontSize: '1.75rem' }} />
          </Box>
          <CircularProgress size={32} sx={{ color: T.accent }} />
          <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>
            Cargando información del switch <span style={{ color: T.blue, fontFamily: 'JetBrains Mono, monospace' }}>{ip}</span>
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!detail) {
    return (
      <Box>
        {backBtn}
        <Box sx={{ p: 5, textAlign: 'center', background: 'rgba(248,113,113,0.04)', border: `1px solid rgba(248,113,113,0.15)`, borderRadius: '8px' }}>
          <WarningIcon sx={{ fontSize: '3.5rem', color: T.red, mb: 2 }} />
          <Typography sx={{ fontFamily: T.fontDisp, fontSize: '1.125rem', color: T.t1, fontWeight: 600, mb: 1 }}>
            Switch no encontrado
          </Typography>
          <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>
            No se han podido cargar los detalles para <span style={{ color: T.red, fontFamily: 'JetBrains Mono, monospace' }}>{ip}</span>
          </Typography>
        </Box>
      </Box>
    );
  }

  const colPorts = [
    { field: 'port', headerName: 'Puerto', width: 120, renderCell: (p) => <Typography sx={{ fontFamily: T.fontMono, fontWeight: 700, color: T.blue }}>{p.value}</Typography> },
    {
      field: 'state', headerName: 'Estado', width: 110,
      renderCell: (p) => (
        <Chip size="small" label={p.value} sx={{
          bgcolor: (p.value === 'active' || p.value === 'uplink') ? 'rgba(74,222,128,0.1)' : 'rgba(69,69,78,0.3)',
          color: (p.value === 'active' || p.value === 'uplink') ? T.green : T.t3,
          border: `1px solid ${(p.value === 'active' || p.value === 'uplink') ? 'rgba(74,222,128,0.2)' : T.border}`,
          fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px',
        }} />
      ),
    },
    {
      field: 'is_uplink', headerName: 'Tipo', width: 110,
      renderCell: (p) => p.value
        ? <Chip size="small" label="Uplink" sx={{ bgcolor: 'rgba(96,165,250,0.1)', color: T.blue, border: '1px solid rgba(96,165,250,0.2)', fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} />
        : <Chip size="small" label="Edge" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: T.t2, border: `1px solid ${T.border}`, fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} />,
    },
    { field: 'macs', headerName: 'MACs', width: 90, align: 'center', headerAlign: 'center', renderCell: (p) => <Typography sx={{ fontFamily: T.fontUI, color: p.value > 0 ? T.t1 : T.t3, fontWeight: p.value > 0 ? 600 : 400 }}>{p.value}</Typography> },
    { field: 'main_mac', headerName: 'MAC Principal', flex: 1, minWidth: 160, renderCell: (p) => <Typography sx={{ fontFamily: T.fontMono, fontSize: '0.83rem', color: T.t2 }}>{p.value || '—'}</Typography> },
    { field: 'vlans', headerName: 'VLANs', flex: 1, minWidth: 120, renderCell: (p) => <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.83rem' }}>{p.value?.join(', ') || '—'}</Typography> },
    { field: 'poe', headerName: 'PoE', width: 70, align: 'center', headerAlign: 'center', renderCell: (p) => p.value ? <CheckIcon sx={{ color: T.yellow, fontSize: '1.1rem' }} /> : <Typography sx={{ color: T.t3 }}>—</Typography> },
  ];

  const colMacs = [
    { field: 'mac', headerName: 'MAC', width: 170, renderCell: (p) => <Typography sx={{ fontFamily: T.fontMono, fontWeight: 700, color: T.blue, fontSize: '0.85rem' }}>{p.value}</Typography> },
    { field: 'port', headerName: 'Puerto', width: 120, renderCell: (p) => <Typography sx={{ fontFamily: T.fontMono, color: T.t2 }}>{p.value}</Typography> },
    { field: 'vlan', headerName: 'VLAN', width: 90, renderCell: (p) => <Typography sx={{ fontFamily: T.fontUI, color: T.t3 }}>{p.value || '—'}</Typography> },
    {
      field: 'entry_type', headerName: 'Tipo', width: 130,
      renderCell: (p) => (
        <Chip size="small" label={p.value} variant="outlined" sx={{
          color: p.value === 'dynamic' ? T.blue : T.yellow,
          borderColor: p.value === 'dynamic' ? 'rgba(96,165,250,0.4)' : 'rgba(251,191,36,0.4)',
          fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px',
        }} />
      ),
    },
    { field: 'is_active', headerName: 'Activa', width: 90, align: 'center', renderCell: (p) => p.value ? <CheckIcon sx={{ color: T.green, fontSize: '1.1rem' }} /> : <Typography sx={{ color: T.t3 }}>—</Typography> },
    {
      field: 'is_uplink_port', headerName: 'Uplink', width: 90, align: 'center',
      renderCell: (p) => p.value
        ? <Chip size="small" label="Sí" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: T.t2, border: `1px solid ${T.border}`, fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, height: 20, borderRadius: '4px' }} />
        : <Typography sx={{ color: T.t3 }}>—</Typography>,
    },
  ];

  const colVlans = [
    { field: 'vlan_id', headerName: 'ID', width: 100, renderCell: (p) => <Typography sx={{ fontFamily: T.fontMono, fontWeight: 700, color: T.blue }}>{p.value}</Typography> },
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 200, renderCell: (p) => <Typography sx={{ fontFamily: T.fontUI, color: T.t1, fontWeight: 500 }}>{p.value}</Typography> },
    {
      field: 'status', headerName: 'Estado', width: 140,
      renderCell: (p) => (
        <Chip size="small" label={p.value?.toUpperCase()} sx={{
          bgcolor: p.value === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
          color: p.value === 'active' ? T.green : T.t3,
          border: `1px solid ${p.value === 'active' ? 'rgba(74,222,128,0.2)' : T.border}`,
          fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', height: 20, borderRadius: '4px',
        }} />
      ),
    },
  ];

  const colNeighbors = [
    { field: 'local_port', headerName: 'Puerto Local', width: 140, renderCell: (p) => <Typography sx={{ fontFamily: T.fontMono, fontWeight: 700, color: T.blue }}>{p.value}</Typography> },
    { field: 'neighbor_name', headerName: 'Nombre Vecino', flex: 1, minWidth: 200, renderCell: (p) => <Typography sx={{ fontFamily: T.fontUI, color: T.t1, fontWeight: 600 }}>{p.value}</Typography> },
    { field: 'neighbor_ip', headerName: 'IP Vecino', width: 150, renderCell: (p) => <Typography sx={{ fontFamily: T.fontMono, color: T.purple, fontWeight: 500 }}>{p.value || '—'}</Typography> },
    { field: 'neighbor_port', headerName: 'Puerto Vecino', width: 150, renderCell: (p) => <Typography sx={{ fontFamily: T.fontMono, color: T.t3, fontSize: '0.85rem' }}>{p.value}</Typography> },
    { field: 'chassis_id', headerName: 'Chasis ID', width: 170, renderCell: (p) => <Typography sx={{ fontFamily: T.fontMono, color: T.t3, fontSize: '0.8rem' }}>{p.value}</Typography> },
  ];

  const filteredMacs = macSearch
    ? macs.filter(m => m.mac?.toLowerCase().includes(macSearch.toLowerCase()) || m.port?.toLowerCase().includes(macSearch.toLowerCase()))
    : macs;

  return (
    <Box>
      {backBtn}

      {/* Header card */}
      <Box sx={{ p: { xs: 2.5, sm: 3 }, mb: 3, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: '10px', flexShrink: 0,
            background: detail.reachable ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
            border: `1px solid ${detail.reachable ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RouterIcon sx={{ color: detail.reachable ? T.green : T.red, fontSize: '1.5rem' }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography sx={{ fontFamily: T.fontDisp, color: T.t1, fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                {detail.hostname || detail.ip}
              </Typography>
              <Chip
                size="small"
                icon={detail.reachable ? <CheckIcon sx={{ fontSize: '0.9rem !important' }} /> : <ErrorIcon sx={{ fontSize: '0.9rem !important' }} />}
                label={detail.reachable ? 'Online' : 'Offline'}
                sx={{
                  bgcolor: detail.reachable ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                  color: detail.reachable ? T.green : T.red,
                  border: `1px solid ${detail.reachable ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                  fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: T.fontMono, color: T.blue, fontSize: '0.95rem', fontWeight: 600 }}>
                {detail.ip}
              </Typography>
              <Typography sx={{ color: T.t3 }}>·</Typography>
              <Typography sx={{ fontFamily: T.fontUI, color: T.t2, fontWeight: 500, textTransform: 'uppercase', fontSize: '0.875rem' }}>
                {detail.vendor_profile}
              </Typography>
              {detail.model && (
                <>
                  <Typography sx={{ color: T.t3 }}>·</Typography>
                  <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>{detail.model}</Typography>
                </>
              )}
              {detail.os_version && (
                <Typography sx={{ fontFamily: T.fontMono, color: T.t3, fontSize: '0.8rem' }}>
                  {detail.os_version}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
          <StatPill label="Puertos" value={`${detail.used_ports}/${detail.total_ports_seen}`} color={T.blue} />
          <StatPill label="MACs" value={detail.mac_count} color={T.purple} />
          <StatPill label="VLANs" value={detail.vlan_count} color={T.blue} />
          <StatPill label="Vecinos" value={detail.lldp_neighbor_count} color={T.yellow} />
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': { fontFamily: T.fontDisp, color: T.t3, textTransform: 'none', fontSize: '0.875rem', fontWeight: 500 },
          '& .Mui-selected': { color: `${T.accent} !important` },
          '& .MuiTabs-indicator': { background: T.accent, height: 2 },
        }}
      >
        <Tab icon={<PortIcon sx={{ fontSize: '1.1rem' }} />} iconPosition="start" label="Puertos" />
        <Tab icon={<MacIcon sx={{ fontSize: '1.1rem' }} />} iconPosition="start" label={`MACs (${detail.mac_count})`} />
        <Tab icon={<VlanIcon sx={{ fontSize: '1.1rem' }} />} iconPosition="start" label={`VLANs (${detail.vlan_count})`} />
        <Tab icon={<NeighborIcon sx={{ fontSize: '1.1rem' }} />} iconPosition="start" label={`Vecinos (${detail.lldp_neighbor_count})`} />
      </Tabs>

      <Fade in timeout={400}>
        <Box>
          {tab === 0 && (
            <Box>
              <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', p: 2.5, mb: 3 }}>
                <FormGroup row sx={{ gap: 3 }}>
                  {[
                    { key: 'edge_only', label: 'Solo Edge (excluir uplinks)' },
                    { key: 'active_only', label: 'Solo activos' },
                    { key: 'poe_only', label: 'Solo PoE entregando energía' },
                  ].map(({ key, label }) => (
                    <FormControlLabel
                      key={key}
                      control={
                        <Checkbox
                          sx={{ color: T.border, '&.Mui-checked': { color: T.accent } }}
                          checked={portFilters[key]}
                          onChange={e => setPortFilters(prev => ({ ...prev, [key]: e.target.checked }))}
                        />
                      }
                      label={<Typography sx={{ fontFamily: T.fontUI, color: T.t2, fontSize: '0.875rem' }}>{label}</Typography>}
                    />
                  ))}
                </FormGroup>
              </Box>
              <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid rows={ports} columns={colPorts} getRowId={(r) => r.port} sx={dgSx} pageSize={50} rowsPerPageOptions={[50, 100]} disableRowSelectionOnClick />
              </Box>
            </Box>
          )}

          {tab === 1 && (
            <Box>
              <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', p: 2.5, mb: 3, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  placeholder="Buscar MAC o Puerto..."
                  size="small"
                  variant="outlined"
                  value={macSearch}
                  onChange={(e) => setMacSearch(e.target.value)}
                  sx={{ ...inputSx, minWidth: 260 }}
                />
                <FormGroup row sx={{ gap: 1 }}>
                  {[
                    { key: 'exclude_uplink', label: 'Ocultar uplinks' },
                    { key: 'active_only', label: 'Solo activas recientes' },
                  ].map(({ key, label }) => (
                    <FormControlLabel
                      key={key}
                      control={
                        <Checkbox
                          sx={{ color: T.border, '&.Mui-checked': { color: T.accent } }}
                          checked={macFilters[key]}
                          onChange={e => setMacFilters(prev => ({ ...prev, [key]: e.target.checked }))}
                        />
                      }
                      label={<Typography sx={{ fontFamily: T.fontUI, color: T.t2, fontSize: '0.875rem' }}>{label}</Typography>}
                    />
                  ))}
                </FormGroup>
              </Box>
              <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid rows={filteredMacs} columns={colMacs} getRowId={(r) => r.mac} sx={dgSx} pageSize={50} rowsPerPageOptions={[50, 100]} disableRowSelectionOnClick />
              </Box>
            </Box>
          )}

          {tab === 2 && (
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid rows={vlans} columns={colVlans} getRowId={(r) => r.vlan_id} sx={dgSx} pageSize={50} rowsPerPageOptions={[50, 100]} disableRowSelectionOnClick />
            </Box>
          )}

          {tab === 3 && (
            neighbors.length === 0 ? (
              <Box sx={{ p: 5, textAlign: 'center', background: 'rgba(74,222,128,0.03)', border: `1px solid rgba(74,222,128,0.12)`, borderRadius: '8px' }}>
                <CheckIcon sx={{ fontSize: '3.5rem', color: T.green, mb: 2 }} />
                <Typography sx={{ fontFamily: T.fontDisp, fontSize: '1.125rem', fontWeight: 700, color: T.green, mb: 0.5 }}>Sin vecinos detectados</Typography>
                <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>
                  No se han registrado vecinos LLDP/CDP en este switch.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid rows={neighbors} columns={colNeighbors} getRowId={(r) => r.local_port + r.neighbor_name} sx={dgSx} pageSize={50} rowsPerPageOptions={[50, 100]} disableRowSelectionOnClick />
              </Box>
            )
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default SwitchDetail;
