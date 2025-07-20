import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { 
  Devices as DevicesIcon,
  SimCard as SimCardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { getTotalEquipos, getTotalSims, getTotalEmpleados, getTotalIncidencias } from '../api/dashboard';
import CountUp from 'react-countup';

const Dashboard = () => {
  const [data, setData] = useState({
    equipos: null,
    sims: null,
    empleados: null,
    incidencias: null,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equiposTotal, simsTotal, empleadosTotal, incidenciasTotal] = await Promise.all([
          getTotalEquipos(), 
          getTotalSims(), 
          getTotalEmpleados(), 
          getTotalIncidencias()
        ]);
        
        setData({
          equipos: equiposTotal,
          sims: simsTotal,
          empleados: empleadosTotal,
          incidencias: incidenciasTotal,
          error: null
        });
      } catch (error) { 
        console.error('Error cargando datos del dashboard:', error);
        setData(prev => ({ ...prev, error: 'Error al cargar los datos' }));
      }
    };
    
    fetchData();
  }, []);

  const cardConfigs = [
    {
      title: 'Total Equipos',
      value: data.equipos,
      icon: <DevicesIcon />,
      color: '#2563eb',
      lightColor: '#eff6ff',
      darkColor: '#1e40af'
    },
    {
      title: 'Total SIMs',
      value: data.sims,
      icon: <SimCardIcon />,
      color: '#0891b2',
      lightColor: '#ecfeff',
      darkColor: '#0e7490'
    },
    {
      title: 'Incidencias',
      value: data.incidencias,
      icon: <AssignmentIcon />,
      color: '#dc2626',
      lightColor: '#fef2f2',
      darkColor: '#b91c1c'
    },
    {
      title: 'Empleados',
      value: data.empleados,
      icon: <PeopleIcon />,
      color: '#16a34a',
      lightColor: '#f0fdf4',
      darkColor: '#15803d'
    }
  ];

  const renderCard = (config) => (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        height: '100%',
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          background: 'rgba(30, 41, 59, 0.8)',
          border: `1px solid ${config.color}40`,
          boxShadow: `0 20px 40px -12px ${config.color}20`,
          '& .card-icon': {
            transform: 'scale(1.1)',
            backgroundColor: config.color,
            color: '#ffffff',
            boxShadow: `0 8px 20px ${config.color}40`
          },
          '& .card-number': {
            color: '#ffffff'
          },
          '& .card-title': {
            color: '#e2e8f0'
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${config.color}, ${config.color}80, transparent)`,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -2,
          right: -2,
          width: '4px',
          height: '40px',
          background: `linear-gradient(180deg, ${config.color}60, transparent)`,
          borderRadius: '2px'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 2
      }}>
        <Box>
          <Typography 
            variant="body2" 
            className="card-title"
            sx={{ 
              color: '#94a3b8',
              fontWeight: 500,
              fontSize: '0.875rem',
              mb: 1.5,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease'
            }}
          >
            {config.title}
          </Typography>
          {config.value === null ? (
            <CircularProgress 
              size={28} 
              sx={{ 
                color: config.color,
                mt: 1
              }} 
            />
          ) : (
            <Typography 
              variant="h3" 
              className="card-number"
              sx={{ 
                color: '#f1f5f9',
                fontWeight: 700,
                fontSize: { xs: '1.875rem', sm: '2.25rem' },
                transition: 'color 0.3s ease',
                fontFamily: '"Inter", sans-serif',
                lineHeight: 1.1
              }}
            >
              <CountUp end={config.value || 0} duration={2.5} separator="." />
            </Typography>
          )}
        </Box>
        
        <Box 
          className="card-icon"
          sx={{
            width: 60, 
            height: 60, 
            borderRadius: '14px', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center', 
            backgroundColor: `${config.color}15`,
            color: config.color,
            border: `1px solid ${config.color}20`,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            '& svg': {
              fontSize: '1.75rem',
              transition: 'all 0.3s ease'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: '14px',
              background: `conic-gradient(from 0deg, ${config.color}00, ${config.color}30, ${config.color}00)`,
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }
          }}
        >
          {config.icon}
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            color: '#ffffff',
            fontWeight: 600,
            fontSize: { xs: '1.875rem', sm: '2.25rem', md: '2.5rem' },
            mb: 1,
            letterSpacing: '-0.025em'
          }}
        >
          Dashboard IT
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#cbd5e1',
            fontSize: '1rem',
            fontWeight: 400,
            mb: 3
          }}
        >
          Gestión y monitoreo de recursos tecnológicos
        </Typography>
        
        {/* Subtle decorative element */}
        <Box sx={{
          width: '80px',
          height: '2px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.6), transparent)',
          borderRadius: '1px',
          opacity: 0.7
        }} />
      </Box>
      
      {/* Error Message */}
      {data.error && (
        <Paper sx={{
          p: 3,
          mb: 3,
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '12px',
          borderLeft: '4px solid #dc2626',
          backdropFilter: 'blur(10px)'
        }}>
          <Typography sx={{ color: '#fca5a5', fontWeight: 500 }}>
            {data.error}
          </Typography>
        </Paper>
      )}
      
      {/* Stats Grid */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)'
        },
        gap: { xs: 2, sm: 3 },
        mb: 4
      }}>
        {cardConfigs.map((config, index) => (
          <Box key={index}>
            {renderCard(config)}
          </Box>
        ))}
      </Box>

      {/* Additional Info Section */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
        gap: 3,
        mt: 4
      }}>
        <Paper sx={{
          p: 4,
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          borderRadius: '16px',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.6), transparent)'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              mr: 2,
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                opacity: 0.7
              },
              '@keyframes pulse': {
                '0%, 100%': {
                  transform: 'scale(1)',
                  opacity: 1
                },
                '50%': {
                  transform: 'scale(1.5)',
                  opacity: 0
                }
              }
            }} />
            <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 600, fontSize: '1.1rem' }}>
              Estado del Sistema
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.95rem' }}>
            Todos los sistemas funcionando correctamente. La plataforma de gestión IT está operativa 
            y monitoreando activamente todos los recursos asignados.
          </Typography>
        </Paper>

        <Paper sx={{
          p: 4,
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          borderRadius: '16px',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.6), transparent)'
          }
        }}>
          <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 2, fontWeight: 600, fontSize: '1.1rem' }}>
            Última Actualización
          </Typography>
          <Typography variant="body1" sx={{ color: '#e2e8f0', fontWeight: 500, mb: 1 }}>
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#94a3b8', 
            fontSize: '0.9rem',
            fontFamily: 'monospace',
            letterSpacing: '0.05em'
          }}>
            {new Date().toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;