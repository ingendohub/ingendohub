import axiosAdmin from './axiosAdmin';

export const adminLogin = (credentials) => {
  return axiosAdmin.post('/admin/login', credentials);
};

export const getAdminStats = () => {
  return axiosAdmin.get('/admin/stats');
};

