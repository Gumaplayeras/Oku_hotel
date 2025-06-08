import axiosClient from './axiosClient';

export const getUbicaciones = async () => {
  const response = await axiosClient.get('/ubicaciones/');
  return response.data;
};