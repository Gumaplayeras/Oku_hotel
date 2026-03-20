import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../api/auth';
import {
  AppBar, Toolbar, Typography, Button, Box, Badge,
  IconButton, Menu, MenuItem, Avatar, Chip, Drawer, Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Hotel as HotelIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { getMyProfile } from '../../api/user';
import Profile from '../../pages/Profile';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const open = Boolean(anchorEl);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMyProfile();
        if (!cancelled) setUser(me);
      } catch (e) {
        // Redirige a login si no estamos autenticados
        if (e?.response?.status === 401) {
          try { await logout(); } catch { }
          if (!cancelled) navigate('/login');
        } else {
          console.error('Error cargando usuario', e);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const displayName = user
    ? ((user.first_name || user.last_name)
      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
      : (user.username || ''))
    : '';

  const avatarInitials = user
    ? ((user.first_name && user.last_name)
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : (user.username ? user.username.slice(0, 2).toUpperCase() : 'IT'))
    : 'IT';

  const navItems = [
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'Equipos', path: '/equipos' },
    { text: 'Empleados', path: '/empleados' },
    { text: 'Partes', path: '/partes' },
    { text: 'Redes', path: '/redes' },
  ];


  const Logo = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        gap: 2
      }}
      onClick={() => navigate('/dashboard')}
    >
      <Box sx={{ position: 'relative' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '3px',
            fontSize: '1.6rem',
            fontFamily: '"Inter", sans-serif',
            background: 'linear-gradient(135deg, #ffffff, #e2e8f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -4,
              left: 0,
              width: '100%',
              height: '2px',
              background: 'linear-gradient(90deg, #d4a574, transparent)',
              opacity: 0.6
            }
          }}
        >
          OKU HOTELS
        </Typography>
      </Box>
      <Chip
        label="IBIZA"
        size="small"
        icon={<LocationIcon sx={{ fontSize: '1rem !important' }} />}
        sx={{
          background: 'linear-gradient(135deg, #d4a574, #c9975b)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.7rem',
          letterSpacing: '1px',
          height: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(212, 165, 116, 0.3)',
          '& .MuiChip-label': { padding: '0 6px 0 0' }
        }}
      />
    </Box>
  );

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'rgba(15, 18, 23, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
        }
      }}
    >
      <Toolbar sx={{
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 1,
        py: 1
      }}>

        <Logo />

        <Box sx={{
          display: { xs: 'none', sm: 'flex' },
          gap: 1,
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          padding: '6px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                fontWeight: location.pathname === item.path ? 600 : 400,
                color: location.pathname === item.path ? '#ffffff' : '#94a3b8',
                borderRadius: '8px',
                padding: '8px 16px',
                textTransform: 'none',
                fontSize: '0.9rem',
                minWidth: 'auto',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                background: location.pathname === item.path
                  ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.15), rgba(201, 151, 91, 0.15))'
                  : 'transparent',
                border: location.pathname === item.path
                  ? '1px solid rgba(212, 165, 116, 0.3)'
                  : '1px solid transparent',
                '&:hover': {
                  color: '#ffffff',
                  background: location.pathname === item.path
                    ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.2), rgba(201, 151, 91, 0.2))'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          padding: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <IconButton
            color="inherit"
            sx={{
              color: '#94a3b8',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.08)'
              }
            }}
          >
            <Badge
              badgeContent={4}
              sx={{
                '& .MuiBadge-badge': {
                  background: 'linear-gradient(135deg, #d4a574, #c9975b)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.7rem',
                  boxShadow: '0 2px 4px rgba(212, 165, 116, 0.3)'
                }
              }}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {displayName && (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', mr: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600, lineHeight: 1 }}>
                  {displayName}
                </Typography>
                {user?.email && (
                  <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1 }}>
                    {user.email}
                  </Typography>
                )}
              </Box>
            )}
            {user?.rol && (
              <Chip
                label={user.rol}
                size="small"
                sx={{
                  height: 24,
                  background: 'rgba(212,165,116,0.15)',
                  border: '1px solid rgba(212,165,116,0.35)',
                  color: '#fff'
                }}
              />
            )}
            <IconButton
              color="inherit"
              onClick={handleMenu}
              sx={{
                color: '#94a3b8',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.08)'
                }
              }}
              aria-label="Menú de usuario"
            >
              <Avatar sx={{
                background: 'linear-gradient(135deg, #d4a574, #c9975b)',
                width: 36,
                height: 36,
                border: '1px solid rgba(212, 165, 116, 0.3)',
                color: '#ffffff',
                fontWeight: 600
              }}>
                {avatarInitials}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 220,
                background: 'rgba(15, 18, 23, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                color: '#ffffff',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                '& .MuiMenuItem-root': {
                  borderRadius: '8px',
                  margin: '4px',
                  fontWeight: 400,
                  color: '#d1d5db',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'rgba(212, 165, 116, 0.1)',
                    color: '#ffffff'
                  }
                }
              }
            }}
          >
            <MenuItem onClick={() => { setOpenProfile(true); handleClose(); }}>
              Mi Perfil
            </MenuItem>
            <MenuItem onClick={() => { navigate('/users/manage'); handleClose(); }}>
              Gestión de Usuarios
            </MenuItem>
            <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.08)' }} />
            <MenuItem onClick={handleLogout}>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* Drawer de Perfil (flotante, integrado en el dashboard) */}
      <Drawer
        anchor="right"
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 440 },
            background: 'rgba(15,18,23,0.97)',
            color: '#fff',
            borderLeft: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Mi Perfil</Typography>
          <IconButton onClick={() => setOpenProfile(false)} sx={{ color: '#94a3b8' }} aria-label="Cerrar perfil">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        <Box sx={{ p: 2 }}>
          <Profile />
        </Box>
      </Drawer>
    </AppBar>
  );
}