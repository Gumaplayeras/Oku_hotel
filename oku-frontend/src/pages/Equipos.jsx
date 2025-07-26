import React, { useEffect, useState } from 'react';
import {
  Typography, Container, Paper, TextField, Button, Grid, MenuItem,
  CircularProgress, LinearProgress, Fade, Box
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getEquipos } from '../api/equipos';
import { getDepartamentos } from '../api/departamentos';
import { getEstados } from '../api/estados';
import EquipoDetalle from '../components/Equipos/EquipoDetalle';
import EditarEquipo from '../components/Equipos/EditarEquipo';

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

const Equipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [departamentos, setDepartamentos] = useState([]);
  const [estados, setEstados] = useState([]);

  const handleOpenModal = (equipo) => {
    setSelectedEquipo(equipo);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEquipo(null);
  };

  const handleEditarEquipo = (equipo) => {
    setSelectedEquipo(equipo);
    setOpenEditModal(true);
  };

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const data = await getEquipos();
        setEquipos(data);
        setFilteredEquipos(data);
      } catch (error) {
        console.error('Error al obtener los equipos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipos();
  }, []);

  useEffect(() => {
    const filtered = equipos.filter((equipo) =>
      Object.values(equipo).some(val =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
    setFilteredEquipos(filtered);
  }, [search, equipos]);

  useEffect(() => {
    const fetchFiltros = async () => {
      try {
        const [deps, ests] = await Promise.all([
          getDepartamentos(),
          getEstados()
        ]);
        setDepartamentos(deps);
        setEstados(ests);
      } catch (error) {
        console.error('Error cargando filtros:', error);
      }
    };
    fetchFiltros();
  }, []);

  const handleBuscar = async () => {
    setSearching(true);
    
    // Simular delay de búsqueda para mejor UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const filtrados = equipos.filter(eq => {
      const coincideTexto = search === '' || 
        eq.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        eq.empleado?.id?.toLowerCase().includes(search.toLowerCase()) ||
        eq.id_inventario?.toLowerCase().includes(search.toLowerCase()) ||
        eq.serial?.toLowerCase().includes(search.toLowerCase()) ||
        (eq.empleado?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
         eq.empleado?.apellidos?.toLowerCase().includes(search.toLowerCase()));

      const coincideDepartamento = filtroDepartamento ? eq.departamento?.id === filtroDepartamento : true;
      const coincideEstado = filtroEstado ? eq.estado?.id === filtroEstado : true;

      return coincideTexto && coincideDepartamento && coincideEstado;
    });
    
    setFilteredEquipos(filtrados);
    setSearching(false);
  };

  const handleClearFilters = () => {
    setSearch('');
    setFiltroDepartamento('');
    setFiltroEstado('');
    setFilteredEquipos(equipos);
  };

  // Estadísticas
  const totalEquipos = equipos.length;
  const equiposAsignados = equipos.filter(eq => eq.empleado?.nombre).length;
  const equiposLibres = totalEquipos - equiposAsignados;
  const departamentosUnicos = [...new Set(equipos.map(eq => eq.departamento?.nombre).filter(Boolean))].length;

  // Columnas del DataGrid
  const columns = [
    { 
      field: 'id_inventario', 
      headerName: 'ID Inventario', 
      flex: 1, 
      minWidth: 130,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon sx={{ color: '#64748b', fontSize: '1.1rem' }} />
          <Typography sx={{ 
            fontWeight: 600, 
            color: '#60a5fa',
            fontFamily: 'monospace',
            fontSize: '0.9rem'
          }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'nombre', 
      headerName: 'Nombre', 
      flex: 1, 
      minWidth: 150,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 500, color: '#f1f5f9' }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'elemento', 
      headerName: 'Elemento', 
      flex: 1, 
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: '#60a5fa',
          padding: '4px 8px',
          borderRadius: '6px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          fontWeight: 500,
          fontSize: '0.85rem',
          display: 'inline-block'
        }}>
          {params.value}
        </Box>
      )
    },
    { 
      field: 'marca', 
      headerName: 'Marca', 
      flex: 1, 
      minWidth: 100,
      renderCell: (params) => (
        <Typography sx={{ color: '#cbd5e1', fontWeight: 500 }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'modelo', 
      headerName: 'Modelo', 
      flex: 1, 
      minWidth: 120,
      renderCell: (params) => (
        <Typography sx={{ color: '#e2e8f0', fontWeight: 500 }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'serial', 
      headerName: 'Serial', 
      flex: 1, 
      minWidth: 140,
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
      field: 'empleado', 
      headerName: 'Empleado', 
      flex: 1, 
      minWidth: 150,
      renderCell: (params) => {
        const empleado = params.value;
        return empleado?.nombre ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ color: '#22c55e', fontSize: '1.1rem' }} />
            <Typography sx={{ color: '#22c55e', fontWeight: 500 }}>
              {empleado.nombre}
            </Typography>
          </Box>
        ) : (
          <Typography sx={{ color: '#64748b', fontStyle: 'italic' }}>
            Sin asignar
          </Typography>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      minWidth: 200,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, width: '100%' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ViewIcon />}
            onClick={() => handleOpenModal(params.row)}
            sx={{
              borderColor: 'rgba(96, 165, 250, 0.5)',
              color: '#60a5fa',
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'none',
              minWidth: '80px',
              height: '32px',
              fontSize: '0.8rem',
              background: 'rgba(30, 41, 59, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#60a5fa',
                background: 'rgba(96, 165, 250, 0.1)',
                transform: 'translateY(-1px)',
                color: '#93c5fd'
              }
            }}
          >
            Ver
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleEditarEquipo(params.row)}
            sx={{
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'none',
              minWidth: '80px',
              height: '32px',
              fontSize: '0.8rem',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
              color: '#ffffff',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
              }
            }}
          >
            Editar
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: '100vh' }}>
      {/* Header */}
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
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
              }}>
                <ComputerIcon sx={{ color: '#ffffff', fontSize: '1.5rem' }} />
              </Box>
              Gestión de Equipos
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
              Control y seguimiento del inventario tecnológico
            </Typography>
            
            {/* Decorative line */}
            <Box sx={{
              width: '80px',
              height: '2px',
              background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.8), transparent)',
              borderRadius: '1px',
              opacity: 0.7
            }} />
          </Box>
        </Box>
      </Box>

      {/* Estadísticas */}
      {!loading && equipos.length > 0 && (
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
              title="Total Equipos"
              value={totalEquipos}
              icon={<ComputerIcon />}
              color="#f59e0b"
              subtitle="Inventario completo"
            />
            <StatCard
              title="Asignados"
              value={equiposAsignados}
              icon={<PersonIcon />}
              color="#22c55e"
              subtitle="En uso por empleados"
            />
            <StatCard
              title="Disponibles"
              value={equiposLibres}
              icon={<AssignmentIcon />}
              color="#3b82f6"
              subtitle="Listos para asignar"
            />
            <StatCard
              title="Departamentos"
              value={departamentosUnicos}
              icon={<BusinessIcon />}
              color="#8b5cf6"
              subtitle="Áreas con equipos"
            />
          </Box>
        </Fade>
      )}

      {/* Filtros mejorados */}
      <Paper sx={{
        p: 3,
        mb: 4,
        background: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        borderRadius: '16px',
        backdropFilter: 'blur(20px)'
      }}>
        <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 3, fontWeight: 600 }}>
          Filtros de Búsqueda
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar por nombre, ID o serie"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(51, 65, 85, 0.3)',
                  borderRadius: '12px',
                  '& fieldset': {
                    borderColor: 'rgba(71, 85, 105, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(96, 165, 250, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#60a5fa',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#94a3b8',
                },
                '& .MuiOutlinedInput-input': {
                  color: '#f1f5f9',
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Departamento"
              value={filtroDepartamento}
              onChange={(e) => setFiltroDepartamento(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(51, 65, 85, 0.3)',
                  borderRadius: '12px',
                  '& fieldset': {
                    borderColor: 'rgba(71, 85, 105, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(96, 165, 250, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#60a5fa',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#94a3b8',
                },
                '& .MuiOutlinedInput-input': {
                  color: '#f1f5f9',
                }
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              {departamentos.map((dep) => (
                <MenuItem key={dep.id} value={dep.id}>{dep.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(51, 65, 85, 0.3)',
                  borderRadius: '12px',
                  '& fieldset': {
                    borderColor: 'rgba(71, 85, 105, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(96, 165, 250, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#60a5fa',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#94a3b8',
                },
                '& .MuiOutlinedInput-input': {
                  color: '#f1f5f9',
                }
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              {estados.map((est) => (
                <MenuItem key={est.id} value={est.id}>{est.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
              <Button 
                variant="contained" 
                onClick={handleBuscar}
                disabled={searching}
                startIcon={searching ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : <SearchIcon />}
                sx={{
                  flex: 1,
                  fontWeight: 600,
                  borderRadius: '12px',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 18px rgba(59, 130, 246, 0.4)'
                  }
                }}
              >
                {searching ? 'Buscando...' : 'Buscar'}
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={handleClearFilters}
                sx={{
                  borderColor: 'rgba(71, 85, 105, 0.5)',
                  color: '#94a3b8',
                  fontWeight: 500,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  minHeight: '32px',
                  '&:hover': {
                    borderColor: '#94a3b8',
                    background: 'rgba(71, 85, 105, 0.1)'
                  }
                }}
              >
                Limpiar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Barra de progreso */}
      {(loading || searching) && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(71, 85, 105, 0.3)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: 'linear-gradient(90deg, #f59e0b, #d97706)'
              }
            }}
          />
        </Box>
      )}

      {/* DataGrid */}
      {!loading && filteredEquipos.length === 0 ? (
        <Fade in timeout={600}>
          <Paper sx={{
            p: 4,
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)',
            textAlign: 'center'
          }}>
            <ComputerIcon sx={{ fontSize: '4rem', color: '#64748b', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 1, fontWeight: 600 }}>
              No se encontraron equipos
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              No hay equipos que coincidan con los filtros aplicados.
            </Typography>
          </Paper>
        </Fade>
      ) : (
        <Box sx={{ height: 650, width: '100%' }}>
          <DataGrid
            rows={filteredEquipos}
            columns={columns}
            pageSize={20}
            rowsPerPageOptions={[10, 20, 50]}
            getRowId={(row) => row.id_inventario}
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
                  background: 'rgba(245, 158, 11, 0.06)',
                },
                '&.Mui-selected': {
                  background: 'transparent',
                  '&:hover': {
                    background: 'rgba(245, 158, 11, 0.06)',
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

      {/* Modales */}
      <EquipoDetalle 
        open={openModal} 
        handleClose={handleCloseModal} 
        equipo={selectedEquipo} 
      />
      
      <EditarEquipo
        open={openEditModal}
        handleClose={() => setOpenEditModal(false)}
        equipo={selectedEquipo}
        onEquipoActualizado={() => {
          // Recargar los equipos después de editar
          const fetchEquipos = async () => {
            const data = await getEquipos();
            setEquipos(data);
            setFilteredEquipos(data);
          };
          fetchEquipos();
          setOpenEditModal(false);
        }}
      />
    </Box>
  );
};

export default Equipos;