import axiosInstance from '../api/axiosInstance';

export const categoryService = {
  getCategories: async () => {
    const response = await axiosInstance.get('/api/v1/categories');
    return response.data;
  },

  getCategoryBySlug: async (slug) => {
    const response = await axiosInstance.get(`/api/v1/categories/${slug}`);
    return response.data;
  },

  createCategory: async (data) => {
    const response = await axiosInstance.post('/api/v1/categories', data);
    return response.data;
  },

  updateCategory: async ({ id, data }) => {
    const response = await axiosInstance.put(`/api/v1/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
