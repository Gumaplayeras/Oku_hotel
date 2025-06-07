import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Equipos
export const getEquipos = async () => {
  try {
    const response = await axios.get(`${API_URL}/equipos/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los equipos:', error);
    return [];
  }
};

// PDA
export const getPDA = async () => {
  try {
    const response = await axios.get(`${API_URL}/pda/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las PDA:', error);
    return [];
  }
};

// SIMS
export const getSIMS = async () => {
  try {
    const response = await axios.get(`${API_URL}/sims/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las SIMs:', error);
    return [];
  }
};

// Oracle POS
export const getOraclePOS = async () => {
  try {
    const response = await axios.get(`${API_URL}/oracle/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los OraclePOS:', error);
    return [];
  }
};