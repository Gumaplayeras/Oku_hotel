import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../api/auth';
import { 
  AppBar, Toolbar, Typography, Button, Box, Badge, 
  IconButton, Menu, MenuItem, Avatar, Chip
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Hotel as HotelIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const navItems = [
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'Equipos', path: '/equipos' },
    { text: 'SIMs', path: '/sims' },
    { text: 'Empleados', path: '/empleados' },
    { text: 'Incidencias', path: '/incidencias' },
    { text: 'Redes', path: '/redes' },
  ];

  // Opción 1: Logo con icono y subtítulo elegante
  const LogoOption1 = () => (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '8px 12px',
        borderRadius: '12px',
        position: 'relative',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.05)',
          transform: 'translateY(-1px)',
        }
      }}
      onClick={() => navigate('/dashboard')}
    >
      <Box sx={{
        width: 40,
        height: 40,
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #d4a574, #c9975b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mr: 2,
        boxShadow: '0 4px 12px rgba(212, 165, 116, 0.3)',
        border: '1px solid rgba(212, 165, 116, 0.3)'
      }}>
        <HotelIcon sx={{ color: '#ffffff', fontSize: '1.3rem' }} />
      </Box>
      <Box>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '2px',
            fontSize: '1.4rem',
            lineHeight: 1,
            fontFamily: '"Playfair Display", serif',
          }}
        >
          OKU
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LocationIcon sx={{ fontSize: '0.75rem', color: '#d4a574', opacity: 0.8 }} />
          <Typography 
            variant="caption"
            sx={{ 
              color: '#94a3b8',
              fontSize: '0.7rem',
              fontWeight: 500,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            Ibiza
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  // Opción 2: Estilo moderno con badge
  const LogoOption2 = () => (
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
        sx={{
          background: 'linear-gradient(135deg, #d4a574, #c9975b)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.7rem',
          letterSpacing: '1px',
          height: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(212, 165, 116, 0.3)',
          '& .MuiChip-label': {
            padding: '0 8px'
          }
        }}
      />
    </Box>
  );

  // Opción 3: Estilo premium con separador
  const LogoOption3 = () => (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        padding: '6px 0'
      }}
      onClick={() => navigate('/dashboard')}
    >
      <Box>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 300,
            color: '#ffffff',
            letterSpacing: '4px',
            fontSize: '1.8rem',
            fontFamily: '"Montserrat", sans-serif',
            lineHeight: 1,
            mb: 0.5
          }}
        >
          OKU
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          opacity: 0.8 
        }}>
          <Box sx={{
            width: '20px',
            height: '1px',
            background: 'linear-gradient(90deg, #d4a574, transparent)'
          }} />
          <Typography 
            variant="caption"
            sx={{ 
              color: '#cbd5e1',
              fontSize: '0.75rem',
              fontWeight: 400,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontFamily: '"Inter", sans-serif'
            }}
          >
            Hotels · Ibiza
          </Typography>
        </Box>
      </Box>
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
        
        {/* Cambia entre LogoOption1, LogoOption2, o LogoOption3 */}
        <LogoOption2 />

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
          >
            <Avatar sx={{ 
              background: 'linear-gradient(135deg, #d4a574, #c9975b)',
              width: 36,
              height: 36,
              border: '1px solid rgba(212, 165, 116, 0.3)',
              color: '#ffffff',
              fontWeight: 600
            }}>
              IT
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
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
            <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
              Mi Perfil
            </MenuItem>
            <MenuItem onClick={() => { navigate('/admin/users'); handleClose(); }}>
              Gestión de Usuarios
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}