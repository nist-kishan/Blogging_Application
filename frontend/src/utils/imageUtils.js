export const DEFAULT_AVATAR_URL = 'https://api.dicebear.com/7.x/bottts/svg?seed=default';

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Ensure relative path starting with /
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8085';
  return baseUrl + cleanPath;
};
