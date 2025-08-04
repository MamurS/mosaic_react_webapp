import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import ClientSearch from '../common/ClientSearch';
import {
  DEFAULT_POLICY_FORM,
  COVERAGE_TYPE_OPTIONS,
  INSURANCE_TERM_OPTIONS,
  CURRENCIES,
  POLICY_STATUS_OPTIONS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  API_URL
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

const PolicyForm = ({
  onSave,
  onCancel,
  initialData = null,
  authToken,
  clients = []
}) => {
  // Create default form with status
  const defaultFormData = {
    creationDate: new Date().toISOString().split('T')[0],
    insuranceAmount: '',
    insuranceAmountCurrency: 'UZS',
    policyLimit: '',
    policyLimitCurrency: 'UZS',
    clientLimit: '',
    clientLimitCurrency: 'UZS',
    coverageType: 'Полное покрытие',
    insuranceTerm: '12 месяцев',
    premium: '',
    netPremium: '',
    premiumCurrency: 'UZS',
    rate: '',
    reinsurance: 'No',
    underwriter: '',
    notes: '',
    status: 'pending'
  };

  const [formData, setFormData] = useState(initialData || defaultFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [touched, setTouched] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);

  const isEditing = !!initialData;

  // Pre-populate form if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultFormData,
        ...initialData,
        creationDate: initialData.creationDate || new Date().toISOString().split('T')[0]
      });

      // Find and set the selected client
      if (initialData.client && clients.length > 0) {
        const client = clients.find(c => c.id === initialData.client);
        if (client) {
          setSelectedClient(client);
        }
      }
    }
  }, [initialData, clients]);

  // Validation function
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'client':
        if (!value) {
          newErrors.client = 'Выбор клиента обязателен';
        } else {
          delete newErrors.client;
        }
        break;
      case 'insuranceAmount':
        if (!value || value <= 0) {
          newErrors.insuranceAmount = 'Страховая сумма должна быть больше 0';
        } else {
          delete newErrors.insuranceAmount;
        }
        break;
      case 'premium':
        if (!value || value <= 0) {
          newErrors.premium = 'Премия должна быть больше 0';
        } else {
          delete newErrors.premium;
        }
        break;
      case 'coverageType':
        if (!value?.trim()) {
          newErrors.coverageType = 'Тип покрытия обязателен';
        } else {
          delete newErrors.coverageType;
        }
        break;
      case 'underwriter':
        if (!value?.trim()) {
          newErrors.underwriter = 'Андеррайтер обязателен';
        } else {
          delete newErrors.underwriter;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const requiredFields = ['client', 'insuranceAmount', 'premium', 'coverageType', 'underwriter'];
    let isValid = true;

    // Check required fields
    requiredFields.forEach(field => {
      let value = formData[field];
      if (field === 'client') {
        value = selectedClient?.id;
      }

      if (!value || (typeof value === 'string' && !value.trim()) || (typeof value === 'number' && value <= 0)) {
        setErrors(prev => ({
          ...prev,
          [field]: 'Это поле обязательно для заполнения'
        }));
        isValid = false;
      }
    });

    return isValid && Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Convert to number for numeric fields
    if (['insuranceAmount', 'policyLimit', 'clientLimit', 'premium', 'netPremium', 'rate'].includes(name)) {
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

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setFormData(prev => ({
      ...prev,
      client: client.id
    }));

    setTouched(prev => ({
      ...prev,
      client: true
    }));

    validateField('client', client.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submission started:', { formData, selectedClient }); // Debug log

    // Ensure client is set
    if (selectedClient) {
      setFormData(prev => ({ ...prev, client: selectedClient.id }));
    }

    if (!validateForm() || !selectedClient) {
      console.log('Validation failed:', { errors, selectedClient }); // Debug log
      if (!selectedClient) {
        setErrors(prev => ({ ...prev, client: 'Выбор клиента обязателен' }));
      }
      return;
    }

    setLoading(true);
    setSuccess('');
    setErrors(prev => ({ ...prev, submit: '' })); // Clear previous submit errors

    try {
      // Prepare data for API - UPDATED to camelCase
      const policyData = {
        client: selectedClient.id,
        creationDate: formData.creationDate,
        insuranceAmount: formData.insuranceAmount,
        insuranceAmountCurrency: formData.insuranceAmountCurrency,
        policyLimit: formData.policyLimit,
        policyLimitCurrency: formData.policyLimitCurrency,
        clientLimit: formData.clientLimit,
        clientLimitCurrency: formData.clientLimitCurrency,
        coverageType: formData.coverageType,
        insuranceTerm: formData.insuranceTerm,
        premium: formData.premium,
        netPremium: formData.netPremium,
        premiumCurrency: formData.premiumCurrency,
        rate: formData.rate,
        reinsurance: formData.reinsurance,
        underwriter: formData.underwriter,
        notes: formData.notes,
        status: formData.status || 'pending'
      };

      console.log('Sending policy data to API:', policyData); // Debug log

      await onSave(policyData);

      console.log('Policy saved successfully'); // Debug log
      setSuccess(isEditing ? 'Полис обновлен' : 'Полис создан');

      // Clear form if creating new policy
      if (!isEditing) {
        setFormData(defaultFormData);
        setSelectedClient(null);
        setTouched({});
        setErrors({});
      }

      // Auto-hide success message and close form after 2 seconds
      setTimeout(() => {
        setSuccess('');
        if (isEditing) {
          onCancel(); // Close the form after successful edit
        }
      }, 2000);

    } catch (error) {
      console.error('Error saving policy:', error);
      setErrors({
        submit: error.message || 'Ошибка при сохранении полиса'
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
            {isEditing ? 'Редактирование полиса' : 'Новый полис'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Обновите информацию о полисе' : 'Заполните данные для создания нового полиса'}
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
                {isEditing ? 'Обновить полис' : 'Сохранить полис'}
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

      {/* Client Selection */}
      <FormSection title="Выбор клиента">
        <FormField label="Клиент" required error={errors.client}>
          <ClientSearch
            clients={clients}
            selectedClient={selectedClient}
            onClientSelect={handleClientSelect}
            authToken={authToken}
            apiUrl={API_URL}
            placeholder="Поиск клиента по названию или ИНН..."
            disabled={loading}
          />
          {selectedClient && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-blue-900">{selectedClient.name}</div>
                  <div className="text-sm text-blue-600">ИНН: {selectedClient.inn}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClient(null);
                    setFormData(prev => ({ ...prev, client: null }));
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </FormField>
      </FormSection>

      {/* Basic Policy Information */}
      <FormSection title="Основная информация">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField label="Дата создания" error={errors.creationDate}>
            <input
              type="date"
              name="creationDate"
              value={formData.creationDate}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('creationDate')}
            />
          </FormField>

          <FormField label="Тип покрытия" required error={errors.coverageType}>
            <select
              name="coverageType"
              value={formData.coverageType}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('coverageType')}
            >
              {COVERAGE_TYPE_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Срок страхования" error={errors.insuranceTerm}>
            <select
              name="insuranceTerm"
              value={formData.insuranceTerm}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('insuranceTerm')}
            >
              {INSURANCE_TERM_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Андеррайтер" required error={errors.underwriter}>
            <input
              type="text"
              name="underwriter"
              value={formData.underwriter}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              placeholder="Имя андеррайтера"
              className={getFieldClassName('underwriter')}
            />
          </FormField>

          <FormField label="Статус полиса" error={errors.status}>
            <select
              name="status"
              value={formData.status || 'pending'}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('status')}
            >
              {POLICY_STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Перестрахование" error={errors.reinsurance}>
            <select
              name="reinsurance"
              value={formData.reinsurance}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('reinsurance')}
            >
              <option value="No">Нет</option>
              <option value="Yes">Да</option>
            </select>
          </FormField>
        </div>
      </FormSection>

      {/* Financial Information */}
      <FormSection title="Финансовые параметры">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField label="Страховая сумма" required error={errors.insuranceAmount}>
            <input
              type="number"
              name="insuranceAmount"
              value={formData.insuranceAmount}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              min="0"
              step="1000"
              placeholder="5000000"
              className={getFieldClassName('insuranceAmount')}
            />
          </FormField>

          <FormField label="Валюта страховой суммы" error={errors.insuranceAmountCurrency}>
            <select
              name="insuranceAmountCurrency"
              value={formData.insuranceAmountCurrency}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('insuranceAmountCurrency')}
            >
              {CURRENCIES.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Лимит полиса" error={errors.policyLimit}>
            <input
              type="number"
              name="policyLimit"
              value={formData.policyLimit}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              min="0"
              step="1000"
              placeholder="3000000"
              className={getFieldClassName('policyLimit')}
            />
          </FormField>

          <FormField label="Премия" required error={errors.premium}>
            <input
              type="number"
              name="premium"
              value={formData.premium}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              min="0"
              step="1000"
              placeholder="125000"
              className={getFieldClassName('premium')}
            />
          </FormField>

          <FormField label="Чистая премия" error={errors.netPremium}>
            <input
              type="number"
              name="netPremium"
              value={formData.netPremium}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              min="0"
              step="1000"
              placeholder="100000"
              className={getFieldClassName('netPremium')}
            />
          </FormField>

          <FormField label="Валюта премии" error={errors.premiumCurrency}>
            <select
              name="premiumCurrency"
              value={formData.premiumCurrency}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={getFieldClassName('premiumCurrency')}
            >
              {CURRENCIES.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Тарифная ставка (%)" error={errors.rate}>
            <input
              type="number"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              min="0"
              max="100"
              step="0.1"
              placeholder="2.5"
              className={getFieldClassName('rate')}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Additional Information */}
      <FormSection title="Дополнительная информация">
        <FormField label="Примечания" error={errors.notes}>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
            rows={4}
            placeholder="Дополнительные комментарии и примечания к полису..."
            className={`${getFieldClassName('notes')} resize-none`}
          />
        </FormField>
      </FormSection>

      {/* Form Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-3">Проверьте данные перед сохранением:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><strong>Клиент:</strong> {selectedClient?.name || 'Не выбран'}</div>
          <div><strong>Тип покрытия:</strong> {formData.coverageType}</div>
          <div><strong>Страховая сумма:</strong> {formData.insuranceAmount?.toLocaleString()} {formData.insuranceAmountCurrency}</div>
          <div><strong>Премия:</strong> {formData.premium?.toLocaleString()} {formData.premiumCurrency}</div>
          <div><strong>Статус:</strong> {POLICY_STATUS_OPTIONS.find(opt => opt.value === formData.status)?.label || formData.status}</div>
        </div>

        {(Object.keys(errors).length > 0 || !selectedClient) && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              <AlertCircle size={14} className="inline mr-1" />
              {!selectedClient ? 'Выберите клиента и ' : ''}
              исправьте {Object.keys(errors).length} ошибку(и) перед сохранением
            </p>
          </div>
        )}
      </div>
    </form>
  );
};

export default PolicyForm;
