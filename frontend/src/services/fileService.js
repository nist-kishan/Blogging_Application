import axiosInstance from '../api/axiosInstance';

export const fileService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/api/v1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // { success: true, message: "...", data: "/uploads/..." }
  },
};
