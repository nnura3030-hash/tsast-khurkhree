export const formatNumber = (num) => {
  return Number(num || 0).toLocaleString();
};

export const formatCurrency = (amount) => {
  return `${formatNumber(amount)}₮`;
};

export const formatDate = (date) => {
  if (!date) return '---';
  return new Date(date).toLocaleDateString('mn-MN');
};

export const formatDateTime = (date) => {
  if (!date) return '---';
  return new Date(date).toLocaleString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};