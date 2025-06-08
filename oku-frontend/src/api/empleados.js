import axiosClient from './axiosClient';

export const getEmpleados = async () => {
  const response = await axiosClient.get('/empleados/');
  return response.data;
};