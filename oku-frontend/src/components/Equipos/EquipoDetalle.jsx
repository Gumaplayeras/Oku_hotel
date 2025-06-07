import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Grid, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const EquipoDetalle = ({ open, handleClose, equipo }) => {
  if (!equipo) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Detalle del Equipo
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
        <DialogContent dividers>
        <Grid container spacing={2}>

            <Grid item xs={6}><Typography variant="subtitle2">ID Inventario:</Typography></Grid>
            <Grid item xs={6}><Typography>{equipo.id_inventario}</Typography></Grid>

            <Grid item xs={6}><Typography variant="subtitle2">Nombre:</Typography></Grid>
            <Grid item xs={6}><Typography>{equipo.nombre}</Typography></Grid>

            <Grid item xs={6}><Typography variant="subtitle2">Elemento:</Typography></Grid>
            <Grid item xs={6}><Typography>{equipo.elemento}</Typography></Grid>

            <Grid item xs={6}><Typography variant="subtitle2">Marca:</Typography></Grid>
            <Grid item xs={6}><Typography>{equipo.marca}</Typography></Grid>

            <Grid item xs={6}><Typography variant="subtitle2">Modelo:</Typography></Grid>
            <Grid item xs={6}><Typography>{equipo.modelo}</Typography></Grid>

            <Grid item xs={6}><Typography variant="subtitle2">Serial:</Typography></Grid>
            <Grid item xs={6}><Typography>{equipo.serial}</Typography></Grid>

            <Grid item xs={6}><Typography variant="subtitle2">Departamento:</Typography></Grid>
            <Grid item xs={6}><Typography>{equipo.departamento?.nombre || 'No asignado'}</Typography></Grid>

            <Grid item xs={6}><Typography variant="subtitle2">Estado:</Typography></Grid>
            <Grid item xs={6}><Typography>{equipo.estado?.nombre || 'No asignado'}</Typography></Grid>

            <Grid item xs={6}><Typography variant="subtitle2">Ubicación:</Typography></Grid>
            <Grid item xs={6}><Typography>{equipo.ubicacion?.fase || 'No asignado'}</Typography></Grid>

        </Grid>
        </DialogContent>
    </Dialog>
  );
};

export default EquipoDetalle;