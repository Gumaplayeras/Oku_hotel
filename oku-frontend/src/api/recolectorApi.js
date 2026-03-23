import axios from 'axios';

// Create a dedicated Axios instance for the FastAPI Recolector
const recolectorClient = axios.create({
  baseURL: import.meta.env.VITE_RECOLECTOR_API_URL || 'http://192.168.0.250:8001/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// GET /api/health
export const getHealth = async () => {
  const response = await recolectorClient.get('health');
  return response.data;
};

// GET /api/summary
export const getSummary = async () => {
  const response = await recolectorClient.get('summary');
  return response.data;
};

// GET /api/switches
export const getSwitchesList = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.q) params.append('q', filters.q);
  if (filters.vendor) params.append('vendor', filters.vendor);
  if (filters.reachable !== undefined && filters.reachable !== '') {
    params.append('reachable', filters.reachable);
  }
  if (filters.poe !== undefined && filters.poe !== '') {
    params.append('poe', filters.poe);
  }
  
  const response = await recolectorClient.get(`switches?${params.toString()}`);
  return response.data;
};

// GET /api/switches/inaccessible
export const getInaccessible = async () => {
  const response = await recolectorClient.get('switches/inaccessible');
  return response.data;
};

// GET /api/switches/{ip}
export const getSwitchDetail = async (ip) => {
  const response = await recolectorClient.get(`switches/${ip}`);
  return response.data;
};

// GET /api/switches/{ip}/ports
export const getSwitchPorts = async (ip, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.edge_only) params.append('edge_only', 'true');
  if (filters.active_only) params.append('active_only', 'true');
  if (filters.poe_only) params.append('poe_only', 'true');

  const response = await recolectorClient.get(`switches/${ip}/ports?${params.toString()}`);
  return response.data;
};

// GET /api/switches/{ip}/macs
export const getSwitchMacs = async (ip, filters = { active_only: true, exclude_uplink: true }) => {
  const params = new URLSearchParams();
  if (filters.active_only) params.append('active_only', 'true');
  if (filters.exclude_uplink) params.append('exclude_uplink', 'true');

  const response = await recolectorClient.get(`switches/${ip}/macs?${params.toString()}`);
  return response.data;
};

// GET /api/switches/{ip}/vlans
export const getSwitchVlans = async (ip) => {
  const response = await recolectorClient.get(`switches/${ip}/vlans`);
  return response.data;
};

// GET /api/switches/{ip}/neighbors
export const getSwitchNeighbors = async (ip) => {
  const response = await recolectorClient.get(`switches/${ip}/neighbors`);
  return response.data;
};

export default recolectorClient;
