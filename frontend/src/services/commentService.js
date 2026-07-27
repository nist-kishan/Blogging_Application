import axiosInstance from '../api/axiosInstance';

export const commentService = {
  getComments: async (blogId, params = {}) => {
    const response = await axiosInstance.get(`/api/v1/comments/blog/${blogId}`, { params });
    return response.data;
  },

  createComment: async ({ blogId, data }) => {
    const response = await axiosInstance.post(`/api/v1/comments/blog/${blogId}`, data);
    return response.data;
  },

  updateComment: async ({ id, data }) => {
    const response = await axiosInstance.put(`/api/v1/comments/${id}`, data);
    return response.data;
  },

  deleteComment: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/comments/${id}`);
    return response.data;
  },
};

export default commentService;
