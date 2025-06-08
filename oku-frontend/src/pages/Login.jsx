import React, { useState } from 'react';
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";
import { useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  Box, Button, Container, TextField, Typography, 
  IconButton, InputAdornment, Fade, useTheme 
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { login } from '../api/auth';
import okuLogo from '../assets/oku_hotels_logo-modified.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);
    try {
      const data = await login(username, password);
      localStorage.setItem('token', data.access);
      navigate('/Dashboard');
    } catch (err) {
      setError('Credenciales inválidas. Por favor intente nuevamente');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          radial-gradient(circle at 15% 50%, rgba(25, 55, 109, 0.2) 0%, transparent 25%),
          radial-gradient(circle at 85% 30%, rgba(56, 30, 89, 0.15) 0%, transparent 25%),
          linear-gradient(135deg, #0f172a 0%, #1e293b 100%)
        `,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: `
            radial-gradient(circle at 70% 80%, rgba(14, 165, 233, 0.08) 0%, transparent 15%),
            radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 15%)
          `,
          zIndex: 0,
        }
      }}
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          background: { color: "transparent" },
          fpsLimit: 60,
          interactivity: {
            events: {
              onClick: { enable: true, mode: "push" },
              onHover: { enable: true, mode: "repulse" },
            },
            modes: {
              push: { quantity: 2 },
              repulse: { distance: 80, duration: 0.4 },
            },
          },
          particles: {
            color: { value: "#0ea5e9" },
            links: { enable: true, color: "#0ea5e9", opacity: 0.3, distance: 150 },
            collisions: { enable: false },
            move: { enable: true, speed: 1, outModes: { default: "bounce" } },
            number: { value: 40, density: { enable: true, area: 800 } },
            opacity: { value: 0.3 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } },
          },
          detectRetina: true,
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1
        }}
      />
      <Container maxWidth="xs" sx={{ zIndex: 1, py: 4 }}>
        <Fade in timeout={800}>
          <Box
            sx={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(16px) saturate(180%)',
              borderRadius: '20px',
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.05),
                inset 0 0 20px rgba(14, 165, 233, 0.1)
              `,
              border: '1px solid rgba(148, 163, 184, 0.15)',
              p: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
                zIndex: 1,
              }
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box 
                sx={{ 
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  animation: 'pulse 4s infinite',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.03)' },
                    '100%': { transform: 'scale(1)' }
                  }
                }}
              >
                <img 
                  src={okuLogo} 
                  alt="OKU Logo" 
                  style={{ 
                    height: 80,
                    filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))' 
                  }} 
                />
              </Box>

              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#f8fafc',
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  mt: 1
                }}
              >
                IT MANAGEMENT
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#94a3b8', 
                  mt: 1,
                  fontWeight: 300,
                  letterSpacing: '0.5px'
                }}
              >
                Management Portal
              </Typography>
            </Box>

            {error && (
              <Box 
                sx={{
                  background: 'rgba(220, 38, 38, 0.15)',
                  borderRadius: '10px',
                  p: 1.5,
                  mb: 3,
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  backdropFilter: 'blur(4px)',
                  animation: 'shake 0.5s',
                  '@keyframes shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '75%': { transform: 'translateX(5px)' }
                  }
                }}
              >
                <Typography 
                  color="error" 
                  align="center" 
                  sx={{ 
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="1.5"></circle>
                    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="1.5"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="1.5"></line>
                  </svg>
                  {error}
                </Typography>
              </Box>
            )}

            <Box sx={{ maxWidth: 350, mx: "auto" }}>
              <TextField
                fullWidth
                label="Usuario"
                margin="normal"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setActiveField('username')}
                onBlur={() => setActiveField(null)}
                InputLabelProps={{ 
                  style: { 
                    color: activeField === 'username' ? theme.palette.primary.main : '#94a3b8',
                    fontWeight: 500
                  } 
                }}
                InputProps={{
                  style: { 
                    color: '#f1f5f9',
                    fontSize: '1rem'
                  },
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: activeField === 'username' ? theme.palette.primary.main : '#64748b' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" 
                              stroke="currentColor" strokeWidth="1.5" />
                        <path d="M20 18C20 16.6044 19.4728 15.2621 18.5355 14.2626C17.5983 13.2631 16.3261 12.6857 15 12.6857H9C7.67392 12.6857 6.40169 13.2631 5.46447 14.2626C4.52724 15.2621 4 16.6044 4 18" 
                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: activeField === 'username' 
                        ? `${theme.palette.primary.main}80` 
                        : 'rgba(255, 255, 255, 0.15)',
                      borderWidth: '1.5px'
                    },
                    '&:hover fieldset': {
                      borderColor: `${theme.palette.primary.main}80`,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`,
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setActiveField('password')}
                onBlur={() => setActiveField(null)}
                InputLabelProps={{ 
                  style: { 
                    color: activeField === 'password' ? theme.palette.primary.main : '#94a3b8',
                    fontWeight: 500
                  } 
                }}
                InputProps={{
                  style: { 
                    color: '#f1f5f9',
                    fontSize: '1rem'
                  },
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: activeField === 'password' ? theme.palette.primary.main : '#64748b' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="10" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M7 10V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V10" 
                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="12" cy="15" r="1" fill="currentColor" />
                      </svg>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ 
                          color: activeField === 'password' ? theme.palette.primary.main : '#64748b',
                          '&:hover': {
                            color: theme.palette.primary.light
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: activeField === 'password' 
                        ? `${theme.palette.primary.main}80` 
                        : 'rgba(255, 255, 255, 0.15)',
                      borderWidth: '1.5px'
                    },
                    '&:hover fieldset': {
                      borderColor: `${theme.palette.primary.main}80`,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`,
                    },
                  },
                }}
              />

              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isLoading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                  letterSpacing: '0.5px',
                  background: 'linear-gradient(45deg, #0ea5e9 0%, #6366f1 100%)',
                  borderRadius: '12px',
                  boxShadow: `
                    0 4px 20px rgba(14, 165, 233, 0.3),
                    inset 0 1px 1px rgba(255, 255, 255, 0.2)
                  `,
                  position: 'relative',
                  overflow: 'hidden',
                  transform: 'translateY(0)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `
                      0 8px 25px rgba(99, 102, 241, 0.5),
                      inset 0 1px 1px rgba(255, 255, 255, 0.3)
                    `,
                    background: 'linear-gradient(45deg, #0ea5e9 10%, #6366f1 100%)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    transition: 'left 0.7s',
                  },
                  '&:hover::before': {
                    left: '100%',
                  },
                  '&.Mui-disabled': {
                    background: 'linear-gradient(45deg, #64748b 0%, #475569 100%)',
                  }
                }}
              >
                {isLoading ? 'VERIFICANDO...' : 'Login'}
              </Button>
            </Box>

            <Box 
              sx={{ 
                mt: 4, 
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px'
                }}
              >
                © {new Date().getFullYear()} Oku Hotels IT Department
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}