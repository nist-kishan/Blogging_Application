import axiosInstance from '../api/axiosInstance';

export const blogService = {
  getBlogs: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/blogs', { params });
    return response.data;
  },

  getBlogBySlug: async (slug) => {
    const response = await axiosInstance.get(`/api/v1/blogs/${slug}`);
    return response.data;
  },

  getBlogById: async (id) => {
    const response = await axiosInstance.get(`/api/v1/blogs/id/${id}`);
    return response.data;
  },

  createBlog: async (data) => {
    const response = await axiosInstance.post('/api/v1/blogs', data);
    return response.data;
  },

  updateBlog: async ({ id, data }) => {
    const response = await axiosInstance.put(`/api/v1/blogs/${id}`, data);
    return response.data;
  },

  deleteBlog: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/blogs/${id}`);
    return response.data;
  },

  searchBlogs: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/blogs/search', { params });
    return response.data;
  },

  getTrendingBlogs: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/blogs/trending', { params });
    return response.data;
  },

  likeBlog: async (id) => {
    const response = await axiosInstance.post(`/api/v1/blogs/${id}/like`);
    return response.data;
  },

  unlikeBlog: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/blogs/${id}/like`);
    return response.data;
  },

  bookmarkBlog: async (id) => {
    const response = await axiosInstance.post(`/api/v1/blogs/${id}/bookmark`);
    return response.data;
  },

  removeBookmark: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/blogs/${id}/bookmark`);
    return response.data;
  },

  getLikedBlogs: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/blogs/liked', { params });
    return response.data;
  },

  getBookmarkedBlogs: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/blogs/bookmarked', { params });
    return response.data;
  },
};

export default blogService;
