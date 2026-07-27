import axiosInstance from '../api/axiosInstance';

export const userService = {
  getProfile: async (username) => {
    const response = await axiosInstance.get(`/api/v1/users/${username}`);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axiosInstance.put('/api/v1/users/profile', data);
    return response.data;
  },
};

export default userService;
