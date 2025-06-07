import axiosInstance from './axiosInstance';

export const getSims = async () => {
  const response = await axiosInstance.get('/sims/');
  return response.data;
};