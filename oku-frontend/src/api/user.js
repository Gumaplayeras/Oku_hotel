
import axiosClient from './axiosClient';

// Perfil del usuario logueado
export const getMyProfile = async () => {
  const { data } = await axiosClient.get('user/me/');
  return data;
};

// Listado de usuarios (para Gestión de Usuarios)
export const getUsers = async () => {
  const { data } = await axiosClient.get('users/');
  return data;
};

// Eliminar usuario por id
export const deleteUser = async (id) => {
  await axiosClient.delete(`users/${id}/`);
};