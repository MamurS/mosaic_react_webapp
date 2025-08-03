/**
 * Utility helper functions for the Insurance Management System
 * Contains formatting, validation, and common utility functions
 */

// ==================== DATE UTILITIES ====================

/**
 * Format date to Russian locale
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'datetime')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '—';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '—';
  
  const options = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    datetime: { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  };
  
  return dateObj.toLocaleDateString('ru-RU', options[format] || options.short);
};

/**
 * Get relative time (e.g., "2 дня назад")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '—';
  
  const now = new Date();
  const dateObj = new Date(date);
  const diffMs = now - dateObj;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) return `${diffDays} ${getDaysWord(diffDays)} назад`;
  if (diffHours > 0) return `${diffHours} ${getHoursWord(diffHours)} назад`;
  if (diffMinutes > 0) return `${diffMinutes} ${getMinutesWord(diffMinutes)} назад`;
  return 'только что';
};

// ==================== CURRENCY UTILITIES ====================

/**
 * Format currency with proper locale and abbreviations
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (UZS, USD, EUR)
 * @param {boolean} short - Use short format (1.2M instead of 1,200,000)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'UZS', short = false) => {
  if (!amount && amount !== 0) return '—';
  
  if (short) {
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B ${currency}`;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M ${currency}`;
    if (amount >= 1000) return `${Math.round(amount / 1000)}k ${currency}`;
  }
  
  return `${amount.toLocaleString('ru-RU')} ${currency}`;
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  return parseFloat(currencyString.replace(/[^0-9.-]/g, '')) || 0;
};

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate INN (Individual Taxpayer Number)
 * @param {string} inn - INN to validate
 * @returns {boolean} Is valid INN
 */
export const isValidINN = (inn) => {
  if (!inn) return false;
  const innRegex = /^\d{9,12}$/;
  return innRegex.test(inn);
};

/**
 * Validate phone number
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid phone
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^[\d\s\+\-\(\)]{9,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} Is not empty
 */
export const isRequired = (value) => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  return value != null;
};

// ==================== STRING UTILITIES ====================

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Get initials from full name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {string} fallback - Fallback if no names provided
 * @returns {string} Initials
 */
export const getInitials = (firstName = '', lastName = '', fallback = '?') => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || fallback;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// ==================== ARRAY UTILITIES ====================

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const groupKey = item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};

/**
 * Sort array by multiple keys
 * @param {Array} array - Array to sort
 * @param {Array} sortKeys - Array of {key, direction} objects
 * @returns {Array} Sorted array
 */
export const multiSort = (array, sortKeys) => {
  return [...array].sort((a, b) => {
    for (const { key, direction = 'asc' } of sortKeys) {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Remove duplicates from array
 * @param {Array} array - Array with possible duplicates
 * @param {string} key - Key to check uniqueness (optional)
 * @returns {Array} Array without duplicates
 */
export const removeDuplicates = (array, key = null) => {
  if (!key) return [...new Set(array)];
  
  const seen = new Set();
  return array.filter(item => {
    const keyValue = item[key];
    if (seen.has(keyValue)) return false;
    seen.add(keyValue);
    return true;
  });
};

// ==================== STATUS UTILITIES ====================

/**
 * Get status color class
 * @param {string} status - Status value
 * @param {string} type - Type of status (client, policy, etc.)
 * @returns {string} CSS class string
 */
export const getStatusColor = (status, type = 'policy') => {
  const statusColors = {
    policy: {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    },
    client: {
      new: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      vip: 'bg-purple-100 text-purple-800',
      inactive: 'bg-gray-100 text-gray-800'
    }
  };
  
  return statusColors[type]?.[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get status label in Russian
 * @param {string} status - Status value
 * @param {string} type - Type of status
 * @returns {string} Russian status label
 */
export const getStatusLabel = (status, type = 'policy') => {
  const statusLabels = {
    policy: {
      active: 'Активен',
      pending: 'Ожидает',
      expired: 'Истек',
      draft: 'Черновик'
    },
    client: {
      new: 'Новый',
      active: 'Активный',
      vip: 'VIP',
      inactive: 'Неактивный'
    }
  };
  
  return statusLabels[type]?.[status] || status;
};

// ==================== CALCULATION UTILITIES ====================

/**
 * Calculate insurance rate
 * @param {number} premium - Premium amount
 * @param {number} insuranceAmount - Insurance amount
 * @returns {number} Rate percentage
 */
export const calculateRate = (premium, insuranceAmount) => {
  if (!premium || !insuranceAmount) return 0;
  return ((premium / insuranceAmount) * 100).toFixed(2);
};

/**
 * Calculate percentage change
 * @param {number} oldValue - Old value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (oldValue, newValue) => {
  if (!oldValue) return newValue > 0 ? 100 : 0;
  return (((newValue - oldValue) / oldValue) * 100).toFixed(1);
};

/**
 * Calculate average from array
 * @param {Array} array - Array of numbers or objects
 * @param {string} key - Key to extract number from objects (optional)
 * @returns {number} Average value
 */
export const calculateAverage = (array, key = null) => {
  if (!array.length) return 0;
  
  const values = key ? array.map(item => item[key] || 0) : array;
  const sum = values.reduce((acc, val) => acc + (Number(val) || 0), 0);
  return (sum / values.length).toFixed(2);
};

// ==================== FILE UTILITIES ====================

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Get file extension
 * @param {string} filename - File name
 * @returns {string} File extension
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// ==================== EXPORT UTILITIES ====================

/**
 * Download data as CSV
 * @param {Array} data - Data to export
 * @param {string} filename - File name
 * @param {Array} headers - Column headers (optional)
 */
export const downloadCSV = (data, filename = 'export.csv', headers = null) => {
  if (!data.length) return;
  
  const csvHeaders = headers || Object.keys(data[0]);
  const csvRows = data.map(row => 
    csvHeaders.map(header => {
      const value = row[header] || '';
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    }).join(',')
  );
  
  const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(link.href);
};

// ==================== DEBOUNCE UTILITY ====================

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ==================== PRIVATE HELPER FUNCTIONS ====================

/**
 * Get correct Russian word form for days
 */
const getDaysWord = (days) => {
  if (days % 10 === 1 && days % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return 'дня';
  return 'дней';
};

/**
 * Get correct Russian word form for hours
 */
const getHoursWord = (hours) => {
  if (hours % 10 === 1 && hours % 100 !== 11) return 'час';
  if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100)) return 'часа';
  return 'часов';
};

/**
 * Get correct Russian word form for minutes
 */
const getMinutesWord = (minutes) => {
  if (minutes % 10 === 1 && minutes % 100 !== 11) return 'минуту';
  if ([2, 3, 4].includes(minutes % 10) && ![12, 13, 14].includes(minutes % 100)) return 'минуты';
  return 'минут';
};