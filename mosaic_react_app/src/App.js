import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';
import Clients from './components/clients/Clients';
import ClientForm from './components/clients/ClientForm';
import Policies from './components/policies/Policies';
import PolicyForm from './components/policies/PolicyForm';
import Reports from './components/reports/Reports';
import Analytics from './components/analytics/Analytics';
import { useAuth } from './hooks/useAuth';
import { API_URL } from './utils/constants';

// Main App Content Component
const AppContent = () => {
  const { isAuthenticated, authToken, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showNewPolicyForm, setShowNewPolicyForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated && authToken && !loading) {
      fetchInitialData();
    }
  }, [isAuthenticated, authToken, loading]);

  const fetchInitialData = async () => {
    setDataLoading(true);
    await Promise.all([
      fetchClients(),
      fetchPolicies()
    ]);
    setDataLoading(false);
  };

  const fetchClients = async () => {
    if (!authToken) {
      console.log('No auth token available for fetching clients');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/clients/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        console.log('Token expired while fetching clients');
        logout(); // This will redirect to login
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Raw client data from API:', data.results || data); // Debug log to see actual API response
        setClients(data.results || data || []);
        console.log('Clients fetched successfully:', (data.results || data || []).length);
      } else {
        console.error('Failed to fetch clients:', response.status, response.statusText);
        // Don't set clients to empty array on error, keep existing data
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Network error - don't clear existing data
    }
  };

  const fetchPolicies = async () => {
    if (!authToken) {
      console.log('No auth token available for fetching policies');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/policies/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        console.log('Token expired while fetching policies');
        logout(); // This will redirect to login
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Raw policy data from API:', data.results || data); // Debug log for policies too
        setPolicies(data.results || data || []);
        console.log('Policies fetched successfully:', (data.results || data || []).length);
      } else {
        console.error('Failed to fetch policies:', response.status, response.statusText);
        // Don't set policies to empty array on error, keep existing data
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      // Network error - don't clear existing data
    }
  };

  // Handle new client creation
  const handleCreateNewClient = () => {
    setEditingClient(null);
    setShowNewClientForm(true);
    setActiveTab('clients');
  };

  // Handle new policy creation
  const handleCreateNewPolicy = () => {
    setEditingPolicy(null);
    setShowNewPolicyForm(true);
    setActiveTab('policies');
  };

  // Handle client form submission with proper error handling
  const handleClientSave = async (clientData) => {
    if (!authToken) {
      throw new Error('Нет токена авторизации');
    }

    try {
      const method = editingClient ? 'PUT' : 'POST';
      const url = editingClient 
        ? `${API_URL}/clients/${editingClient.id}/`
        : `${API_URL}/clients/`;

      // Convert camelCase fields to snake_case for Django API
      const apiData = {
        ...clientData,
        client_status: clientData.clientStatus,        // Convert clientStatus → client_status
        legal_name: clientData.legalName,              // Convert legalName → legal_name
        company_group: clientData.companyGroup,        // Convert companyGroup → company_group
        financial_reporting: clientData.financialReporting, // Convert financialReporting → financial_reporting
        revenue_currency: clientData.revenueCurrency,  // Convert revenueCurrency → revenue_currency
        revenue_period: clientData.revenuePeriod,      // Convert revenuePeriod → revenue_period
        credit_limit: clientData.creditLimit,          // Convert creditLimit → credit_limit
        limit_currency: clientData.limitCurrency       // Convert limitCurrency → limit_currency
      };

      // Remove the camelCase versions since we're sending snake_case
      delete apiData.clientStatus;
      delete apiData.legalName;
      delete apiData.companyGroup;
      delete apiData.financialReporting;
      delete apiData.revenueCurrency;
      delete apiData.revenuePeriod;
      delete apiData.creditLimit;
      delete apiData.limitCurrency;

      console.log('Saving client - Original data:', clientData);
      console.log('Saving client - API data:', apiData);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData), // Send the converted data
      });

      if (response.status === 401) {
        logout();
        throw new Error('Сессия истекла. Войдите заново.');
      }

      if (!response.ok) {
        // Parse error response
        let errorMessage = 'Failed to save client';
        try {
          const errorData = await response.json();
          console.log('Client save error response:', errorData); // Debug log for errors
          // Handle Django validation errors
          if (errorData.inn) {
            errorMessage = `ИНН: ${Array.isArray(errorData.inn) ? errorData.inn[0] : errorData.inn}`;
          } else if (errorData.name) {
            errorMessage = `Название: ${Array.isArray(errorData.name) ? errorData.name[0] : errorData.name}`;
          } else if (errorData.email) {
            errorMessage = `Email: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.non_field_errors) {
            errorMessage = Array.isArray(errorData.non_field_errors) 
              ? errorData.non_field_errors[0] 
              : errorData.non_field_errors;
          } else {
            errorMessage = `Ошибка сервера: ${response.status}`;
          }
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const savedClient = await response.json();
      console.log('Client saved successfully:', savedClient);
      console.log('Status comparison - Sent:', apiData.client_status, 'Received:', savedClient.clientStatus); // Debug status
      
      // Refresh clients list
      await fetchClients();
      
      // Close form after successful save
      setShowNewClientForm(false);
      setEditingClient(null);
      
      return savedClient;
      
    } catch (error) {
      console.error('Error saving client:', error);
      throw error; // Re-throw error so ClientForm can catch it
    }
  };

  // Handle policy form submission
  const handlePolicySave = async (policyData) => {
    if (!authToken) {
      throw new Error('Нет токена авторизации');
    }

    try {
      const method = editingPolicy ? 'PUT' : 'POST';
      const url = editingPolicy 
        ? `${API_URL}/policies/${editingPolicy.id}/`
        : `${API_URL}/policies/`;

      console.log('Saving policy:', method, url, policyData);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policyData),
      });

      if (response.status === 401) {
        logout();
        throw new Error('Сессия истекла. Войдите заново.');
      }

      if (!response.ok) {
        let errorMessage = 'Failed to save policy';
        try {
          const errorData = await response.json();
          console.log('Policy save error response:', errorData); // Debug log for policy errors
          errorMessage = errorData.detail || errorData.message || `Server error: ${response.status}`;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const savedPolicy = await response.json();
      console.log('Policy saved successfully:', savedPolicy);
      
      // Refresh policies list
      await fetchPolicies();
      
      // Close form after successful save
      setShowNewPolicyForm(false);
      setEditingPolicy(null);
      
      return savedPolicy;
      
    } catch (error) {
      console.error('Error saving policy:', error);
      throw error;
    }
  };

  // Handle client editing
  const handleEditClient = (client) => {
    console.log('Editing client:', client); // Debug log to see client data
    setEditingClient(client);
    setShowNewClientForm(true);
    setActiveTab('clients');
  };

  // Handle policy editing
  const handleEditPolicy = (policy) => {
    console.log('Editing policy:', policy); // Debug log to see policy data
    setEditingPolicy(policy);
    setShowNewPolicyForm(true);
    setActiveTab('policies');
  };

  // Handle client deletion
  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
      return;
    }

    if (!authToken) {
      alert('Нет токена авторизации');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/clients/${clientId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        logout();
        alert('Сессия истекла. Войдите заново.');
        return;
      }

      if (response.ok || response.status === 204) {
        await fetchClients();
        console.log('Client deleted successfully');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to delete client: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert(`Ошибка при удалении клиента: ${error.message}`);
    }
  };

  // Handle policy deletion
  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот полис?')) {
      return;
    }

    if (!authToken) {
      alert('Нет токена авторизации');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/policies/${policyId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        logout();
        alert('Сессия истекла. Войдите заново.');
        return;
      }

      if (response.ok || response.status === 204) {
        await fetchPolicies();
        console.log('Policy deleted successfully');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to delete policy: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
      alert(`Ошибка при удалении полиса: ${error.message}`);
    }
  };

  // Handle form cancellation
  const handleCancelClientForm = () => {
    setShowNewClientForm(false);
    setEditingClient(null);
  };

  const handleCancelPolicyForm = () => {
    setShowNewPolicyForm(false);
    setEditingPolicy(null);
  };

  // Handle tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Close forms when switching tabs unless switching to the relevant tab
    if (tabId !== 'clients') {
      setShowNewClientForm(false);
      setEditingClient(null);
    }
    if (tabId !== 'policies') {
      setShowNewPolicyForm(false);
      setEditingPolicy(null);
    }
  };

  // Show loading screen during initial authentication check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show loading screen during data fetch
  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  // Render current tab content
  const renderContent = () => {
    // Show client form if editing or creating new client
    if (showNewClientForm) {
      return (
        <ClientForm
          initialData={editingClient}      // ✅ Fixed: Changed from 'client' to 'initialData'
          onSave={handleClientSave}
          onCancel={handleCancelClientForm}
          authToken={authToken}           // ✅ Added missing prop
          API_URL={API_URL}              // ✅ Added missing prop
        />
      );
    }

    // Show policy form if editing or creating new policy
    if (showNewPolicyForm) {
      return (
        <PolicyForm
          initialData={editingPolicy}
          onSave={handlePolicySave}
          onCancel={handleCancelPolicyForm}
          authToken={authToken}
          clients={clients}
        />
      );
    }

    // Show regular tab content
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            clients={clients}
            policies={policies}
          />
        );
      case 'clients':
        return (
          <Clients
            clients={clients}
            onCreateNew={handleCreateNewClient}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
            onRefresh={fetchClients}
          />
        );
      case 'policies':
        return (
          <Policies
            policies={policies}
            clients={clients}
            onCreateNew={handleCreateNewPolicy}
            onEditPolicy={handleEditPolicy}
            onDeletePolicy={handleDeletePolicy}
            onRefresh={fetchPolicies}
          />
        );
      case 'reports':
        return (
          <Reports
            clients={clients}
            policies={policies}
          />
        );
      case 'analytics':
        return (
          <Analytics
            clients={clients}
            policies={policies}
          />
        );
      default:
        return <Dashboard clients={clients} policies={policies} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      showNewClientForm={showNewClientForm}
      showNewPolicyForm={showNewPolicyForm}
      onCreateNewClient={handleCreateNewClient}
      onCreateNewPolicy={handleCreateNewPolicy}
    >
      {renderContent()}
    </Layout>
  );
};

// Main App Component with Auth Provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;