import axiosClient from './axiosClient';

export const getDepartamentos = async () => {
  const response = await axiosClient.get('/departamentos/');
  return response.data;
};