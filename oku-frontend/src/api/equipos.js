import axiosInstance from './axiosInstance';

export const getEquipos = async () => {
  const response = await axiosInstance.get('/equipos/');
  return response.data;
};