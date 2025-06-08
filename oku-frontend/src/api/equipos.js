import axiosClient from './axiosClient';

export const getEquipos = async () => {
  const response = await axiosClient.get('/equipos/');
  return response.data;
};