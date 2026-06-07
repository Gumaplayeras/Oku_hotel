import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, CircularProgress, Chip } from '@mui/material';
import DevicesOutlinedIcon     from '@mui/icons-material/DevicesOutlined';
import PeopleOutlinedIcon      from '@mui/icons-material/PeopleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ArrowForwardIcon        from '@mui/icons-material/ArrowForward';
import WifiOutlinedIcon        from '@mui/icons-material/WifiOutlined';
import WifiOffOutlinedIcon     from '@mui/icons-material/WifiOffOutlined';
import RouterOutlinedIcon      from '@mui/icons-material/RouterOutlined';
import MemoryOutlinedIcon      from '@mui/icons-material/MemoryOutlined';
import RefreshOutlinedIcon     from '@mui/icons-material/RefreshOutlined';
import StorageOutlinedIcon     from '@mui/icons-material/StorageOutlined';
import ApiOutlinedIcon         from '@mui/icons-material/ApiOutlined';
import HubOutlinedIcon         from '@mui/icons-material/HubOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineIcon        from '@mui/icons-material/ErrorOutline';
import { getPartes }   from '../api/partes';
import { getEquipos }   from '../api/equipos';
import { getEmpleados } from '../api/empleados';
import { getSummary }   from '../api/recolectorApi';
import CountUp from 'react-countup';
import { T } from '../theme/theme';

// ─── KPI snapshot helpers (localStorage, daily) ──────────────────────────────
const SNAP_KEY = 'oku_kpi_snap';
function loadSnaps() {
  return JSON.parse(localStorage.getItem(SNAP_KEY) || '{}');
}
function saveSnap(data) {
  const today = new Date().toISOString().slice(0, 10);
  const snaps = loadSnaps();
  snaps[today] = data;
  const keys = Object.keys(snaps).sort();
  while (keys.length > 2) delete snaps[keys.shift()];
  localStorage.setItem(SNAP_KEY, JSON.stringify(snaps));
}

// ─── Estado metadata ──────────────────────────────────────────────────────────
const ESTADOS = [
  { value: 'pendiente',  label: 'Pendiente',  color: T.yellow, bg: 'rgba(251,191,36,0.1)',  bd: 'rgba(251,191,36,0.22)' },
  { value: 'en_proceso', label: 'En proceso', color: T.blue,   bg: 'rgba(96,165,250,0.1)',  bd: 'rgba(96,165,250,0.22)' },
  { value: 'resuelto',   label: 'Resuelto',   color: T.green,  bg: 'rgba(74,222,128,0.1)',  bd: 'rgba(74,222,128,0.22)' },
  { value: 'borrador',   label: 'Borrador',   color: T.t3,     bg: 'rgba(255,255,255,0.05)',bd: T.border },
  { value: 'cancelado',  label: 'Cancelado',  color: T.red,    bg: 'rgba(248,113,113,0.1)', bd: 'rgba(248,113,113,0.22)' },
];
const eMeta = v => ESTADOS.find(e => e.value === v) || { label: v || '—', color: T.t3, bg: 'rgba(255,255,255,0.05)', bd: T.border };

