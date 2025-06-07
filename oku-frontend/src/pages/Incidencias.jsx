import React, { useEffect, useState } from 'react';
import { Typography, Container, Paper, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import { getIncidencias } from '../api/incidencias';

const Incidencias = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncidencias = async () => {
      try {
        const data = await getIncidencias();
        setIncidencias(data);
      } catch (error) {
        console.error('Error al obtener las incidencias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidencias();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Incidencias
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Asignado A</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidencias.map((incidencia) => (
                <TableRow key={incidencia.id}>
                  <TableCell>{incidencia.id}</TableCell>
                  <TableCell>{incidencia.titulo}</TableCell>
                  <TableCell>{incidencia.estado}</TableCell>
                  <TableCell>{incidencia.asignado_a}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
};

export default Incidencias;