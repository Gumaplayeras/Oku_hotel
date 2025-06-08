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

// Utility function para evitar los problemas de undefined, null, objetos raros...
const safeDisplay = (value) => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

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
        setLoading(true);
        const [
          equiposData,
          departamentosData,
          ubicacionesData,
          estadosData,
          movimientosData
        ] = await Promise.all([
          getEquipos(),
          getDepartamentos(),
          getUbicaciones(),
          getEstados(),
          getMovimientos()
        ]);

        console.log('EquiposData:', equiposData);
        
        setEquipos(equiposData || []);
        setDepartamentos(departamentosData || []);
        setUbicaciones(ubicacionesData || []);
        setEstados(estadosData || []);
        setMovimientos(movimientosData || []);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
        setError("Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.equipo || !formData.motivo || !formData.departamento || !formData.ubicacion || !formData.estado) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Cambiamos la búsqueda del equipo por id_inventario
      const equipoSeleccionado = equipos.find(e => e.id_inventario === formData.equipo);
      const departamentoSeleccionado = departamentos.find(d => d.id === parseInt(formData.departamento));
      const ubicacionSeleccionada = ubicaciones.find(u => u.id === parseInt(formData.ubicacion));
      const estadoSeleccionado = estados.find(s => s.id === parseInt(formData.estado));

      if (!equipoSeleccionado || !departamentoSeleccionado || !ubicacionSeleccionada || !estadoSeleccionado) {
        setError("Selección inválida.");
        return;
      }

      await crearMovimiento({
        equipo: equipoSeleccionado.id_inventario,  // seguimos guardando por id_inventario
        motivo: formData.motivo,
        departamento: departamentoSeleccionado.id,
        ubicacion: ubicacionSeleccionada.id,
        estado: estadoSeleccionado.id,
      });

      const updatedMovimientos = await getMovimientos();
      setMovimientos(updatedMovimientos || []);
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Nuevo Movimiento</Typography>
        {(equipos.length > 0 && departamentos.length > 0 && ubicaciones.length > 0 && estados.length > 0) ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Equipo"
                name="equipo"
                value={formData.equipo}
                onChange={handleChange}
                fullWidth
                required
              >
                <MenuItem value="">Seleccione un equipo</MenuItem>
                {(equipos || []).map((equipo) => (
                  <MenuItem key={equipo.id_inventario} value={equipo.id_inventario}>
                    {safeDisplay(equipo.id_inventario)}
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
                required
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
                required
              >
                <MenuItem value="">Seleccione departamento</MenuItem>
                {(departamentos || []).map((dep) => (
                  <MenuItem key={dep.id} value={dep.id.toString()}>
                    {safeDisplay(dep.nombre)}
                  </MenuItem>
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
                required
              >
                <MenuItem value="">Seleccione ubicación</MenuItem>
                {(ubicaciones || []).map((ubi) => (
                  <MenuItem key={ubi.id} value={ubi.id.toString()}>
                    {safeDisplay(ubi.fase)}
                  </MenuItem>
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
                required
              >
                <MenuItem value="">Seleccione estado</MenuItem>
                {(estados || []).map((est) => (
                  <MenuItem key={est.id} value={est.id.toString()}>
                    {safeDisplay(est.nombre)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" onClick={handleSubmit} disabled={submitting} sx={{ mt: 2 }}>
                {submitting ? "Registrando..." : "Registrar Movimiento"}
              </Button>
            </Grid>
          </Grid>
        ) : (
          <CircularProgress />
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Registro de Movimientos</Typography>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : movimientos.length === 0 ? (
          <Alert severity="info">No hay movimientos registrados</Alert>
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
              {movimientos.map((mov) => {
                const dep = departamentos.find(d => d?.id === mov?.departamento);
                const ubi = ubicaciones.find(u => u?.id === mov?.ubicacion);
                const est = estados.find(e => e?.id === mov?.estado);

                return (
                  <TableRow key={mov.id || `row-${Math.random().toString(36).substr(2, 9)}`}>
                    <TableCell>{safeDisplay(mov.equipo)}</TableCell>
                    <TableCell>{mov?.fecha ? new Date(mov.fecha).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell>{safeDisplay(mov.motivo)}</TableCell>
                    <TableCell>{safeDisplay(dep?.nombre)}</TableCell>
                    <TableCell>{safeDisplay(ubi?.fase)}</TableCell>
                    <TableCell>{safeDisplay(est?.nombre)}</TableCell>
                    <TableCell>{safeDisplay(mov.realizado_por)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Movimiento creado correctamente
        </Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert onClose={() => setError("")} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Movimientos;