import axiosClient from './axiosClient';

export const getSims = async () => {
  const response = await axiosClient.get('/sims/');
  return response.data;
};