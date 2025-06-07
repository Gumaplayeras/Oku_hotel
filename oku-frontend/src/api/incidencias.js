import axiosInstance from './axiosInstance';

export const getIncidencias = async () => {
  const response = await axiosInstance.get('/incidencias/');
  return response.data;
};