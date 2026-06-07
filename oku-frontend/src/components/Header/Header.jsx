import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../api/auth';
import {
  Box, Typography, Avatar, IconButton, Menu, MenuItem,
  Divider, Badge, Drawer, Chip
} from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import CircleIcon from '@mui/icons-material/Circle';
import { getMyProfile } from '../../api/user';
import Profile from '../../pages/Profile';
import { T } from '../../theme/theme';

const ROUTES = {
  '/':               ['Dashboard',         'Visión general del sistema'],
  '/dashboard':      ['Dashboard',         'Visión general del sistema'],
  '/equipos':        ['Equipos',           'Inventario tecnológico'],
  '/empleados':      ['Empleados',         'Directorio de personal'],
  '/partes':         ['Partes',            'Gestión de incidencias'],
  '/partes/nuevo':   ['Nuevo Parte',       'Crear parte de entrega'],
  '/redes':          ['Redes',             'Monitorización de infraestructura'],
  '/users/manage':   ['Usuarios',          'Gestión de accesos'],
  '/profile':        ['Perfil',            'Datos de cuenta'],
  '/movimientos':    ['Movimientos',       'Historial de inventario'],
};

function useRoute(p) {
  if (ROUTES[p]) return ROUTES[p];
  if (p.startsWith('/redes/'))  return ['Switch Detail', 'Información del dispositivo'];
  if (p.startsWith('/partes/')) return ['Parte',         'Detalle del parte'];
  return ['', ''];
}

