import axiosInstance from './axiosInstance';

export const getTotalEquipos = async () => {
  const response = await axiosInstance.get('/equipos/');
  return response.data.length;
};

export const getTotalSims = async () => {
  const response = await axiosInstance.get('/sims/');
  return response.data.length;
};

export const getTotalEmpleados = async () => {
  const response = await axiosInstance.get('/empleados/');
  return response.data.length;
};