// ─── SVG Donut ────────────────────────────────────────────────────────────────
function Donut({ slices, total, size = 108 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.36, sw = size * 0.1;
  const circ = 2 * Math.PI * r;
  let cum = 0;
  const arcs = slices.map(s => {
    const arc = total > 0 ? (s.count / total) * circ : 0;
    const o = cum; cum += arc;
    return { ...s, arc, o };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.bgHdr} strokeWidth={sw} />
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {arcs.map((a, i) => a.arc > 0.5 && (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={a.color} strokeWidth={sw}
            strokeDasharray={`${a.arc} ${circ}`}
            strokeDashoffset={-a.o} strokeLinecap="butt"
          />
        ))}
      </g>
      <text x={cx} y={cy - 4} textAnchor="middle" fill={T.t1}
        fontSize={size * 0.185} fontFamily="'JetBrains Mono',monospace" fontWeight="500">
        {total}
      </text>
      <text x={cx} y={cy + size * 0.115} textAnchor="middle" fill={T.t3}
        fontSize={size * 0.072} fontFamily="'Syne',sans-serif" fontWeight="600" letterSpacing="1">
        PARTES
      </text>
    </svg>
  );
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
const EChip = ({ val }) => {
  const m = eMeta(val);
  return <Chip label={m.label} size="small" sx={{ background: m.bg, color: m.color, border: `1px solid ${m.bd}`, fontFamily: T.fontDisp, fontSize: '0.475rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', height: 17, borderRadius: '3px' }} />;
};

const StatCard = ({ label, value, sub, icon: Icon, color, loading: lp, delta }) => (
  <Box sx={{
    height: '100%', background: T.bgCard,
    borderTop: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}`,
    borderBottom: `1px solid ${T.border}`, borderLeft: `2px solid ${color}`,
    borderRadius: '1px 6px 6px 1px', p: '16px 18px',
    transition: 'background 0.15s', '&:hover': { background: '#15151A' },
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.525rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.t3 }}>{label}</Typography>
      <Icon sx={{ fontSize: '0.8rem', color: T.t3, opacity: 0.5 }} />
    </Box>
    {lp
      ? <Box sx={{ height: 34, display: 'flex', alignItems: 'center' }}><CircularProgress size={13} sx={{ color }} /></Box>
      : <Typography sx={{ fontFamily: T.fontMono, fontSize: '1.875rem', fontWeight: 500, color: T.t1, lineHeight: 1, letterSpacing: '-0.025em' }}>
          {value !== null ? <CountUp end={value || 0} duration={1.2} separator="." /> : '—'}
        </Typography>
    }
    <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.6875rem', color: T.t3, mt: 0.5, letterSpacing: '0.01em' }}>{sub}</Typography>
    {!lp && delta && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.625 }}>
        <Typography sx={{
          fontFamily: T.fontMono, fontSize: '0.625rem', fontWeight: 700, lineHeight: 1,
          color: delta.n > 0 ? T.green : delta.n < 0 ? T.red : T.t3,
        }}>
          {delta.n > 0 ? `↑ ${delta.n}` : delta.n < 0 ? `↓ ${Math.abs(delta.n)}` : '—'}
        </Typography>
        <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.625rem', color: T.t3, lineHeight: 1 }}>
          {delta.label}
        </Typography>
      </Box>
    )}
  </Box>
);

const Panel = ({ children, sx }) => (
  <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', ...sx }}>
    {children}
  </Box>
);

const PHead = ({ label, action, onAction }) => (
  <Box sx={{ px: 2.5, py: 1.25, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
    <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.525rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.t3 }}>{label}</Typography>
    {action && (
      <Box onClick={onAction} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: T.t3, userSelect: 'none', transition: 'color 0.12s', '&:hover': { color: T.accent } }}>
        <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.475rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{action}</Typography>
        <ArrowForwardIcon sx={{ fontSize: '0.5rem' }} />
      </Box>
    )}
  </Box>
);

const Loader = ({ label }) => (
  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, py: 2 }}>
    <CircularProgress size={11} sx={{ color: T.t3 }} />
    <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t3 }}>{label}</Typography>
  </Box>
);

const Empty = ({ icon: Icon, label }) => (
  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3, py: 4, gap: 1 }}>
    <Icon sx={{ fontSize: '1.5rem', color: T.t3 }} />
    <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3 }}>{label}</Typography>
  </Box>
);

// ─── Service status row ───────────────────────────────────────────────────────
const ServiceRow = ({ icon: Icon, name, desc, status, ms, loading: lp }) => {
  const isUp   = status === 'online';
  const isDown = status === 'offline';
  const isUnk  = status === 'unknown' || lp;
  const slow   = isUp && ms !== null && ms > 500;

  const dotColor = lp ? T.t3 : isDown ? T.red : slow ? T.yellow : T.green;
  const statusLabel = lp ? '—' : isDown ? 'OFFLINE' : 'ONLINE';
  const statusColor = lp ? T.t3 : isDown ? T.red : slow ? T.yellow : T.green;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 1.375, borderBottom: `1px solid rgba(255,255,255,0.03)`, '&:last-child': { borderBottom: 'none' } }}>
      {/* Icon */}
      <Box sx={{ width: 28, height: 28, borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon sx={{ fontSize: '0.875rem', color: T.t2 }} />
      </Box>
      {/* Name + desc */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t1, fontWeight: 500, lineHeight: 1.2 }}>{name}</Typography>
        <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.6875rem', color: T.t3, lineHeight: 1.2, mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc}</Typography>
      </Box>
      {/* Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.875, flexShrink: 0 }}>
        {lp
          ? <CircularProgress size={9} sx={{ color: T.t3 }} />
          : <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: dotColor, boxShadow: isDown ? `0 0 0 2px rgba(248,113,113,0.2)` : isUp ? `0 0 0 2px rgba(74,222,128,0.15)` : 'none' }} />
        }
        <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.475rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: statusColor, width: 42 }}>
          {statusLabel}
        </Typography>
      </Box>
      {/* Latency */}
      <Typography sx={{ fontFamily: T.fontMono, fontSize: '0.6875rem', color: slow ? T.yellow : T.t3, width: 42, textAlign: 'right', flexShrink: 0 }}>
        {!lp && ms !== null ? `${ms}ms` : '—'}
      </Typography>
    </Box>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [time, setTime]           = useState(new Date());
  const [equipos, setEquipos]     = useState(null);
  const [empleados, setEmpleados] = useState(null);
  const [partesList, setPartesList] = useState(null);
  const [network, setNetwork]     = useState(null);
  const [netError, setNetError]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [lastCheck, setLastCheck] = useState(null);
  const [deltas, setDeltas]       = useState({ equipos: null, empleados: null, partes: null });

  // Service health state
  const [apiStatus, setApiStatus]   = useState({ status: 'unknown', ms: null });
  const [dbStatus, setDbStatus]     = useState({ status: 'unknown', ms: null });
  const [netStatus, setNetStatus]   = useState({ status: 'unknown', ms: null });

  const fetchAll = useCallback(async () => {
    setLoading(true);

    // ── API Backend health + Equipos ──────────────────────
    const t0 = Date.now();
    let equiposList = [];
    const apiOk = await getEquipos()
      .then(list => { equiposList = list; setEquipos(list.length); return true; })
      .catch(() => { setEquipos(0); return false; });
    const apiMs = Date.now() - t0;
    setApiStatus({ status: apiOk ? 'online' : 'offline', ms: apiOk ? apiMs : null });
    setDbStatus({ status: apiOk ? 'online' : 'unknown', ms: null });

    // ── Empleados + Partes ────────────────────────────────
    let empleadosList = [];
    let partesFetched = [];
    await Promise.allSettled([
      getEmpleados()
        .then(list => { empleadosList = list; setEmpleados(list.length); })
        .catch(() => setEmpleados(0)),
      getPartes().then(res => {
        const r = res.data || res;
        partesFetched = Array.isArray(r) ? r : (r?.results ?? []);
        setPartesList(partesFetched);
      }).catch(() => { partesFetched = []; setPartesList([]); }),
    ]);

    // ── Deltas ────────────────────────────────────────────
    const today = new Date().toISOString().slice(0, 10);
    const snaps = loadSnaps();
    const prevDate = Object.keys(snaps).filter(d => d < today).sort().pop();
    const prev = prevDate ? snaps[prevDate] : null;
    saveSnap({ equipos: equiposList.length, empleados: empleadosList.length });

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newThisWeek = partesFetched.filter(p =>
      p.fecha_apertura && new Date(p.fecha_apertura).getTime() > weekAgo
    ).length;

    setDeltas({
      equipos:   prev?.equipos   != null ? { n: equiposList.length   - prev.equipos,   label: 'vs ayer' } : null,
      empleados: prev?.empleados != null ? { n: empleadosList.length - prev.empleados, label: 'vs ayer' } : null,
      partes: { n: newThisWeek, label: 'nuevos esta semana' },
    });

    // ── Red Recolector ────────────────────────────────────
    const t1 = Date.now();
    const netOk = await getSummary()
      .then(s => { setNetwork(s); setNetError(false); return true; })
      .catch(() => { setNetError(true); return false; });
    const netMs = Date.now() - t1;
    setNetStatus({ status: netOk ? 'online' : 'offline', ms: netOk ? netMs : null });

    setLastCheck(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, [fetchAll]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const partesActivos = useMemo(() =>
    partesList ? partesList.filter(p => p.estado === 'pendiente' || p.estado === 'en_proceso').length : null
  , [partesList]);

  const donutSlices = useMemo(() => {
    if (!partesList) return [];
    return ESTADOS.map(e => ({ ...e, count: partesList.filter(p => p.estado === e.value).length })).filter(e => e.count > 0);
  }, [partesList]);
  const donutTotal = useMemo(() => donutSlices.reduce((s, e) => s + e.count, 0), [donutSlices]);

  const recientes = useMemo(() =>
    partesList
      ? [...partesList].sort((a, b) => new Date(b.fecha_apertura || 0) - new Date(a.fecha_apertura || 0)).slice(0, 6)
      : []
  , [partesList]);

  const switchDown    = network ? network.total_switches - network.reachable : null;
  const availability  = network?.total_switches > 0 ? Math.round((network.reachable / network.total_switches) * 100) : null;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontFamily: T.fontDisp, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.01em', color: T.t1, lineHeight: 1.2 }}>Dashboard</Typography>
          <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t3, mt: 0.25 }}>OKU Hotels · IT Ibiza</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', px: 1.5, height: 30, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: T.green, boxShadow: `0 0 0 2px rgba(74,222,128,0.15)` }} />
            <Typography sx={{ fontFamily: T.fontMono, fontSize: '0.6875rem', color: T.t2, letterSpacing: '0.04em' }}>
              {time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Typography>
          </Box>
          <Box onClick={fetchAll}
            sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.t3, transition: 'all 0.12s', '&:hover': { border: `1px solid ${T.borderStr}`, color: T.t2 } }}>
            <RefreshOutlinedIcon sx={{ fontSize: '0.875rem' }} />
          </Box>
        </Box>
      </Box>

      {/* ── KPI cards ──────────────────────────────────────────── */}
      <Grid container spacing={1.75}>
        {[
          { label: 'Equipos',         value: equipos,       icon: DevicesOutlinedIcon,     color: T.accent,  sub: 'En inventario',           lp: loading && equipos === null,   delta: deltas.equipos },
          { label: 'Empleados',       value: empleados,     icon: PeopleOutlinedIcon,      color: T.green,   sub: 'Personal registrado',     lp: loading && empleados === null, delta: deltas.empleados },
          { label: 'Partes activos',  value: partesActivos, icon: DescriptionOutlinedIcon, color: T.yellow,  sub: 'Pendientes + en proceso',  lp: loading && partesList === null, delta: deltas.partes },
          { label: 'Switches online', value: network?.reachable ?? null, icon: AccountTreeOutlinedIcon,
            color: switchDown > 0 ? T.yellow : T.blue,
            sub: network ? `de ${network.total_switches} en inventario` : netError ? 'Sin conexión' : 'Cargando…',
            lp: loading && !network && !netError },
        ].map((c, i) => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <StatCard {...c} />
          </Grid>
        ))}
      </Grid>

      {/* ── Middle row: 3 equal panels ─────────────────────────── */}
      <Grid container spacing={1.75} sx={{ alignItems: 'stretch' }}>

        {/* ① Partes · Distribución */}
        <Grid item xs={12} lg={4} sx={{ display: 'flex' }}>
          <Panel sx={{ width: '100%' }}>
            <PHead label="Partes · Distribución" action="Ver partes" onAction={() => navigate('/partes')} />
            {partesList === null ? <Loader label="Cargando datos…" />
            : donutTotal === 0 ? <Empty icon={DescriptionOutlinedIcon} label="Sin partes" />
            : (
              <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', alignItems: 'center' }}>
                {/* Donut */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2.5, py: 2, borderRight: `1px solid ${T.border}`, flexShrink: 0 }}>
                  <Donut slices={donutSlices} total={donutTotal} size={108} />
                </Box>
                {/* Bars legend */}
                <Box sx={{ flex: 1, px: 2, py: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.625 }}>
                  {ESTADOS.map(e => {
                    const count = partesList.filter(p => p.estado === e.value).length;
                    const pct = donutTotal > 0 ? (count / donutTotal) * 100 : 0;
                    if (count === 0) return null;
                    return (
                      <Box key={e.value} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.75rem', color: T.t2, width: 72, flexShrink: 0, lineHeight: 1 }}>{e.label}</Typography>
                        <Box sx={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${pct}%`, background: e.color, borderRadius: 2, transition: 'width 0.8s ease' }} />
                        </Box>
                        <Typography sx={{ fontFamily: T.fontMono, fontSize: '0.75rem', fontWeight: 500, color: T.t1, width: 18, textAlign: 'right', flexShrink: 0 }}>{count}</Typography>
                      </Box>
                    );
                  })}
                  <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.75rem', color: T.t3, width: 72, flexShrink: 0 }}>Total</Typography>
                    <Box sx={{ flex: 1 }} />
                    <Typography sx={{ fontFamily: T.fontMono, fontSize: '0.875rem', fontWeight: 500, color: T.t1, width: 18, textAlign: 'right' }}>{donutTotal}</Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Panel>
        </Grid>

        {/* ② Red · Infraestructura */}
        <Grid item xs={12} lg={4} sx={{ display: 'flex' }}>
          <Panel sx={{ width: '100%' }}>
            <PHead label="Red · Infraestructura" action="Ver switches" onAction={() => navigate('/redes')} />
            {netError ? (
              <Empty icon={WifiOffOutlinedIcon} label="Recolector no disponible" />
            ) : !network ? (
              <Loader label="Consultando red…" />
            ) : (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Online / Down */}
                <Box sx={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
                  <Box sx={{ flex: 1, px: 2.5, py: 1.875, borderRight: `1px solid ${T.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.875 }}>
                      <WifiOutlinedIcon sx={{ fontSize: '0.75rem', color: T.green }} />
                      <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.475rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.t3 }}>Online</Typography>
                    </Box>
                    <Typography sx={{ fontFamily: T.fontMono, fontSize: '1.625rem', fontWeight: 500, color: T.green, lineHeight: 1, letterSpacing: '-0.025em' }}>{network.reachable}</Typography>
                    <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.6875rem', color: T.t3, mt: 0.375 }}>respondiendo</Typography>
                  </Box>
                  <Box sx={{ flex: 1, px: 2.5, py: 1.875 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.875 }}>
                      <WifiOffOutlinedIcon sx={{ fontSize: '0.75rem', color: network.inaccessible > 0 ? T.red : T.t3 }} />
                      <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.475rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.t3 }}>Caídos</Typography>
                    </Box>
                    <Typography sx={{ fontFamily: T.fontMono, fontSize: '1.625rem', fontWeight: 500, color: network.inaccessible > 0 ? T.red : T.t3, lineHeight: 1, letterSpacing: '-0.025em' }}>{network.inaccessible}</Typography>
                    <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.6875rem', color: T.t3, mt: 0.375 }}>
                      {network.inaccessible > 0 ? 'requieren atención' : 'sin incidencias'}
                    </Typography>
                  </Box>
                </Box>
                {/* Availability bar */}
                <Box sx={{ px: 2.5, py: 1.375, borderBottom: `1px solid ${T.border}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.475rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.t3 }}>Disponibilidad</Typography>
                    <Typography sx={{ fontFamily: T.fontMono, fontSize: '0.75rem', color: availability >= 95 ? T.green : T.yellow, fontWeight: 500 }}>{availability}%</Typography>
                  </Box>
                  <Box sx={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${availability}%`, background: availability >= 95 ? T.green : T.yellow, borderRadius: 3, transition: 'width 1s ease' }} />
                  </Box>
                </Box>
                {/* Detail metrics */}
                <Box sx={{ flex: 1 }}>
                  {[
                    [RouterOutlinedIcon, 'Fabricantes',    `${network.vendors?.Aruba || 0} Aruba · ${network.vendors?.Ruckus || 0} Ruckus`],
                    [MemoryOutlinedIcon, 'MACs detectadas', (network.total_macs || 0).toLocaleString('es-ES')],
                    [AccountTreeOutlinedIcon, 'Vecinos LLDP', (network.total_neighbors || 0).toLocaleString('es-ES')],
                  ].map(([Icon, label, val]) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1, borderBottom: `1px solid rgba(255,255,255,0.025)` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon sx={{ fontSize: '0.75rem', color: T.t3 }} />
                        <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t3 }}>{label}</Typography>
                      </Box>
                      <Typography sx={{ fontFamily: T.fontMono, fontSize: '0.8125rem', color: T.t2, fontWeight: 500 }}>{val}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Panel>
        </Grid>

        {/* ③ Servicios · Estado del sistema */}
        <Grid item xs={12} lg={4} sx={{ display: 'flex' }}>
          <Panel sx={{ width: '100%' }}>
            <PHead label="Servicios · Estado del sistema" />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <ServiceRow
                icon={ApiOutlinedIcon}
                name="API Backend"
                desc="Django REST · :8000"
                status={apiStatus.status}
                ms={apiStatus.ms}
                loading={loading && apiStatus.status === 'unknown'}
              />
              <ServiceRow
                icon={StorageOutlinedIcon}
                name="Base de datos"
                desc="PostgreSQL · inferido vía API"
                status={dbStatus.status}
                ms={null}
                loading={loading && dbStatus.status === 'unknown'}
              />
              <ServiceRow
                icon={HubOutlinedIcon}
                name="Red Recolector"
                desc="FastAPI · :8001"
                status={netStatus.status}
                ms={netStatus.ms}
                loading={loading && netStatus.status === 'unknown'}
              />

              {/* Overall health badge */}
              <Box sx={{ mt: 'auto', px: 2.5, py: 1.5, borderTop: `1px solid ${T.border}` }}>
                {(() => {
                  const allOk = apiStatus.status === 'online' && netStatus.status === 'online';
                  const anyDown = apiStatus.status === 'offline' || netStatus.status === 'offline';
                  const color = loading ? T.t3 : anyDown ? T.red : allOk ? T.green : T.yellow;
                  const label = loading ? 'Verificando…' : anyDown ? 'Degradado' : allOk ? 'Todos los servicios operativos' : 'Verificando…';
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: anyDown ? `0 0 0 2px rgba(248,113,113,0.2)` : `0 0 0 2px rgba(74,222,128,0.12)` }} />
                        <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.75rem', color: T.t2 }}>{label}</Typography>
                      </Box>
                      {lastCheck && (
                        <Typography sx={{ fontFamily: T.fontMono, fontSize: '0.625rem', color: T.t3 }}>
                          {lastCheck.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </Typography>
                      )}
                    </Box>
                  );
                })()}
              </Box>
            </Box>
          </Panel>
        </Grid>
      </Grid>

      {/* ── Actividad reciente — full width ────────────────────── */}
      <Panel>
        <PHead label="Partes · Actividad reciente" action="Ver todos" onAction={() => navigate('/partes')} />
        {partesList === null ? <Loader label="Cargando actividad…" />
        : recientes.length === 0 ? <Empty icon={DescriptionOutlinedIcon} label="Sin partes registrados" />
        : (
          <>
            {/* Column headers */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '148px 1fr 1fr 168px 108px 80px', px: 2.5, py: 0.875, borderBottom: `1px solid ${T.border}`, background: T.bgHdr }}>
              {['Nº Parte', 'Receptor', 'Emisor', 'Tipo de entrega', 'Estado', 'Fecha'].map(h => (
                <Typography key={h} sx={{ fontFamily: T.fontDisp, fontSize: '0.475rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.t3 }}>{h}</Typography>
              ))}
            </Box>
            {/* Rows */}
            {recientes.map((p, i) => (
              <Box key={p.id} onClick={() => navigate(`/partes/${p.id}`)}
                sx={{ display: 'grid', gridTemplateColumns: '148px 1fr 1fr 168px 108px 80px', px: 2.5, py: 1.125, alignItems: 'center', borderBottom: i < recientes.length - 1 ? `1px solid rgba(255,255,255,0.025)` : 'none', cursor: 'pointer', transition: 'background 0.1s', '&:hover': { background: T.bgHover } }}>
                <Typography sx={{ fontFamily: T.fontMono, fontSize: '0.75rem', color: T.accent, fontWeight: 500 }}>
                  {p.numero_parte || `#${p.id}`}
                </Typography>
                <Box sx={{ minWidth: 0, pr: 2 }}>
                  <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t1, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.receptor_nombre || '—'}</Typography>
                  {p.receptor_departamento && <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.6875rem', color: T.t3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.receptor_departamento}</Typography>}
                </Box>
                <Box sx={{ minWidth: 0, pr: 2 }}>
                  <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.8125rem', color: T.t2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.emisor_nombre || p.solicitante || '—'}</Typography>
                  {p.emisor_rol && <Typography sx={{ fontFamily: T.fontUI, fontSize: '0.6875rem', color: T.t3 }}>{p.emisor_rol}</Typography>}
                </Box>
                <Box>
                  {p.tipo_entrega
                    ? <Chip label={p.tipo_entrega} size="small" sx={{ background: T.accentDim, color: T.accent, border: `1px solid ${T.accentBdr}`, fontFamily: T.fontDisp, fontSize: '0.475rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', height: 17, borderRadius: '3px' }} />
                    : <Typography sx={{ color: T.t3, fontSize: '0.8rem' }}>—</Typography>
                  }
                </Box>
                <Box><EChip val={p.estado} /></Box>
                <Typography sx={{ fontFamily: T.fontMono, fontSize: '0.75rem', color: T.t3 }}>
                  {p.fecha_apertura ? new Date(p.fecha_apertura).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'}
                </Typography>
              </Box>
            ))}
          </>
        )}
      </Panel>

    </Box>
  );
}
