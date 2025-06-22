import axiosClient from './axiosClient';

export const getEquipos = async () => {
  const response = await axiosClient.get('/equipos/');
  return response.data;
};

export const actualizarEquipo = async (id_inventario, data) => {
  const response = await axiosClient.put(`/equipos/${id_inventario}/`, data);
  return response.data;
};