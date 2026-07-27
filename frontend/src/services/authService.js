import axiosInstance from '../api/axiosInstance';

export const authService = {
  register: async (data) => {
    const response = await axiosInstance.post('/api/v1/auth/register', data);
    return response.data;
  },

  login: async (data) => {
    const response = await axiosInstance.post('/api/v1/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/api/v1/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get('/api/v1/auth/me');
    return response.data;
  },

  forgotPassword: async (data) => {
    const response = await axiosInstance.post('/api/v1/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await axiosInstance.post('/api/v1/auth/reset-password', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await axiosInstance.post('/api/v1/auth/change-password', data);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await axiosInstance.get(`/api/v1/auth/verify-email?token=${token}`);
    return response.data;
  },
};

export default authService;
