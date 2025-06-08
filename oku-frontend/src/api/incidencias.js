import axiosClient from './axiosClient';

export const getIncidencias = async () => {
  const response = await axiosClient.get('/incidencias/');
  return response.data;
};