import axiosClient from './axiosClient';

export const getEstados = async () => {
  const response = await axiosClient.get('/estados/');
  return response.data;
};