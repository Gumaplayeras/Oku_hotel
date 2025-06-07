import React, { useEffect, useState } from 'react';
import {
  Typography, Container, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, CircularProgress, TextField, Button, Grid, MenuItem
} from '@mui/material';
import { getMovimientos, crearMovimiento } from '../api/movimientos';
import { getEquipos } from '../api/equipos';
import { getDepartamentos } from '../api/departamentos';
import { getEstados } from '../api/estados';
import { getUbicaciones } from '../api/ubicaciones';

const Movimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    equipo: '',
    motivo: '',
    departamento: '',
    ubicacion: '',
    estado: '',
  });

  const [equipos, setEquipos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equiposData, departamentosData, ubicacionesData, estadosData, movimientosData] = await Promise.all([
          getEquipos(),
          getDepartamentos(),
          getUbicaciones(),
          getEstados(),
          getMovimientos()
        ]);
        setEquipos(equiposData);
        setDepartamentos(departamentosData);
        setUbicaciones(ubicacionesData);
        setEstados(estadosData);
        setMovimientos(movimientosData);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await crearMovimiento(formData);
      const updatedMovimientos = await getMovimientos();
      setMovimientos(updatedMovimientos);
      setFormData({
        equipo: '',
        motivo: '',
        departamento: '',
        ubicacion: '',
        estado: '',
      });
    } catch (error) {
      console.error('Error al crear el movimiento:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Nuevo Movimiento</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Equipo"
              name="equipo"
              value={formData.equipo}
              onChange={handleChange}
              fullWidth
            >
              {equipos.map((equipo) => (
                <MenuItem key={equipo.id_inventario} value={equipo.id_inventario}>
                  {equipo.id_inventario}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Motivo"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Departamento"
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              fullWidth
            >
              {departamentos.map((dep) => (
                <MenuItem key={dep.id} value={dep.id}>{dep.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Ubicación"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              fullWidth
            >
              {ubicaciones.map((ubi) => (
                <MenuItem key={ubi.id} value={ubi.id}>{ubi.fase}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              fullWidth
            >
              {estados.map((est) => (
                <MenuItem key={est.id} value={est.id}>{est.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSubmit}>Registrar Movimiento</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Registro de Movimientos</Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Equipo</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Realizado Por</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientos.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell>{mov.equipo?.id_inventario || 'N/A'}</TableCell>
                  <TableCell>{new Date(mov.fecha).toLocaleString()}</TableCell>
                  <TableCell>{mov.motivo}</TableCell>
                  <TableCell>{mov.departamento?.nombre || 'N/A'}</TableCell>
                  <TableCell>{mov.ubicacion?.fase || 'N/A'}</TableCell>
                  <TableCell>{mov.estado?.nombre || 'N/A'}</TableCell>
                  <TableCell>{mov.realizado_por || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
};

export default Movimientos;