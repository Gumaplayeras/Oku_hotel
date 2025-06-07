import axiosInstance from './axiosInstance';

export const getMovimientos = async () => {
  const response = await axiosInstance.get('/movimientos/');
  return response.data;
};

export const crearMovimiento = async (data) => {
  const response = await axiosInstance.post('/movimientos/', data);
  return response.data;
};