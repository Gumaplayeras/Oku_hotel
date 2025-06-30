import axiosClient from './axiosClient';

export const getSwitches = async () => {
  const response = await axiosClient.get('/switches/');
  return response.data;
};

export const reiniciarSwitch = async (id) => {
  const response = await axiosClient.post(`/switches/${id}/reiniciar/`);
  return response.data;
};