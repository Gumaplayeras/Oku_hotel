import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, CircularProgress, Chip } from '@mui/material';
import DevicesOutlinedIcon      from '@mui/icons-material/DevicesOutlined';
import PeopleOutlinedIcon       from '@mui/icons-material/PeopleOutlined';
import DescriptionOutlinedIcon  from '@mui/icons-material/DescriptionOutlined';
import AccountTreeOutlinedIcon  from '@mui/icons-material/AccountTreeOutlined';
import ArrowForwardIcon         from '@mui/icons-material/ArrowForward';
import WifiOutlinedIcon         from '@mui/icons-material/WifiOutlined';
import WifiOffOutlinedIcon      from '@mui/icons-material/WifiOffOutlined';
import MemoryOutlinedIcon       from '@mui/icons-material/MemoryOutlined';
import RouterOutlinedIcon       from '@mui/icons-material/RouterOutlined';
import RefreshOutlinedIcon      from '@mui/icons-material/RefreshOutlined';
import { getTotalEquipos, getTotalEmpleados } from '../api/dashboard';
import { getPartes } from '../api/partes';
import { getSummary } from '../api/recolectorApi';
import CountUp from 'react-countup';
import { T } from '../theme/theme';

// ── Helpers ────────────────────────────────────────────────────────────────────
const ESTADO_META = {
  borrador:   { label: 'Borrador',   color: T.t3 },
  pendiente:  { label: 'Pendiente',  color: T.yellow },
  en_proceso: { label: 'En proceso', color: T.blue },
  resuelto:   { label: 'Resuelto',   color: T.green },
  cancelado:  { label: 'Cancelado',  color: T.red },
};

const estadoChip = val => {
  const m = ESTADO_META[val] || { label: val || '—', color: T.t3 };
  const bgMap = { [T.green]: 'rgba(74,222,128,0.1)', [T.red]: 'rgba(248,113,113,0.1)', [T.blue]: 'rgba(96,165,250,0.1)', [T.yellow]: 'rgba(251,191,36,0.1)' };
  const bMap  = { [T.green]: 'rgba(74,222,128,0.2)', [T.red]: 'rgba(248,113,113,0.2)', [T.blue]: 'rgba(96,165,250,0.2)', [T.yellow]: 'rgba(251,191,36,0.2)' };
  return (
    <Chip label={m.label} size="small" sx={{
      background: bgMap[m.color] || 'rgba(255,255,255,0.05)',
      color: m.color,
      border: `1px solid ${bMap[m.color] || T.border}`,
      fontFamily: T.fontDisp, fontSize: '0.5rem', fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      height: 18, borderRadius: '3px',
    }} />
  );
};

