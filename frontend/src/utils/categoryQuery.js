export const getSelectedCategoryFromSearch = (search = '') => {
  const query = typeof search === 'string' ? search : '';
  const params = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query);
  const category = params.get('category');
  return category && category.trim() ? category : null;
};
