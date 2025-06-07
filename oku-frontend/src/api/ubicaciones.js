import axiosInstance from './axiosInstance';

export const getUbicaciones = async () => {
  const response = await axiosInstance.get('/ubicaciones/');
  return response.data;
};