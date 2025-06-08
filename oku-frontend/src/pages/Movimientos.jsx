import React, { useEffect, useState } from 'react';
import {
  Typography, Container, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, CircularProgress, TextField, Button, Grid, MenuItem,
  Snackbar, Alert
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
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.equipo || !formData.motivo || !formData.departamento || !formData.ubicacion || !formData.estado) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      setSubmitting(true);

      const equipoSeleccionado = equipos.find(e => e.id === formData.equipo);
      const departamentoSeleccionado = departamentos.find(d => d.id === formData.departamento);
      const ubicacionSeleccionada = ubicaciones.find(u => u.id === formData.ubicacion);
      const estadoSeleccionado = estados.find(s => s.id === formData.estado);

      await crearMovimiento({
        equipo: equipoSeleccionado.id_inventario,
        motivo: formData.motivo,
        departamento: departamentoSeleccionado.nombre,
        ubicacion: ubicacionSeleccionada.fase,
        estado: estadoSeleccionado.nombre
      });

      const updatedMovimientos = await getMovimientos();
      setMovimientos(updatedMovimientos);
      setFormData({
        equipo: '',
        motivo: '',
        departamento: '',
        ubicacion: '',
        estado: '',
      });
      setSuccess(true);
    } catch (error) {
      console.error('Error al crear el movimiento:', error);
      setError("Error al crear el movimiento.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Nuevo Movimiento</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField select label="Equipo" name="equipo" value={formData.equipo} onChange={handleChange} fullWidth>
              {equipos.map((equipo) => (
                <MenuItem key={equipo.id} value={equipo.id}>
                  {equipo.id_inventario}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField label="Motivo" name="motivo" value={formData.motivo} onChange={handleChange} fullWidth />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField select label="Departamento" name="departamento" value={formData.departamento} onChange={handleChange} fullWidth>
              {departamentos.map((dep) => (
                <MenuItem key={dep.id} value={dep.id}>{dep.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField select label="Ubicación" name="ubicacion" value={formData.ubicacion} onChange={handleChange} fullWidth>
              {ubicaciones.map((ubi) => (
                <MenuItem key={ubi.id} value={ubi.id}>{ubi.fase}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField select label="Estado" name="estado" value={formData.estado} onChange={handleChange} fullWidth>
              {estados.map((est) => (
                <MenuItem key={est.id} value={est.id}>{est.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Registrando..." : "Registrar Movimiento"}
            </Button>
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
                  <TableCell>{mov.equipo || 'N/A'}</TableCell>
                  <TableCell>{new Date(mov.fecha).toLocaleString()}</TableCell>
                  <TableCell>{mov.motivo}</TableCell>
                  <TableCell>{mov.departamento || 'N/A'}</TableCell>
                  <TableCell>{mov.ubicacion || 'N/A'}</TableCell>
                  <TableCell>{mov.estado || 'N/A'}</TableCell>
                  <TableCell>{mov.realizado_por || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success">Movimiento creado correctamente</Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Movimientos;