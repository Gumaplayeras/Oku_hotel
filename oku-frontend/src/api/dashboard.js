import axiosClient from './axiosClient';

export const getTotalEquipos = async () => {
  const response = await axiosClient.get('/equipos/');
  return response.data.length;
};

export const getTotalSims = async () => {
  const response = await axiosClient.get('/sims/');
  return response.data.length;
};

export const getTotalEmpleados = async () => {
  const response = await axiosClient.get('/empleados/');
  return response.data.length;
};

export const getTotalIncidencias = async () => {
  const response = await axiosClient.get('/incidencias/');
  return response.data.length;
};