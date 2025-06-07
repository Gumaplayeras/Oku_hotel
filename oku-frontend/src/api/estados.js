import axiosInstance from './axiosInstance';

export const getEstados = async () => {
  const response = await axiosInstance.get('/estados/');
  return response.data;
};