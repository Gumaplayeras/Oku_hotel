import axiosClient from './axiosClient';

export const getMovimientos = async () => {
  const response = await axiosClient.get('/movimientos/');
  return response.data;
};

export const crearMovimiento = async (data) => {
  const response = await axiosClient.post('/movimientos/', data);
  return response.data;
};