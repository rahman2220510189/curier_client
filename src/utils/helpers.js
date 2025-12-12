
/**
 * Converts a Date object or ISO string to a locale-specific date and time string.
 * @param {Date | string} dateInput
 * @returns {string} Formatted date string.
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleString();
};


 /**
 * Gets Tailwind CSS classes for a parcel status badge.
 * @param {string} status Parcel status (e.g., 'Delivered', 'In Transit').
 * @returns {string} Tailwind class string.
 */
 
export const getStatusBadgeClasses = (status) => {
  const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider';
  const colors = {
    'Pending': 'bg-gray-100 text-gray-800 border border-gray-300',
    'Assigned': 'bg-blue-100 text-blue-800 border border-blue-300',
    'Picked Up': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    'In Transit': 'bg-orange-100 text-orange-800 border border-orange-300',
    'Delivered': 'bg-green-100 text-green-800 border border-green-300',
    'Failed': 'bg-red-100 text-red-800 border border-red-300',
  };
  return `${baseClasses} ${colors[status] || colors.Pending}`;
};