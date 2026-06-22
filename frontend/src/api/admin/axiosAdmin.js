import axios from 'axios';

const axiosAdmin = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// attach admin token
axiosAdmin.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosAdmin;


