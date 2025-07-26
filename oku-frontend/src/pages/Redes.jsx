import React, { useEffect, useState } from 'react';
import {
  Typography, Container, Box, Paper, Button, CircularProgress,
  LinearProgress, Fade, Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PowerSettingsNew as PowerIcon,
  SettingsEthernet as SwitchIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Router as RouterIcon,
  RestartAlt as RestartIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getSwitches, reiniciarSwitch } from '../api/switches';

const StatCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <Paper sx={{
      p: 3, 
      flex: '1 1 200px', 
      minWidth: 200, 
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
        border: `1px solid ${color}40`,
        boxShadow: `0 20px 40px -12px ${color}20`,
        '& .stat-icon': {
          transform: 'scale(1.1)',
          backgroundColor: color,
          color: '#ffffff',
          boxShadow: `0 8px 20px ${color}40`
        },
        '& .stat-value': {
          color: '#ffffff'
        },
        '& .stat-title': {
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
        background: `linear-gradient(90deg, ${color}, ${color}80, transparent)`,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: -2,
        right: -2,
        width: '4px',
        height: '40px',
        background: `linear-gradient(180deg, ${color}60, transparent)`,
        borderRadius: '2px'
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography 
            variant="caption" 
            className="stat-title"
            sx={{ 
              color: '#94a3b8',
              fontWeight: 500,
              fontSize: '0.875rem',
              mb: 1.5,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease',
              display: 'block'
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h3" 
            className="stat-value"
            sx={{ 
              color: '#f1f5f9',
              fontWeight: 700,
              fontSize: '2.25rem',
              transition: 'color 0.3s ease',
              fontFamily: '"Inter", sans-serif',
              lineHeight: 1.1,
              mb: 0.5
            }}
          >
            {value}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b',
              fontSize: '0.8rem',
              lineHeight: 1.4
            }}
          >
            {subtitle}
          </Typography>
        </Box>
        
        <Box 
          className="stat-icon"
          sx={{
            width: 60, 
            height: 60, 
            borderRadius: '14px', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center', 
            backgroundColor: `${color}15`,
            color: color,
            border: `1px solid ${color}20`,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '& svg': {
              fontSize: '1.75rem',
              transition: 'all 0.3s ease'
            }
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

const Redes = () => {
  const [switches, setSwitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // --------- Simula estado (¡adaptar a tu lógica real si la tienes!) ---------
  const getSwitchStatus = (sw) => {
    const statuses = ['online', 'warning', 'offline'];
    // TODO: usar un campo real si tienes status real del switch
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  useEffect(() => {
    const fetchSwitches = async () => {
      try {
        const data = await getSwitches();
        setSwitches(data);
      } catch (error) {
        alert("❌ Error al obtener los switches.");
      } finally {
        setLoading(false);
      }
    };
    fetchSwitches();
  }, []);

  const handleReiniciar = async (id) => {
    setRestarting(prev => ({ ...prev, [id]: true }));
    try {
      const response = await reiniciarSwitch(id);
      if (response.message) {
        alert(`✅ ${response.message}`);
      } else if (response.error) {
        alert(`❌ Error reiniciando: ${response.error}`);
      } else {
        alert("❌ Error reiniciando: respuesta inesperada del servidor");
      }
    } catch (error) {
      const mensajeError = error.response?.data?.error || error.message || "Error desconocido";
      alert(`❌ Error reiniciando: ${mensajeError}`);
    } finally {
      setRestarting(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleReiniciarTodos = async () => {
    if (window.confirm('¿Estás seguro de reiniciar TODOS los switches?')) {
      const switchIds = switches.map(sw => sw.id);
      const results = [];
      // Reiniciar con delay para evitar errores masivos
      for (let i = 0; i < switchIds.length; i++) {
        await new Promise(res => setTimeout(res, 400)); // 400ms de delay
        try {
          await handleReiniciar(switchIds[i]);
          results.push({ id: switchIds[i], ok: true });
        } catch {
          results.push({ id: switchIds[i], ok: false });
        }
      }
      // Puedes mostrar un resumen aquí si quieres
      // Ejemplo: alert(`Reiniciados: ${results.filter(r => r.ok).length}, fallidos: ${results.filter(r => !r.ok).length}`);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getSwitches();
      setSwitches(data);
    } catch (error) {
      alert("❌ Error al actualizar los switches.");
    } finally {
      setRefreshing(false);
    }
  };

  // ------------- Estadísticas ----------------
  const totalSwitches = switches.length;
  const onlineSwitches = switches.filter(sw => getSwitchStatus(sw) === 'online').length;
  const warningSwitches = switches.filter(sw => getSwitchStatus(sw) === 'warning').length;
  const offlineSwitches = switches.filter(sw => getSwitchStatus(sw) === 'offline').length;

  // ------------- Columnas DataGrid -------------
  const columns = [
    { 
      field: 'nombre', 
      headerName: 'Nombre', 
      flex: 1, 
      minWidth: 130,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RouterIcon sx={{ color: '#64748b', fontSize: '1.1rem' }} />
          <Typography sx={{ fontWeight: 500, color: '#f1f5f9' }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'marca', 
      headerName: 'Marca', 
      flex: 1, 
      minWidth: 90,
      renderCell: (params) => (
        <Typography sx={{ color: '#cbd5e1', fontWeight: 500 }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'ip', 
      headerName: 'Dirección IP', 
      flex: 1, 
      minWidth: 140,
      renderCell: (params) => (
        <Typography sx={{ 
          color: '#60a5fa', 
          fontFamily: 'monospace', 
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'planta', 
      headerName: 'Planta', 
      flex: 1, 
      minWidth: 90,
      renderCell: (params) => (
        <Typography sx={{ color: '#e2e8f0', fontWeight: 500 }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'lugar', 
      headerName: 'Ubicación', 
      flex: 1, 
      minWidth: 110,
      renderCell: (params) => (
        <Typography sx={{ color: '#e2e8f0', fontWeight: 500 }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'mac', 
      headerName: 'Dirección MAC', 
      flex: 1, 
      minWidth: 160,
      renderCell: (params) => (
        <Typography sx={{ 
          color: '#94a3b8', 
          fontFamily: 'monospace', 
          fontSize: '0.85rem',
          textTransform: 'uppercase'
        }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Estado',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const status = getSwitchStatus(params.row);
        let icon, color, label, bgColor;
        if (status === 'online') {
          icon = <CheckIcon sx={{ fontSize: '1.1rem' }} />;
          color = '#22c55e';
          bgColor = 'rgba(34, 197, 94, 0.1)';
          label = "Online";
        } else if (status === 'warning') {
          icon = <WarningIcon sx={{ fontSize: '1.1rem' }} />;
          color = '#f59e0b';
          bgColor = 'rgba(245, 158, 11, 0.1)';
          label = "Warning";
        } else {
          icon = <ErrorIcon sx={{ fontSize: '1.1rem' }} />;
          color = '#ef4444';
          bgColor = 'rgba(239, 68, 68, 0.1)';
          label = "Offline";
        }
        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            backgroundColor: bgColor,
            color: color,
            padding: '4px 8px',
            borderRadius: '8px',
            border: `1px solid ${color}30`,
            fontWeight: 600,
            fontSize: '0.85rem'
          }}>
            {icon}
            <span>{label}</span>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      minWidth: 150,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Button
            variant="contained"
            size="small"
            disabled={restarting[params.row.id]}
            onClick={() => handleReiniciar(params.row.id)}
            startIcon={restarting[params.row.id] ? null : <RestartIcon />}
            sx={{ 
              fontWeight: 600,
              borderRadius: '12px',
              textTransform: 'none',
              minWidth: '120px',
              height: '36px',
              background: restarting[params.row.id] 
                ? 'linear-gradient(135deg, rgba(148, 163, 184, 0.2), rgba(100, 116, 139, 0.2))'
                : 'linear-gradient(135deg, #dc2626, #b91c1c)',
              boxShadow: restarting[params.row.id] 
                ? 'none'
                : '0 4px 14px rgba(220, 38, 38, 0.3)',
              border: restarting[params.row.id] 
                ? '1px solid rgba(148, 163, 184, 0.3)'
                : 'none',
              color: restarting[params.row.id] ? '#64748b' : '#ffffff',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover:not(:disabled)': {
                background: 'linear-gradient(135deg, #b91c1c, #991b1b)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(220, 38, 38, 0.4)'
              },
              '&:active:not(:disabled)': {
                transform: 'translateY(0px)',
                transition: 'transform 0.1s ease'
              },
              '&:disabled': {
                cursor: 'not-allowed'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s ease',
              },
              '&:hover:not(:disabled)::before': {
                left: '100%'
              }
            }}
          >
            {restarting[params.row.id] ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress 
                  size={16} 
                  sx={{ 
                    color: '#64748b',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round'
                    }
                  }} 
                />
                <span>Reiniciando...</span>
              </Box>
            ) : (
              "Reiniciar"
            )}
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: '100vh' }}>
      {/* Header mejorado */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: 3,
          mb: 3
        }}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                color: '#ffffff',
                fontWeight: 600,
                fontSize: { xs: '1.875rem', sm: '2.25rem', md: '2.5rem' },
                mb: 1,
                letterSpacing: '-0.025em',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
              }}>
                <SwitchIcon sx={{ color: '#ffffff', fontSize: '1.5rem' }} />
              </Box>
              Gestión de Red
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
              Monitoreo y control de switches de red en tiempo real
            </Typography>
            
            {/* Decorative line */}
            <Box sx={{
              width: '80px',
              height: '2px',
              background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.8), transparent)',
              borderRadius: '1px',
              opacity: 0.7
            }} />
          </Box>
          
          <Box sx={{
            display: 'flex', 
            gap: 2, 
            width: { xs: '100%', sm: 'auto' },
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            {/* Botón Actualizar mejorado */}
            <Button
              variant="outlined"
              size="large"
              startIcon={refreshing ? <CircularProgress size={20} sx={{ color: '#60a5fa' }} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading || refreshing}
              sx={{
                minWidth: '140px',
                height: '48px',
                borderColor: 'transparent',
                color: '#60a5fa',
                fontWeight: 600,
                borderRadius: '14px',
                textTransform: 'none',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover:not(:disabled)': {
                  borderColor: 'rgba(96, 165, 250, 0.6)',
                  background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(30, 41, 59, 0.9))',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(96, 165, 250, 0.2)',
                  color: '#93c5fd'
                },
                '&:active:not(:disabled)': {
                  transform: 'translateY(0px)',
                  transition: 'transform 0.1s ease'
                },
                '&:disabled': {
                  opacity: 0.6,
                  cursor: 'not-allowed'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.1), transparent)',
                  transition: 'left 0.6s ease',
                },
                '&:hover:not(:disabled)::before': {
                  left: '100%'
                }
              }}
            >
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>

            {/* Botón Reiniciar Todos mejorado */}
            <Button
              variant="contained"
              size="large"
              startIcon={<PowerIcon />}
              onClick={handleReiniciarTodos}
              disabled={loading || switches.length === 0}
              sx={{
                minWidth: '160px',
                height: '48px',
                fontWeight: 600,
                borderRadius: '14px',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                boxShadow: '0 8px 25px rgba(220, 38, 38, 0.3)',
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover:not(:disabled)': {
                  background: 'linear-gradient(135deg, #b91c1c, #991b1b)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(220, 38, 38, 0.4)'
                },
                '&:active:not(:disabled)': {
                  transform: 'translateY(0px)',
                  transition: 'transform 0.1s ease'
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.3), rgba(100, 116, 139, 0.3))',
                  color: '#64748b',
                  cursor: 'not-allowed'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                  transition: 'left 0.6s ease',
                },
                '&:hover:not(:disabled)::before': {
                  left: '100%'
                }
              }}
            >
              Reiniciar Todos
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Estadísticas mejoradas */}
      {!loading && switches.length > 0 && (
        <Fade in timeout={800}>
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
            <StatCard
              title="Total Switches"
              value={totalSwitches}
              icon={<SwitchIcon />}
              color="#3b82f6"
              subtitle="Dispositivos registrados"
            />
            <StatCard
              title="Online"
              value={onlineSwitches}
              icon={<CheckIcon />}
              color="#22c55e"
              subtitle="Funcionando correctamente"
            />
            <StatCard
              title="Advertencias"
              value={warningSwitches}
              icon={<WarningIcon />}
              color="#f59e0b"
              subtitle="Requieren atención"
            />
            <StatCard
              title="Desconectados"
              value={offlineSwitches}
              icon={<ErrorIcon />}
              color="#ef4444"
              subtitle="Sin conexión"
            />
          </Box>
        </Fade>
      )}

      {/* Barra de progreso */}
      {(loading || refreshing) && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(71, 85, 105, 0.3)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
              }
            }}
          />
        </Box>
      )}

      {/* DataGrid mejorado */}
      {!loading && switches.length === 0 ? (
        <Fade in timeout={600}>
          <Paper sx={{
            p: 4,
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)',
            textAlign: 'center'
          }}>
            <SwitchIcon sx={{ fontSize: '4rem', color: '#64748b', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 1, fontWeight: 600 }}>
              No hay switches registrados
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              No se encontraron dispositivos de red en el sistema.
            </Typography>
          </Paper>
        </Fade>
      ) : (
        <Box sx={{ height: 650, width: '100%' }}>
          <DataGrid
            rows={switches}
            columns={columns}
            pageSize={20}
            rowsPerPageOptions={[10, 20, 50]}
            getRowId={(row) => row.id}
            loading={loading}
            checkboxSelection={false}
            disableSelectionOnClick
            disableRowSelectionOnClick
            sx={{
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '16px',
              backdropFilter: 'blur(20px)',
              fontSize: '0.95rem',
              color: '#f1f5f9',
              '& .MuiDataGrid-cell': {
                color: '#f1f5f9',
                borderColor: 'rgba(71, 85, 105, 0.2)',
                padding: '12px',
                '&:focus': {
                  outline: 'none',
                },
                '&:focus-within': {
                  outline: 'none',
                }
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                color: '#f1f5f9',
                fontWeight: 700,
                borderColor: 'rgba(71, 85, 105, 0.3)',
                letterSpacing: '0.025em',
                fontSize: '0.9rem',
                borderRadius: '16px 16px 0 0'
              },
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: 'inherit',
                color: 'inherit',
                '&:focus': {
                  outline: 'none',
                },
                '&:focus-within': {
                  outline: 'none',
                }
              },
              '& .MuiDataGrid-columnSeparator': {
                color: 'rgba(71, 85, 105, 0.3)',
              },
              '& .MuiDataGrid-footerContainer': {
                background: 'rgba(15, 23, 42, 0.6)',
                color: '#f1f5f9',
                borderColor: 'rgba(71, 85, 105, 0.3)',
                borderRadius: '0 0 16px 16px'
              },
              '& .MuiDataGrid-row': {
                borderColor: 'rgba(71, 85, 105, 0.2)',
                cursor: 'default',
                '&:hover': {
                  background: 'rgba(59, 130, 246, 0.06)',
                },
                '&.Mui-selected': {
                  background: 'transparent',
                  '&:hover': {
                    background: 'rgba(59, 130, 246, 0.06)',
                  }
                },
                '&:focus': {
                  outline: 'none',
                },
                '&:focus-within': {
                  outline: 'none',
                }
              },
              '& .MuiDataGrid-cell--textLeft': {
                '&:focus': {
                  outline: 'none',
                },
                '&:focus-within': {
                  outline: 'none',
                }
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Redes;