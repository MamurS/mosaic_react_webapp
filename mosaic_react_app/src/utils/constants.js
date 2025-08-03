// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// Currency Options
export const CURRENCIES = ['UZS', 'USD', 'EUR'];

// Client Status Options
export const CLIENT_STATUS_OPTIONS = [
  { value: 'new', label: 'Новый' },
  { value: 'active', label: 'Активный' },
  { value: 'vip', label: 'VIP' },
  { value: 'inactive', label: 'Неактивный' }
];

// Policy Status Options
export const POLICY_STATUS_OPTIONS = [
  { value: 'active', label: 'Активен' },
  { value: 'pending', label: 'Ожидает' },
  { value: 'expired', label: 'Истек' }
];

// Industry Options
export const INDUSTRY_OPTIONS = [
  'Торговля',
  'Производство', 
  'Услуги',
  'Строительство',
  'Энергетика',
  'Транспорт',
  'Медицина',
  'Консалтинг',
  'IT',
  'Финансы',
  'Образование',
  'Сельское хозяйство'
];

// Coverage Type Options
export const COVERAGE_TYPE_OPTIONS = [
  'Полное покрытие',
  'Частичное покрытие',
  'Базовое покрытие',
  'Расширенное покрытие',
  'Премиум покрытие'
];

// Insurance Term Options
export const INSURANCE_TERM_OPTIONS = [
  '1 месяц',
  '3 месяца',
  '6 месяцев',
  '12 месяцев',
  '18 месяцев',
  '24 месяца',
  '36 месяцев'
];

// Report Types
export const REPORT_TYPES = [
  { value: 'financial', label: 'Финансовый отчет' },
  { value: 'portfolio_reserves', label: 'Резервы по портфелю' },
  { value: 'portfolio_analysis', label: 'Анализ портфеля' },
  { value: 'expiring_policies', label: 'Истекающие полисы' }
];

// Default Form Values
export const DEFAULT_CLIENT_FORM = {
  date: new Date().toISOString().split('T')[0],
  name: '',
  inn: '',
  legalName: '',
  country: 'Узбекистан',
  region: 'Ташкент',
  city: 'Ташкент',
  phone: '',
  email: '',
  industry: 'Торговля',
  companyGroup: '',
  clientStatus: 'new',
  financialReporting: 'No',
  revenue: 0,
  revenueCurrency: 'UZS',
  revenuePeriod: new Date().getFullYear().toString(),
  creditLimit: 0,
  limitCurrency: 'UZS'
};

export const DEFAULT_POLICY_FORM = {
  creationDate: new Date().toISOString().split('T')[0],
  insuranceAmount: "",
  insuranceAmountCurrency: 'UZS',
  policyLimit: "",
  policyLimitCurrency: 'UZS',
  clientLimit: "",
  clientLimitCurrency: 'UZS',
  coverageType: 'Полное покрытие',
  insuranceTerm: '12 месяцев',
  premium: "",
  netPremium: "",
  premiumCurrency: 'UZS',
  rate: "",
  reinsurance: 'No',
  underwriter: '',
  notes: '',
  status: 'pending'  // Add this line
};

// Navigation Tabs
export const NAVIGATION_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'clients', label: 'Клиенты' },
  { id: 'policies', label: 'Полисы' },
  { id: 'reports', label: 'Отчеты' },
  { id: 'analytics', label: 'Аналитика' }
];

// Chart Colors
export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD.MM.YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD.MM.YYYY HH:mm'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// Search Configuration
export const SEARCH_CONFIG = {
  DEBOUNCE_DELAY: 300,
  SINGLE_CHAR_DELAY: 500,
  MIN_SEARCH_LENGTH: 1,
  MAX_DROPDOWN_RESULTS: 5
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  SERVER_ERROR: 'Ошибка сервера. Попробуйте позже.',
  VALIDATION_ERROR: 'Проверьте правильность заполнения полей.',
  AUTH_ERROR: 'Ошибка аутентификации. Войдите в систему заново.',
  NOT_FOUND: 'Запрашиваемая информация не найдена.',
  PERMISSION_DENIED: 'У вас нет прав для выполнения этого действия.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CLIENT_CREATED: 'Клиент успешно создан',
  CLIENT_UPDATED: 'Информация о клиенте обновлена',
  POLICY_CREATED: 'Полис успешно создан',
  POLICY_UPDATED: 'Полис обновлен',
  DATA_EXPORTED: 'Данные экспортированы',
  REPORT_GENERATED: 'Отчет сгенерирован'
};

// Status Colors for UI
export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
  new: 'bg-blue-100 text-blue-800',
  vip: 'bg-purple-100 text-purple-800',
  inactive: 'bg-gray-100 text-gray-800'
};

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: '/token/',
  REFRESH: '/token/refresh/',
  USER_PROFILE: '/me/',
  CLIENTS: '/clients/',
  POLICIES: '/policies/',
  REPORTS: '/reports/',
  ANALYTICS: '/analytics/'
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    'application/pdf',
    'image/jpeg', 
    'image/png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.xlsx']
};

// Validation Rules
export const VALIDATION_RULES = {
  INN_LENGTH: { min: 9, max: 12 },
  PHONE_LENGTH: { min: 9, max: 15 },
  NAME_LENGTH: { min: 2, max: 100 },
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\d\s+\-()]+$/
};

// Helper Functions
export const formatCurrency = (amount, currency = 'UZS') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  
  const formats = {
    UZS: { symbol: ' сум', decimals: 0 },
    USD: { symbol: ' $', decimals: 2 },
    EUR: { symbol: ' €', decimals: 2 }
  };
  
  const format = formats[currency] || formats.UZS;
  
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: format.decimals,
    maximumFractionDigits: format.decimals
  }).format(amount) + format.symbol;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Неверная дата';
    
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Неверная дата';
  }
};

export const getStatusLabel = (status, type = 'client') => {
  const options = type === 'client' ? CLIENT_STATUS_OPTIONS : POLICY_STATUS_OPTIONS;
  const option = options.find(opt => opt.value === status);
  return option ? option.label : status;
};