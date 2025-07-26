import axiosClient from './axiosClient';

export const getCurrentUser = async () => {
  const response = await axiosClient.get('/user/');
  return response.data;
};