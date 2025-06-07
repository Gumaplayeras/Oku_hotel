import React, { useEffect, useState } from 'react';
import { Typography, Container, Paper, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import { getSims } from '../api/sims';

const Sims = () => {
  const [sims, setSims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSims = async () => {
      try {
        const data = await getSims();
        setSims(data);
      } catch (error) {
        console.error('Error al obtener las SIMs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSims();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de SIMs
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>ICCID</TableCell>
                <TableCell>Número Teléfono</TableCell>
                <TableCell>Operador</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sims.map((sim) => (
                <TableRow key={sim.id}>
                  <TableCell>{sim.id}</TableCell>
                  <TableCell>{sim.iccid}</TableCell>
                  <TableCell>{sim.numero}</TableCell>
                  <TableCell>{sim.operador}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
};

export default Sims;