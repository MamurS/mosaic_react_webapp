import React, { useState } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import AccountSettingsModal from '../common/AccountSettingsModal';
import { useAuth } from '../../hooks/useAuth';

const Layout = ({ 
  children, 
  activeTab, 
  onTabChange, 
  showNewClientForm, 
  showNewPolicyForm,
  onCreateNewClient,
  onCreateNewPolicy
}) => {
  const { currentUser, logout } = useAuth();
  const [showAccountModal, setShowAccountModal] = useState(false);

  const handleAccountClick = () => {
    console.log('Account button clicked, current modal state:', showAccountModal);
    setShowAccountModal(true);
    console.log('Modal state set to true');
  };

  const handleCloseAccountModal = () => {
    console.log('Close modal called');
    setShowAccountModal(false);
  };

  const handleLogout = () => {
    logout();
    setShowAccountModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        currentUser={currentUser}
        onAccountClick={handleAccountClick}
      />

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        showNewClientForm={showNewClientForm}
        showNewPolicyForm={showNewPolicyForm}
        onCreateNewClient={onCreateNewClient}
        onCreateNewPolicy={onCreateNewPolicy}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Account Settings Modal */}
      <AccountSettingsModal
        show={showAccountModal}
        currentUser={currentUser}
        onClose={handleCloseAccountModal}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default Layout;