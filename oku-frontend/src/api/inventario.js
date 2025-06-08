import axiosClient from './axiosClient';

// Equipos
export const getEquipos = async () => {
  try {
    const response = await axiosClient.get('/equipos/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los equipos:', error);
    return [];
  }
};

// PDA
export const getPDA = async () => {
  try {
    const response = await axiosClient.get('/pda/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener las PDA:', error);
    return [];
  }
};

// SIMS
export const getSIMS = async () => {
  try {
    const response = await axiosClient.get('/sims/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener las SIMs:', error);
    return [];
  }
};

// Oracle POS
export const getOraclePOS = async () => {
  try {
    const response = await axiosClient.get('/oracle/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los OraclePOS:', error);
    return [];
  }
};