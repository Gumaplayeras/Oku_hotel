import React, { useEffect, useState } from 'react';
import {
  Typography, Container, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, CircularProgress, TextField, Button, Grid, MenuItem
} from '@mui/material';
import { getEquipos } from '../api/equipos';
import { getDepartamentos } from '../api/departamentos';
import { getEstados } from '../api/estados';
import EquipoDetalle from '../components/Equipos/EquipoDetalle';
import EditarEquipo from '../components/Equipos/EditarEquipo';

const Equipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const handleBuscar = () => {
    const filtrados = equipos.filter(eq => {
      const coincideTexto =
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
  };

return (
  <Container maxWidth="lg" sx={{ mt: 4 }}>
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Equipos
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Buscar por nombre, ID o serie"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            select
            label="Departamento"
            value={filtroDepartamento}
            onChange={(e) => setFiltroDepartamento(e.target.value)}
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
          >
            <MenuItem value="">Todos</MenuItem>
            {estados.map((est) => (
              <MenuItem key={est.id} value={est.id}>{est.nombre}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button variant="contained" onClick={handleBuscar}>Buscar</Button>
        </Grid>
      </Grid>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Inventario</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Elemento</TableCell>
                <TableCell>Marca</TableCell>
                <TableCell>Modelo</TableCell>
                <TableCell>Serial</TableCell>
                <TableCell>Empleado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEquipos.map((equipo) => (
                <TableRow key={equipo.id_inventario}>
                  <TableCell>{equipo.id_inventario}</TableCell>
                  <TableCell>{equipo.nombre}</TableCell>
                  <TableCell>{equipo.elemento}</TableCell>
                  <TableCell>{equipo.marca}</TableCell>
                  <TableCell>{equipo.modelo}</TableCell>
                  <TableCell>{equipo.serial}</TableCell>
                  <TableCell>{equipo.empleado?.nombre || '—'}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => handleOpenModal(equipo)}>Detalle</Button>
                    <Button variant="contained" size="small" sx={{ ml: 1 }} onClick={() => handleEditarEquipo(equipo)}>
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <EquipoDetalle open={openModal} handleClose={handleCloseModal} equipo={selectedEquipo} />
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
        </>
      )}
    </Paper>
  </Container>
);
};

export default Equipos;