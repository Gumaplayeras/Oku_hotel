
import axiosClient from './axiosClient';

// LOG USER
export const getMyProfile = async () => {
  const { data } = await axiosClient.get('user/me/');
  return data;
};

// Listado de usuarios (GU PANEL)
export const getUsers = async () => {
  const { data } = await axiosClient.get('users/');
  return data;
};

// Eliminar usuario (GU PANEL)
export const deleteUser = async (id) => {
  await axiosClient.delete(`users/${id}/`);
};