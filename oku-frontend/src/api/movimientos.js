import axiosClient from './axiosClient';

export const getMovimientos = async () => {
  const response = await axiosClient.get('/movimientos/');
  return response.data;
};

export const crearMovimiento = async (data) => {
  const response = await axiosClient.post('/movimientos/', data);
  return response.data;
};

export const getMovimientosPorEquipo = async (equipoId) => {
  const response = await axiosClient.get(`/movimientos/?equipo=${equipoId}`);
  return response.data;
};

export const editarMovimiento = async (id, data) => {
  const response = await axiosClient.patch(`/movimientos/${id}/`, data);
  return response.data;
};