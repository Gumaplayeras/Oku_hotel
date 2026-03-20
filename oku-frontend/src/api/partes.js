import axiosClient from './axiosClient';

export const getPartes = () => axiosClient.get('partes/');
export const getParte = (id) => axiosClient.get(`partes/${id}/`);
export const createParte = (data) => axiosClient.post('partes/', data);
export const updateParte = (id, data) => axiosClient.put(`partes/${id}/`, data);
export const deleteParte = (id) => axiosClient.delete(`partes/${id}/`);
