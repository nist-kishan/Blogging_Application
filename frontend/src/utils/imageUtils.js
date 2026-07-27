export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Ensure relative path starting with /
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return 'http://localhost:8085' + cleanPath;
};
