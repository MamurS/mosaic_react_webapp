import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { API_URL, ERROR_MESSAGES } from '../utils/constants';

export const useApi = () => {
  const { authToken, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiRequest = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_URL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error(ERROR_MESSAGES.AUTH_ERROR);
        } else if (response.status === 403) {
          throw new Error(ERROR_MESSAGES.PERMISSION_DENIED);
        } else if (response.status === 404) {
          throw new Error(ERROR_MESSAGES.NOT_FOUND);
        } else if (response.status >= 500) {
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return response.status === 204 ? null : await response.text();
      }

      const data = await response.json();
      return data;

    } catch (err) {
      const errorMessage = err.message || ERROR_MESSAGES.NETWORK_ERROR;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [authToken, logout]);

  const get = useCallback((endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return apiRequest(url, { method: 'GET' });
  }, [apiRequest]);

  const post = useCallback((endpoint, data = {}) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, [apiRequest]);

  const put = useCallback((endpoint, data = {}) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }, [apiRequest]);

  const patch = useCallback((endpoint, data = {}) => {
    return apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }, [apiRequest]);

  const del = useCallback((endpoint) => {
    return apiRequest(endpoint, { method: 'DELETE' });
  }, [apiRequest]);

  const upload = useCallback((endpoint, formData) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }, [apiRequest]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    apiRequest,
    loading,
    error,
    clearError,
  };
};

export const useClientApi = () => {
  const api = useApi();

  const getClients = useCallback((params = {}) => {
    return api.get('/clients/', params);
  }, [api]);

  const getClient = useCallback((id) => {
    return api.get(`/clients/${id}/`);
  }, [api]);

  const createClient = useCallback((clientData) => {
    return api.post('/clients/', clientData);
  }, [api]);

  const updateClient = useCallback((id, clientData) => {
    return api.put(`/clients/${id}/`, clientData);
  }, [api]);

  const deleteClient = useCallback((id) => {
    return api.delete(`/clients/${id}/`);
  }, [api]);

  const searchClients = useCallback((searchTerm) => {
    return api.get('/clients/', { search: searchTerm });
  }, [api]);

  const exportClients = useCallback((format = 'csv', filters = {}) => {
    return api.get('/clients/export/', { format, ...filters });
  }, [api]);

  return {
    getClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
    exportClients,
    loading: api.loading,
    error: api.error,
    clearError: api.clearError,
  };
};

export const usePolicyApi = () => {
  const api = useApi();

  const getPolicies = useCallback((params = {}) => {
    return api.get('/policies/', params);
  }, [api]);

  const getPolicy = useCallback((id) => {
    return api.get(`/policies/${id}/`);
  }, [api]);

  const createPolicy = useCallback((policyData) => {
    return api.post('/policies/', policyData);
  }, [api]);

  const updatePolicy = useCallback((id, policyData) => {
    return api.put(`/policies/${id}/`, policyData);
  }, [api]);

  const deletePolicy = useCallback((id) => {
    return api.delete(`/policies/${id}/`);
  }, [api]);

  const searchPolicies = useCallback((searchTerm) => {
    return api.get('/policies/', { search: searchTerm });
  }, [api]);

  const exportPolicies = useCallback((format = 'csv', filters = {}) => {
    return api.get('/policies/export/', { format, ...filters });
  }, [api]);

  const getPolicyDocuments = useCallback((policyId) => {
    return api.get(`/policies/${policyId}/documents/`);
  }, [api]);

  const uploadPolicyDocument = useCallback((policyId, formData) => {
    return api.upload(`/policies/${policyId}/documents/`, formData);
  }, [api]);

  return {
    getPolicies,
    getPolicy,
    createPolicy,
    updatePolicy,
    deletePolicy,
    searchPolicies,
    exportPolicies,
    getPolicyDocuments,
    uploadPolicyDocument,
    loading: api.loading,
    error: api.error,
    clearError: api.clearError,
  };
};

export const useReportsApi = () => {
  const api = useApi();

  const generateReport = useCallback((reportType, params = {}) => {
    return api.post('/reports/generate/', { 
      report_type: reportType, 
      parameters: params 
    });
  }, [api]);

  const getReportHistory = useCallback(() => {
    return api.get('/reports/history/');
  }, [api]);

  const downloadReport = useCallback((reportId, format = 'pdf') => {
    return api.get(`/reports/${reportId}/download/`, { format });
  }, [api]);

  const deleteReport = useCallback((reportId) => {
    return api.delete(`/reports/${reportId}/`);
  }, [api]);

  return {
    generateReport,
    getReportHistory,
    downloadReport,
    deleteReport,
    loading: api.loading,
    error: api.error,
    clearError: api.clearError,
  };
};

export const useAnalyticsApi = () => {
  const api = useApi();

  const getAnalytics = useCallback((period = '12m', metrics = []) => {
    return api.get('/analytics/', { period, metrics: metrics.join(',') });
  }, [api]);

  const getIndustryAnalytics = useCallback(() => {
    return api.get('/analytics/industry/');
  }, [api]);

  const getRegionalAnalytics = useCallback(() => {
    return api.get('/analytics/regional/');
  }, [api]);

  const getUnderwriterPerformance = useCallback(() => {
    return api.get('/analytics/underwriters/');
  }, [api]);

  const getMonthlyTrends = useCallback((months = 12) => {
    return api.get('/analytics/trends/', { months });
  }, [api]);

  return {
    getAnalytics,
    getIndustryAnalytics,
    getRegionalAnalytics,
    getUnderwriterPerformance,
    getMonthlyTrends,
    loading: api.loading,
    error: api.error,
    clearError: api.clearError,
  };
};

export const useUserApi = () => {
  const api = useApi();

  const getCurrentUser = useCallback(() => {
    return api.get('/me/');
  }, [api]);

  const updateProfile = useCallback((profileData) => {
    return api.patch('/me/', profileData);
  }, [api]);

  const changePassword = useCallback((passwordData) => {
    return api.post('/change-password/', passwordData);
  }, [api]);

  const uploadAvatar = useCallback((formData) => {
    return api.upload('/me/avatar/', formData);
  }, [api]);

  return {
    getCurrentUser,
    updateProfile,
    changePassword,
    uploadAvatar,
    loading: api.loading,
    error: api.error,
    clearError: api.clearError,
  };
};

export default useApi;