export default function Header() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();
  const [user, setUser]           = useState(null);
  const [anchor, setAnchor]       = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [title, subtitle] = useRoute(pathname);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const me = await getMyProfile();
        if (!dead) setUser(me);
      } catch (e) {
        if (e?.response?.status === 401) {
          try { await logout(); } catch {}
          if (!dead) navigate('/login');
        }
      }
    })();
    return () => { dead = true; };
  }, [navigate]);

  const handleLogout = async () => {
    try { await logout(); setAnchor(null); navigate('/login'); } catch {}
  };

  const name = user
    ? ((user.first_name || user.last_name)
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
        : user.username || '')
    : '';

  const initials = user
    ? ((user.first_name && user.last_name)
        ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
        : (user.username?.slice(0, 2).toUpperCase() || 'IT'))
    : 'IT';

  return (
    <Box
      component="header"
      sx={{
        height: 52,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        background: T.bgCard,
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      {/* Page info */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <Typography
          sx={{
            fontFamily: T.fontDisp,
            fontSize: '0.8125rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: T.t1,
            lineHeight: 1,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', background: T.t3, flexShrink: 0, mb: '1px' }} />
            <Typography
              sx={{
                fontFamily: T.fontUI,
                fontSize: '0.75rem',
                color: T.t3,
                lineHeight: 1,
              }}
            >
              {subtitle}
            </Typography>
          </>
        )}
      </Box>

      {/* Right side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {/* Notifications */}
        <IconButton
          size="small"
          sx={{
            width: 32, height: 32,
            borderRadius: '6px',
            color: T.t3,
            border: `1px solid transparent`,
            transition: 'all 0.12s',
            '&:hover': {
              color: T.t2,
              background: T.bgHover,
              border: `1px solid ${T.border}`,
            },
          }}
        >
          <Badge
            badgeContent={4}
            sx={{
              '& .MuiBadge-badge': {
                background: T.accent,
                color: T.bg,
                fontSize: '0.5625rem',
                fontFamily: T.fontDisp,
                fontWeight: 700,
                minWidth: 14,
                height: 14,
                borderRadius: 7,
                padding: 0,
              },
            }}
          >
            <NotificationsNoneOutlinedIcon sx={{ fontSize: '1rem' }} />
          </Badge>
        </IconButton>

        {/* Divider */}
        <Box sx={{ width: 1, height: 16, background: T.border, mx: 0.75 }} />

        {/* User button */}
        <Box
          onClick={e => setAnchor(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            height: 32,
            px: 1,
            borderRadius: '6px',
            cursor: 'pointer',
            border: `1px solid transparent`,
            transition: 'all 0.12s',
            '&:hover': {
              background: T.bgHover,
              border: `1px solid ${T.border}`,
            },
          }}
        >
          {/* Status indicator */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                borderRadius: '5px',
                background: `linear-gradient(135deg, ${T.accent} 0%, #b8924a 100%)`,
                fontSize: '0.625rem',
                fontFamily: T.fontDisp,
                fontWeight: 700,
                color: T.bg,
              }}
            >
              {initials}
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: -1,
                right: -1,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: T.green,
                border: `1.5px solid ${T.bgCard}`,
              }}
            />
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography
              sx={{
                fontFamily: T.fontUI,
                fontSize: '0.75rem',
                fontWeight: 500,
                color: T.t1,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                letterSpacing: '0.01em',
              }}
            >
              {name || '—'}
            </Typography>
          </Box>

          <ExpandMoreIcon sx={{ color: T.t3, fontSize: '0.875rem', ml: -0.25 }} />
        </Box>
      </Box>

      {/* Dropdown */}
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{
          sx: {
            mt: 0.75,
            minWidth: 208,
            background: '#1A1A22',
            border: `1px solid ${T.borderStr}`,
            borderRadius: '8px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
            color: T.t1,
            '& .MuiMenuItem-root': {
              fontFamily: T.fontUI,
              fontSize: '0.8125rem',
              py: 0.875,
              px: 1.5,
              borderRadius: '5px',
              mx: 0.5,
              color: T.t2,
              letterSpacing: '0.01em',
              transition: 'all 0.1s',
              '&:hover': { background: 'rgba(255,255,255,0.04)', color: T.t1 },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, mb: 0.5 }}>
          <Typography sx={{ fontFamily: T.fontUI, color: T.t1, fontWeight: 500, fontSize: '0.8125rem', letterSpacing: '0.01em' }}>
            {name || 'Usuario'}
          </Typography>
          {user?.email && (
            <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.6875rem', mt: 0.25, letterSpacing: '0.01em' }}>
              {user.email}
            </Typography>
          )}
        </Box>
        <Divider sx={{ borderColor: T.border, mb: 0.5 }} />
        <MenuItem onClick={() => { setProfileOpen(true); setAnchor(null); }}>Mi Perfil</MenuItem>
        <MenuItem onClick={() => { navigate('/users/manage'); setAnchor(null); }}>Gestión de Usuarios</MenuItem>
        <Divider sx={{ borderColor: T.border, my: 0.5 }} />
        <MenuItem
          onClick={handleLogout}
          sx={{ color: `${T.red} !important`, '&:hover': { background: 'rgba(248,113,113,0.06) !important' } }}
        >
          Cerrar Sesión
        </MenuItem>
      </Menu>

      {/* Profile drawer */}
      <Drawer
        anchor="right"
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            background: T.bgCard,
            borderLeft: `1px solid ${T.border}`,
            color: T.t1,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: `1px solid ${T.border}` }}>
          <Box>
            <Typography sx={{ fontFamily: T.fontDisp, color: T.t1, fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.02em' }}>
              Mi Perfil
            </Typography>
            <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.75rem', mt: 0.25 }}>
              Datos de cuenta y empleado
            </Typography>
          </Box>
          <IconButton
            onClick={() => setProfileOpen(false)}
            sx={{
              color: T.t3, borderRadius: '6px', width: 30, height: 30,
              border: `1px solid transparent`,
              '&:hover': { color: T.t2, background: T.bgHover, border: `1px solid ${T.border}` },
            }}
          >
            <CloseIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>
        <Box sx={{ p: 3, overflowY: 'auto' }}>
          <Profile />
        </Box>
      </Drawer>
    </Box>
  );
}
