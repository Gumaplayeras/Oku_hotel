import React, { useEffect, useState } from 'react';
import {
  Typography, Container, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, CircularProgress, TextField, Button
} from '@mui/material';
import { getEquipos } from '../api/equipos';
import EquipoDetalle from '../components/Equipos/EquipoDetalle';

const Equipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [openModal, setOpenModal] = useState(false);

const handleOpenModal = (equipo) => {
  setSelectedEquipo(equipo);
  setOpenModal(true);
};

const handleCloseModal = () => {
  setOpenModal(false);
  setSelectedEquipo(null);
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

return (
  <Container maxWidth="lg" sx={{ mt: 4 }}>
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Equipos
      </Typography>

      <TextField
        fullWidth
        label="Buscar"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

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
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => handleOpenModal(equipo)}>Detalle</Button>
                    <Button variant="contained" size="small" sx={{ ml: 1 }}>Editar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <EquipoDetalle open={openModal} handleClose={handleCloseModal} equipo={selectedEquipo} />
        </>
      )}
    </Paper>
  </Container>
);
};

export default Equipos;