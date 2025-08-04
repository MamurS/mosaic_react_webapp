import React from 'react';
import { Building2, User } from 'lucide-react';

const Header = ({ currentUser, onAccountClick }) => {
  const getDisplayName = () => {
    if (!currentUser) return 'Пользователь';
    
    const firstName = currentUser.first_name || '';
    const lastName = currentUser.last_name || '';
    
    return (
      `${firstName} ${lastName}`.trim() ||
      currentUser.username ||
      'Пользователь'
    );
  };

  const getUserInitials = () => {
    if (!currentUser) return '?';
    
    const firstName = currentUser.first_name || '';
    const lastName = currentUser.last_name || '';
    
    return (
      `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
      currentUser.username?.charAt(0).toUpperCase() ||
      '?'
    );
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  MIG ERP System
                </h1>
                <p className="text-sm text-gray-500">
                  Система управления страхованием
                </p>
              </div>
            </div>
          </div>

          {/* User Account Section */}
          <div className="flex items-center space-x-4">
            {/* User Info and Avatar */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAccountClick();
              }}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {getDisplayName()}
                </div>
                <div className="text-xs text-gray-500">
                  {currentUser?.is_staff ? 'Администратор' : 'Пользователь'}
                </div>
              </div>
              
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getUserInitials()}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;