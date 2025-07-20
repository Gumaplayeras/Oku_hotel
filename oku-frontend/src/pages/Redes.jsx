import React, { useEffect, useState } from 'react';
import {
  Typography, Container, Box, Paper, Button, CircularProgress,
  LinearProgress, Fade, Alert, useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PowerSettingsNew as PowerIcon,
  SettingsEthernet as SwitchIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getSwitches, reiniciarSwitch } from '../api/switches';
import { styled } from '@mui/material/styles';



const StatCard = ({ title, value, icon, color, subtitle }) => {
  const theme = useTheme();
  return (
    <Paper sx={{
      p: 3, flex: '1 1 200px', minWidth: 200, borderRadius: 3,
      color: theme.palette.text.primary,  // <-- Texto claro
      background: `linear-gradient(135deg, ${color}15, ${color}05)`,
      border: `1px solid ${color}30`, transition: 'transform 0.3s ease',
      '&:hover': { transform: 'translateY(-4px)' }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{
          p: 2, borderRadius: 2, bgcolor: `${color}20`, color, display: 'flex', alignItems: 'center'
        }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color }}>{value}</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>{title}</Typography>
          <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const Redes = () => {
  const theme = useTheme();
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
    { field: 'nombre', headerName: 'Nombre', flex: 1, minWidth: 130 },
    { field: 'marca', headerName: 'Marca', flex: 1, minWidth: 90 },
    { field: 'ip', headerName: 'IP', flex: 1, minWidth: 120 },
    { field: 'planta', headerName: 'Planta', flex: 1, minWidth: 90 },
    { field: 'lugar', headerName: 'Ubicación', flex: 1, minWidth: 110 },
    { field: 'mac', headerName: 'MAC', flex: 1, minWidth: 150 },
    {
      field: 'status',
      headerName: 'Estado',
      flex: 1,
      minWidth: 110,
      renderCell: (params) => {
        const status = getSwitchStatus(params.row);
        let icon, color, label;
        if (status === 'online') {
          icon = <CheckIcon sx={{ color: theme.palette.success.main }} />;
          label = "Online";
        } else if (status === 'warning') {
          icon = <WarningIcon sx={{ color: theme.palette.warning.main }} />;
          label = "Warning";
        } else {
          icon = <ErrorIcon sx={{ color: theme.palette.error.main }} />;
          label = "Offline";
        }
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          color="primary"
          disabled={restarting[params.row.id]}
          onClick={() => handleReiniciar(params.row.id)}
          sx={{ fontWeight: 600 }}
        >
          {restarting[params.row.id] ? <CircularProgress size={16} /> : "Reiniciar"}
        </Button>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={0} sx={{
        background: `linear-gradient(135deg, 
          ${theme.palette.primary.main}15 0%, 
          ${theme.palette.secondary.main}15 100%)`,
        borderRadius: 4, p: 4, mb: 4, position: 'relative', overflow: 'hidden'
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{
            display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3
          }}>
            <Box>
              <Typography variant="h3" component="h1" sx={{
                fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2, mb: 1,
                background: `linear-gradient(45deg, 
                  ${theme.palette.primary.main}, 
                  ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                <Box sx={{
                  p: 1.5, borderRadius: 2,
                  background: `linear-gradient(45deg, 
                    ${theme.palette.primary.main}20, 
                    ${theme.palette.secondary.main}20)`,
                  display: 'flex', alignItems: 'center'
                }}>
                  <SwitchIcon fontSize="large" />
                </Box>
                Centro de Control de Red
              </Typography>
              <Typography variant="h6" sx={{
                color: 'text.secondary', fontWeight: 400, ml: 1
              }}>
                Monitoreo en tiempo real y gestión avanzada de infraestructura
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' },
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading || refreshing}
                sx={{
                  borderWidth: 2,
                  fontWeight: 600,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </Button>
              <Button
                variant="contained"
                size="large"
                color="error"
                startIcon={<PowerIcon />}
                onClick={handleReiniciarTodos}
                disabled={loading || switches.length === 0}
                sx={{
                  fontWeight: 600,
                  boxShadow: `0 4px 12px ${theme.palette.error.main}40`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${theme.palette.error.main}60`
                  }
                }}
              >
                Reiniciar Todos
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Estadísticas */}
      {!loading && switches.length > 0 && (
        <Fade in timeout={800}>
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            <StatCard
              title="Total"
              value={totalSwitches}
              icon={<SwitchIcon />}
              color={theme.palette.primary.main}
              subtitle="Switches registrados"
            />
            <StatCard
              title="Online"
              value={onlineSwitches}
              icon={<CheckIcon />}
              color={theme.palette.success.main}
              subtitle="Funcionando correctamente"
            />
            <StatCard
              title="Advertencias"
              value={warningSwitches}
              icon={<WarningIcon />}
              color={theme.palette.warning.main}
              subtitle="Requieren atención"
            />
            <StatCard
              title="Offline"
              value={offlineSwitches}
              icon={<ErrorIcon />}
              color={theme.palette.error.main}
              subtitle="Sin conexión"
            />
          </Box>
        </Fade>
      )}

      {/* Barra de progreso para loading/refreshing */}
      {(loading || refreshing) && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress
            sx={{
              height: 6,
              borderRadius: 3,
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(90deg, 
                  ${theme.palette.primary.main}, 
                  ${theme.palette.secondary.main})`
              }
            }}
          />
        </Box>
      )}

      {/* DataGrid */}
      {!loading && switches.length === 0 ? (
        <Fade in timeout={600}>
          <Alert
            severity="info"
            sx={{
              mt: 2,
              borderRadius: 3,
              '& .MuiAlert-message': { fontSize: '1.1rem' }
            }}
          >
            No hay switches registrados en el sistema.
          </Alert>
        </Fade>
      ) : (
        <Box sx={{ height: 650, width: '100%', mt: 4 }}>
          <DataGrid
            rows={switches}
            columns={columns}
            pageSize={20}
            rowsPerPageOptions={[10, 20, 50]}
            getRowId={(row) => row.id}
            loading={loading}
            checkboxSelection={false}
            disableSelectionOnClick
            sx={{
              background: theme.palette.background.paper,
              borderRadius: 3,
              boxShadow: 2,
              fontSize: '1.05rem',
              color: theme.palette.text.primary,
              borderColor: theme.palette.divider,
              '& .MuiDataGrid-cell': {
                color: theme.palette.text.primary,
                borderColor: theme.palette.divider,
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? theme.palette.grey[800] 
                  : theme.palette.grey[100],
                color: theme.palette.text.primary,
                fontWeight: 700,
                borderColor: theme.palette.divider,
                letterSpacing: '0.03em',
                fontSize: '1.09rem',
              },
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: 'inherit',
                color: 'inherit',
              },
              '& .MuiDataGrid-columnHeader .MuiDataGrid-iconButtonContainer': {
                '& .MuiIconButton-root': {
                  color: theme.palette.text.primary,
                },
              },
              '& .MuiDataGrid-columnSeparator': {
                color: theme.palette.divider,
              },
              '& .MuiDataGrid-footerContainer': {
                background: `${theme.palette.background.default}CC`,
                color: theme.palette.text.primary,
              },
              '& .MuiDataGrid-row:hover': {
                background: `${theme.palette.primary.main}22`,
              },
              '& .MuiButton-root': {
                color: theme.palette.primary.contrastText,
              },
            }}
          />
        </Box>
      )}
    </Container>
  );
};

export default Redes;