// ── Stat card (left-border design) ────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, sub, loading }) => (
  <Box sx={{
    background: T.bgCard,
    borderTop: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}`,
    borderBottom: `1px solid ${T.border}`, borderLeft: `2px solid ${color}`,
    borderRadius: '1px 6px 6px 1px', p: '20px 22px',
    transition: 'background 0.15s',
    '&:hover': { background: '#16161C' },
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.t3 }}>
        {label}
      </Typography>
      <Icon sx={{ fontSize: '0.875rem', color: T.t3, opacity: 0.6 }} />
    </Box>
    {loading ? (
      <Box sx={{ height: 40, display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={18} sx={{ color }} />
      </Box>
    ) : (
      <Typography sx={{ fontFamily: T.fontMono, fontSize: '2.25rem', fontWeight: 500, color: T.t1, lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value !== null ? <CountUp end={value || 0} duration={1.4} separator="." /> : '—'}
      </Typography>
    )}
    <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.6875rem', color: T.t3, mt: 0.75, letterSpacing: '0.01em' }}>
      {sub}
    </Typography>
  </Box>
);

// ── Section panel ──────────────────────────────────────────────────────────────
const PanelHead = ({ label, action, onAction }) => (
  <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.t3 }}>
      {label}
    </Typography>
    {action && (
      <Box onClick={onAction} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: T.t3, transition: 'color 0.12s', '&:hover': { color: T.accent } }}>
        <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{action}</Typography>
        <ArrowForwardIcon sx={{ fontSize: '0.625rem' }} />
      </Box>
    )}
  </Box>
);

// ── Dashboard ──────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [time, setTime]           = useState(new Date());
  const [equipos, setEquipos]     = useState(null);
  const [empleados, setEmpleados] = useState(null);
  const [partesPend, setPartesPend] = useState(null);
  const [partesRecent, setPartesRecent] = useState([]);
  const [network, setNetwork]     = useState(null);
  const [netError, setNetError]   = useState(false);
  const [loading, setLoading]     = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Core data — always available
    try {
      const [eq, em] = await Promise.all([getTotalEquipos(), getTotalEmpleados()]);
      setEquipos(eq); setEmpleados(em);
    } catch {}
    // Partes — available
    try {
      const res = await getPartes();
      const list = Array.isArray(res.data || res) ? (res.data || res) : (res.data?.results ?? res?.results ?? []);
      const active = list.filter(p => p.estado === 'pendiente' || p.estado === 'en_proceso').length;
      setPartesPend(active);
      // last 6 partes sorted by date
      const sorted = [...list].sort((a, b) => new Date(b.fecha_apertura || 0) - new Date(a.fecha_apertura || 0));
      setPartesRecent(sorted.slice(0, 6));
    } catch {}
    // Network — may be unavailable (separate service)
    try {
      const summary = await getSummary();
      setNetwork(summary);
      setNetError(false);
    } catch {
      setNetError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [fetchData]);

  const switchesOnline = network?.reachable ?? null;
  const switchesTotal  = network?.total_switches ?? null;
  const switchesDown   = network !== null ? (switchesTotal - switchesOnline) : null;

  return (
    <Box>
      {/* ── Page header ──────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontFamily: T.fontDisp, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.01em', color: T.t1, mb: 0.5 }}>
            Dashboard
          </Typography>
          <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t3, letterSpacing: '0.01em' }}>
            OKU Hotels · IT Ibiza
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Live clock */}
          <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', px: 1.75, py: 0.75, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: T.green, boxShadow: `0 0 0 2.5px rgba(74,222,128,0.18)` }} />
            <Typography sx={{ fontFamily: T.fontMono, fontSize: '0.6875rem', color: T.t2, letterSpacing: '0.04em' }}>
              {time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Typography>
          </Box>
          {/* Refresh */}
          <Box onClick={fetchData} sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', px: 1.25, py: 0.75, cursor: 'pointer', display: 'flex', alignItems: 'center', color: T.t3, transition: 'all 0.12s', '&:hover': { border: `1px solid ${T.borderStr}`, color: T.t2, background: '#16161C' } }}>
            <RefreshOutlinedIcon sx={{ fontSize: '0.875rem' }} />
          </Box>
        </Box>
      </Box>

      {/* ── Stat cards ────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Equipos" value={equipos} icon={DevicesOutlinedIcon} color={T.accent} sub="Inventario activo" loading={loading && equipos === null} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Empleados" value={empleados} icon={PeopleOutlinedIcon} color={T.green} sub="Personal registrado" loading={loading && empleados === null} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Partes activos" value={partesPend} icon={DescriptionOutlinedIcon} color={T.yellow} sub="Pendientes y en proceso" loading={loading && partesPend === null} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Switches online"
            value={switchesOnline}
            icon={AccountTreeOutlinedIcon}
            color={switchesDown > 0 ? T.yellow : T.blue}
            sub={switchesTotal !== null ? `de ${switchesTotal} en inventario` : 'Sin datos de red'}
            loading={loading && network === null && !netError}
          />
        </Grid>
      </Grid>

      {/* ── Bottom panels ─────────────────────────────────────────── */}
      <Grid container spacing={2}>

        {/* Network panel */}
        <Grid item xs={12} md={5}>
          <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', height: '100%' }}>
            <PanelHead label="Red · Infraestructura" action="Ver switches" onAction={() => navigate('/redes')} />

            {netError ? (
              <Box sx={{ px: 2.5, py: 3, textAlign: 'center' }}>
                <WifiOffOutlinedIcon sx={{ fontSize: '1.75rem', color: T.t3, mb: 1 }} />
                <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.75rem', fontWeight: 600, color: T.t3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Servicio no disponible
                </Typography>
                <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.75rem', color: T.t3, mt: 0.5 }}>
                  El recolector de red no responde
                </Typography>
              </Box>
            ) : network === null ? (
              <Box sx={{ px: 2.5, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={14} sx={{ color: T.t3 }} />
                <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t3 }}>Cargando datos de red…</Typography>
              </Box>
            ) : (
              <>
                {/* Online / Offline big numbers */}
                <Box sx={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
                  <Box sx={{ flex: 1, px: 2.5, py: 2, borderRight: `1px solid ${T.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <WifiOutlinedIcon sx={{ fontSize: '0.875rem', color: T.green }} />
                      <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3 }}>Online</Typography>
                    </Box>
                    <Typography sx={{ fontFamily: T.fontMono, fontSize: '2rem', fontWeight: 500, color: T.green, lineHeight: 1, letterSpacing: '-0.02em' }}>
                      {network.reachable}
                    </Typography>
                    <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.6875rem', color: T.t3, mt: 0.5 }}>respondiendo</Typography>
                  </Box>
                  <Box sx={{ flex: 1, px: 2.5, py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <WifiOffOutlinedIcon sx={{ fontSize: '0.875rem', color: network.inaccessible > 0 ? T.red : T.t3 }} />
                      <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3 }}>Caídos</Typography>
                    </Box>
                    <Typography sx={{ fontFamily: T.fontMono, fontSize: '2rem', fontWeight: 500, color: network.inaccessible > 0 ? T.red : T.t3, lineHeight: 1, letterSpacing: '-0.02em' }}>
                      {network.inaccessible}
                    </Typography>
                    <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.6875rem', color: T.t3, mt: 0.5 }}>
                      {network.inaccessible > 0 ? 'requieren atención' : 'sin incidencias'}
                    </Typography>
                  </Box>
                </Box>

                {/* Detail metrics */}
                {[
                  ['Fabricantes', `${network.vendors?.Aruba || 0} Aruba · ${network.vendors?.Ruckus || 0} Ruckus`, RouterOutlinedIcon, T.t2],
                  ['Dispositivos conectados', (network.total_macs || 0).toLocaleString('es-ES'), MemoryOutlinedIcon, T.t2],
                  ['Vecinos LLDP detectados', (network.total_neighbors || 0).toLocaleString('es-ES'), AccountTreeOutlinedIcon, T.t2],
                ].map(([label, value, Icon, valueColor]) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.125, borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon sx={{ fontSize: '0.8rem', color: T.t3 }} />
                      <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t3, letterSpacing: '0.01em' }}>{label}</Typography>
                    </Box>
                    <Typography sx={{ fontFamily: T.fontMono, fontSize: '0.8125rem', color: valueColor, fontWeight: 500 }}>{value}</Typography>
                  </Box>
                ))}
              </>
            )}
          </Box>
        </Grid>

        {/* Partes recientes */}
        <Grid item xs={12} md={7}>
          <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', height: '100%' }}>
            <PanelHead label="Partes · Actividad reciente" action="Ver todos" onAction={() => navigate('/partes')} />

            {loading && partesRecent.length === 0 ? (
              <Box sx={{ px: 2.5, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={14} sx={{ color: T.t3 }} />
                <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t3 }}>Cargando partes…</Typography>
              </Box>
            ) : partesRecent.length === 0 ? (
              <Box sx={{ px: 2.5, py: 3, textAlign: 'center' }}>
                <DescriptionOutlinedIcon sx={{ fontSize: '1.75rem', color: T.t3, mb: 1 }} />
                <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.75rem', fontWeight: 600, color: T.t3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sin partes</Typography>
                <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.75rem', color: T.t3, mt: 0.5 }}>No hay partes registrados aún</Typography>
              </Box>
            ) : (
              <>
                {/* Column headers */}
                <Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 1, borderBottom: `1px solid ${T.border}`, gap: 2 }}>
                  {[['Nº Parte', '120px'], ['Receptor', '1'], ['Tipo', '120px'], ['Estado', '90px'], ['Fecha', '80px']].map(([h, w]) => (
                    <Typography key={h} sx={{ fontFamily: T.fontDisp, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3, width: w === '1' ? undefined : w, flex: w === '1' ? 1 : undefined, flexShrink: 0 }}>
                      {h}
                    </Typography>
                  ))}
                </Box>

                {/* Rows */}
                {partesRecent.map((p, i) => (
                  <Box
                    key={p.id}
                    onClick={() => navigate(`/partes/${p.id}`)}
                    sx={{
                      display: 'flex', alignItems: 'center', px: 2.5, py: 1.25, gap: 2,
                      borderBottom: i < partesRecent.length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                      '&:hover': { background: T.bgHover },
                    }}
                  >
                    {/* Nº Parte */}
                    <Typography sx={{ fontFamily: T.fontMono, fontSize: '0.75rem', color: T.accent, fontWeight: 500, width: '120px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.numero_parte || `#${p.id}`}
                    </Typography>
                    {/* Receptor */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t1, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.receptor_nombre || p.solicitante || '—'}
                      </Typography>
                      {p.receptor_departamento && (
                        <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.6875rem', color: T.t3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.receptor_departamento}
                        </Typography>
                      )}
                    </Box>
                    {/* Tipo */}
                    <Box sx={{ width: '120px', flexShrink: 0 }}>
                      {p.tipo_entrega ? (
                        <Chip label={p.tipo_entrega} size="small" sx={{ background: T.accentDim, color: T.accent, border: `1px solid ${T.accentBdr}`, fontFamily: T.fontDisp, fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', height: 18, borderRadius: '3px', maxWidth: '115px' }} />
                      ) : (
                        <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.8rem' }}>—</Typography>
                      )}
                    </Box>
                    {/* Estado */}
                    <Box sx={{ width: '90px', flexShrink: 0 }}>
                      {estadoChip(p.estado)}
                    </Box>
                    {/* Fecha */}
                    <Typography sx={{ fontFamily: T.fontMono, fontSize: '0.75rem', color: T.t3, width: '80px', flexShrink: 0 }}>
                      {p.fecha_apertura ? new Date(p.fecha_apertura).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : '—'}
                    </Typography>
                  </Box>
                ))}
              </>
            )}
          </Box>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Dashboard;
