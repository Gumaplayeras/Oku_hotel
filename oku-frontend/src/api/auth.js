import axiosClient from './axiosClient';
import { setTokens, clearTokens } from '../utils/auth';

export const login = async (username, password) => {
  const response = await axiosClient.post('token/', { username, password });
  const { access, refresh } = response.data;
  setTokens({ access, refresh });
  return response.data;
};

export const logout = () => {
  clearTokens();
};