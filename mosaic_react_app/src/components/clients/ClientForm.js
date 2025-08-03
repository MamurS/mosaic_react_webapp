import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  DEFAULT_CLIENT_FORM, 
  CLIENT_STATUS_OPTIONS, 
  INDUSTRY_OPTIONS, 
  CURRENCIES,
  VALIDATION_RULES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES 
} from '../../utils/constants';

const FormSection = ({ title, children }) => (
  <div className="bg-white p-8 rounded-lg shadow-sm border space-y-6">
    <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
    {children}
  </div>
);

const FormField = ({ label, required = false, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
);

const ClientForm = ({ 
  onSave, 
  onCancel, 
  initialData = null,
  authToken,
  API_URL 
}) => {
  const [formData, setFormData] = useState(initialData || DEFAULT_CLIENT_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [touched, setTouched] = useState({});

  const isEditing = !!initialData;

  // Pre-populate form if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...DEFAULT_CLIENT_FORM,
        ...initialData,
        date: initialData.date || new Date().toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value?.trim()) {
          newErrors.name = 'Название клиента обязательно';
        } else if (value.length < VALIDATION_RULES.NAME_LENGTH.min) {
          newErrors.name = `Минимум ${VALIDATION_RULES.NAME_LENGTH.min} символа`;
        } else if (value.length > VALIDATION_RULES.NAME_LENGTH.max) {
          newErrors.name = `Максимум ${VALIDATION_RULES.NAME_LENGTH.max} символов`;
        } else {
          delete newErrors.name;
        }
        break;

      case 'inn':
        if (!value?.trim()) {
          newErrors.inn = 'ИНН обязателен';
        } else if (!/^\d+$/.test(value)) {
          newErrors.inn = 'ИНН должен содержать только цифры';
        } else if (value.length < VALIDATION_RULES.INN_LENGTH.min || value.length > VALIDATION_RULES.INN_LENGTH.max) {
          newErrors.inn = `ИНН должен содержать ${VALIDATION_RULES.INN_LENGTH.min}-${VALIDATION_RULES.INN_LENGTH.max} цифр`;
        } else {
          delete newErrors.inn;
        }
        break;

      case 'email':
        if (value && !VALIDATION_RULES.EMAIL_REGEX.test(value)) {
          newErrors.email = 'Введите корректный email адрес';
        } else {
          delete newErrors.email;
        }
        break;

      case 'phone':
        if (value && !VALIDATION_RULES.PHONE_REGEX.test(value)) {
          newErrors.phone = 'Введите корректный номер телефона';
        } else if (value && (value.length < VALIDATION_RULES.PHONE_LENGTH.min || value.length > VALIDATION_RULES.PHONE_LENGTH.max)) {
          newErrors.phone = `Номер телефона должен содержать ${VALIDATION_RULES.PHONE_LENGTH.min}-${VALIDATION_RULES.PHONE_LENGTH.max} символов`;
        } else {
          delete newErrors.phone;
        }
        break;

      case 'revenue':
        if (value < 0) {
          newErrors.revenue = 'Выручка не может быть отрицательной';
        } else {
          delete newErrors.revenue;
        }
        break;

      case 'creditLimit':
        if (value < 0) {
          newErrors.creditLimit = 'Кредитный лимит не может быть отрицательным';
        } else {
          delete newErrors.creditLimit;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const requiredFields = ['name', 'inn'];
    let isValid = true;

    // Check required fields
    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        setErrors(prev => ({
          ...prev,
          [field]: 'Это поле обязательно для заполнения'
        }));
        isValid = false;
      } else {
        validateField(field, formData[field]);
      }
    });

    // Validate all other fields
    Object.keys(formData).forEach(field => {
      if (!requiredFields.includes(field)) {
        validateField(field, formData[field]);
      }
    });

    return isValid && Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;

    // Special processing for specific fields
    if (name === 'inn' || name === 'phone') {
      // Only allow numbers for INN and phone
      if (name === 'inn') {
        processedValue = value.replace(/[^0-9]/g, '');
      } else if (name === 'phone') {
        // Allow numbers, spaces, +, -, (, )
        processedValue = value.replace(/[^0-9\s\+\-\(\)]/g, '');
      }
    }

    // Convert to number for numeric fields
    if (['revenue', 'creditLimit'].includes(name)) {
      processedValue = value === '' ? 0 : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field if it's been touched
    if (touched[name] || value !== '') {
      setTimeout(() => validateField(name, processedValue), 100);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccess('');
    
    try {
      await onSave(formData);
      setSuccess(isEditing ? SUCCESS_MESSAGES.CLIENT_UPDATED : SUCCESS_MESSAGES.CLIENT_CREATED);
      
      // Clear form if creating new client
      if (!isEditing) {
        setFormData(DEFAULT_CLIENT_FORM);
        setTouched({});
        setErrors({});
      }
      
      // Auto-hide success message
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error saving client:', error);
      setErrors({ 
        submit: error.message || ERROR_MESSAGES.VALIDATION_ERROR 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (Object.keys(touched).length > 0) {
      if (window.confirm('У вас есть несохраненные изменения. Вы уверены, что хотите отменить?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const getFieldClassName = (fieldName) => {
    const baseClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors";
    
    if (errors[fieldName]) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500`;
    }
    
    if (touched[fieldName] && !errors[fieldName] && formData[fieldName]) {
      return `${baseClasses} border-green-300 focus:border-green-500`;
    }
    
    return `${baseClasses} border-gray-300`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditing ? 'Редактирование клиента' : 'Новый клиент'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Обновите информацию о клиенте' : 'Заполните данные для создания нового клиента'}
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X size={18} className="inline mr-2" />
            Отмена
          </button>
          
          <button
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Сохранение...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditing ? 'Обновить клиента' : 'Сохранить клиента'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg animate-fadeIn">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg animate-fadeIn">
          <AlertCircle size={18} />
          {errors.submit}
        </div>
      )}

      {/* Basic Information */}
      <FormSection title="Основная информация">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField label="Дата" error={errors.date}>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('date')}
            />
          </FormField>

          <FormField label="Название клиента" required error={errors.name}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              placeholder="ООО 'Ваша компания'"
              className={getFieldClassName('name')}
            />
          </FormField>

          <FormField label="ИНН" required error={errors.inn}>
            <input
              type="text"
              name="inn"
              value={formData.inn}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              placeholder="123456789"
              maxLength={12}
              className={getFieldClassName('inn')}
            />
          </FormField>

          <FormField label="Юридическое наименование" error={errors.legalName}>
            <input
              type="text"
              name="legalName"
              value={formData.legalName}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              placeholder="Полное юридическое название"
              className={getFieldClassName('legalName')}
            />
          </FormField>

          <FormField label="Страна" error={errors.country}>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('country')}
            />
          </FormField>

          <FormField label="Регион" error={errors.region}>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('region')}
            />
          </FormField>

          <FormField label="Город" error={errors.city}>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('city')}
            />
          </FormField>

          <FormField label="Телефон" error={errors.phone}>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              placeholder="+998 90 123 45 67"
              className={getFieldClassName('phone')}
            />
          </FormField>

          <FormField label="Email" error={errors.email}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              placeholder="info@company.uz"
              className={getFieldClassName('email')}
            />
          </FormField>

          <FormField label="Отрасль" error={errors.industry}>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('industry')}
            >
              {INDUSTRY_OPTIONS.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Группа компаний" error={errors.companyGroup}>
            <input
              type="text"
              name="companyGroup"
              value={formData.companyGroup}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              placeholder="Название группы компаний"
              className={getFieldClassName('companyGroup')}
            />
          </FormField>

          <FormField label="Статус клиента" error={errors.clientStatus}>
            <select
              name="clientStatus"
              value={formData.clientStatus}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('clientStatus')}
            >
              {CLIENT_STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>

      {/* Financial Information */}
      <FormSection title="Финансовые показатели">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField label="Финансовая отчетность" error={errors.financialReporting}>
            <select
              name="financialReporting"
              value={formData.financialReporting}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('financialReporting')}
            >
              <option value="Yes">Да</option>
              <option value="No">Нет</option>
            </select>
          </FormField>

          <FormField label="Выручка" error={errors.revenue}>
            <input
              type="number"
              name="revenue"
              value={formData.revenue}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              min="0"
              step="1000"
              placeholder="0"
              className={getFieldClassName('revenue')}
            />
          </FormField>

          <FormField label="Валюта выручки" error={errors.revenueCurrency}>
            <select
              name="revenueCurrency"
              value={formData.revenueCurrency}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('revenueCurrency')}
            >
              {CURRENCIES.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Период выручки" error={errors.revenuePeriod}>
            <input
              type="text"
              name="revenuePeriod"
              value={formData.revenuePeriod}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              placeholder="2024"
              className={getFieldClassName('revenuePeriod')}
            />
          </FormField>

          <FormField label="Кредитный лимит" error={errors.creditLimit}>
            <input
              type="number"
              name="creditLimit"
              value={formData.creditLimit}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              min="0"
              step="1000"
              placeholder="0"
              className={getFieldClassName('creditLimit')}
            />
          </FormField>

          <FormField label="Валюта лимита" error={errors.limitCurrency}>
            <select
              name="limitCurrency"
              value={formData.limitCurrency}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('limitCurrency')}
            >
              {CURRENCIES.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>

      {/* Form Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-3">Проверьте данные перед сохранением:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><strong>Название:</strong> {formData.name || 'Не указано'}</div>
          <div><strong>ИНН:</strong> {formData.inn || 'Не указан'}</div>
          <div><strong>Отрасль:</strong> {formData.industry}</div>
          <div><strong>Статус:</strong> {CLIENT_STATUS_OPTIONS.find(opt => opt.value === formData.clientStatus)?.label}</div>
        </div>
        
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              <AlertCircle size={14} className="inline mr-1" />
              Исправьте {Object.keys(errors).length} ошибку(и) перед сохранением
            </p>
          </div>
        )}
      </div>
    </form>
  );
};

export default ClientForm;