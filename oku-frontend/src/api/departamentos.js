import axiosInstance from './axiosInstance';

export const getDepartamentos = async () => {
  const response = await axiosInstance.get('/departamentos/');
  return response.data;
};