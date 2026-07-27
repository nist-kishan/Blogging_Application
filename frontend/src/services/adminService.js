import axiosInstance from '../api/axiosInstance';

export const adminService = {
  getStats: async () => {
    const response = await axiosInstance.get('/api/v1/admin/dashboard');
    return response.data;
  },

  getUsers: async () => {
    const response = await axiosInstance.get('/api/v1/admin/users');
    return response.data;
  },

  updateUserRole: async ({ id, role }) => {
    const response = await axiosInstance.put(`/api/v1/admin/users/${id}/role?role=${role}`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/admin/users/${id}`);
    return response.data;
  },
};

export default adminService;
