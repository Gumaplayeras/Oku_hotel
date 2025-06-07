import axiosInstance from './axiosInstance';

export const getEmpleados = async () => {
  const response = await axiosInstance.get('/empleados/');
  return response.data;
};