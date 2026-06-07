import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Box, Typography, Tooltip } from '@mui/material';
import { T } from '../../theme/theme';

// Icons — outlined, refined
import GridViewOutlinedIcon       from '@mui/icons-material/GridViewOutlined';
import DevicesOutlinedIcon         from '@mui/icons-material/DevicesOutlined';
import PeopleOutlinedIcon          from '@mui/icons-material/PeopleOutlined';
import DescriptionOutlinedIcon     from '@mui/icons-material/DescriptionOutlined';
import AccountTreeOutlinedIcon     from '@mui/icons-material/AccountTreeOutlined';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

const W_OPEN   = 216;
const W_CLOSED = 52;

const NAV = [
  { text: 'Dashboard', icon: GridViewOutlinedIcon,      path: '/',         end: true },
  { text: 'Equipos',   icon: DevicesOutlinedIcon,       path: '/equipos' },
  { text: 'Empleados', icon: PeopleOutlinedIcon,        path: '/empleados' },
  { text: 'Partes',    icon: DescriptionOutlinedIcon,   path: '/partes' },
  { text: 'Redes',     icon: AccountTreeOutlinedIcon,   path: '/redes' },
];

// OKU logo mark — a stylized grid (references hotel architecture)
const OkuMark = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect x="1" y="1" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9" />
    <rect x="12" y="1" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
    <rect x="1" y="12" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
    <rect x="12" y="12" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.35" />
  </svg>
);

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: open ? W_OPEN : W_CLOSED,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: T.bgCard,
        borderRight: `1px solid ${T.border}`,
        transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* ── Logo ───────────────────────────────────────────────── */}
      <Box
        sx={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          px: open ? 2 : 0,
          justifyContent: open ? 'flex-start' : 'center',
          borderBottom: `1px solid ${T.border}`,
          cursor: 'pointer',
          gap: 1.5,
          flexShrink: 0,
          transition: 'padding 0.2s',
          '&:hover .logo-mark': { color: '#d4b56a' },
        }}
        onClick={() => navigate('/')}
      >
        <Box
          className="logo-mark"
          sx={{
            color: T.accent,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            transition: 'color 0.15s',
          }}
        >
          <OkuMark size={18} />
        </Box>
        {open && (
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: T.fontDisp,
                fontWeight: 700,
                fontSize: '0.8125rem',
                letterSpacing: '0.04em',
                color: T.t1,
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
              }}
            >
              OKU Hotels
            </Typography>
            <Typography
              sx={{
                fontFamily: T.fontDisp,
                fontWeight: 500,
                fontSize: '0.5625rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: T.t3,
                lineHeight: 1,
              }}
            >
              IT Portal · Ibiza
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <Box sx={{ flex: 1, py: 1.5, overflow: 'hidden' }}>
        {open && (
          <Typography
            sx={{
              fontFamily: T.fontDisp,
              fontSize: '0.5625rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: T.t3,
              px: 2,
              mb: 0.75,
              display: 'block',
              mt: 0.5,
            }}
          >
            Sistema
          </Typography>
        )}

        {NAV.map(item => {
          const Icon = item.icon;
          return (
            <Tooltip key={item.path} title={!open ? item.text : ''} placement="right" arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    background: '#1A1A22',
                    border: `1px solid ${T.borderStr}`,
                    color: T.t1,
                    fontFamily: T.fontUI,
                    fontSize: '0.8125rem',
                    borderRadius: '6px',
                  },
                },
              }}
            >
              <Box component="span" sx={{ display: 'block', px: open ? 1.25 : 0, mx: open ? 0 : 'auto', width: open ? 'auto' : W_CLOSED }}>
                <NavLink to={item.path} end={item.end} style={{ textDecoration: 'none', display: 'block' }}>
                  {({ isActive }) => (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        height: 36,
                        px: open ? 1 : 0,
                        justifyContent: open ? 'flex-start' : 'center',
                        borderRadius: '6px',
                        mb: 0.25,
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.12s',
                        background: isActive ? T.bgActive : 'transparent',
                        borderLeft: isActive ? `2px solid ${T.accent}` : '2px solid transparent',
                        '&:hover': {
                          background: isActive ? T.bgActive : T.bgHover,
                        },
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: '1rem',
                          flexShrink: 0,
                          color: isActive ? T.accent : T.t3,
                          transition: 'color 0.12s',
                          ml: open ? 0 : '-1px',
                        }}
                      />
                      {open && (
                        <Typography
                          sx={{
                            fontFamily: T.fontUI,
                            fontSize: '0.8125rem',
                            fontWeight: isActive ? 500 : 400,
                            color: isActive ? T.t1 : T.t2,
                            whiteSpace: 'nowrap',
                            letterSpacing: '0.01em',
                            transition: 'color 0.12s',
                          }}
                        >
                          {item.text}
                        </Typography>
                      )}
                    </Box>
                  )}
                </NavLink>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* ── Collapse toggle ────────────────────────────────────── */}
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{
          height: 44,
          borderTop: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-end' : 'center',
          px: open ? 1.75 : 0,
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.12s',
          '&:hover': { background: T.bgHover },
          '&:hover .toggle-icon': { color: T.t2 },
        }}
      >
        <Box
          className="toggle-icon"
          sx={{ color: T.t3, display: 'flex', alignItems: 'center', transition: 'color 0.12s' }}
        >
          {open
            ? <KeyboardDoubleArrowLeftIcon sx={{ fontSize: '0.875rem' }} />
            : <KeyboardDoubleArrowRightIcon sx={{ fontSize: '0.875rem' }} />
          }
        </Box>
      </Box>
    </Box>
  );
}
