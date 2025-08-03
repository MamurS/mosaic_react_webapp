import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook for accessing authentication context
 * Provides authentication state and actions throughout the app
 * 
 * @returns {Object} Authentication context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Hook for checking if user has specific permissions
 * 
 * @param {string} permission - Required permission
 * @returns {boolean} Whether user has permission
 */
export const usePermission = (permission) => {
  const { currentUser } = useAuth();
  
  // Basic permission system - can be extended
  const permissions = {
    'admin': currentUser?.is_staff || false,
    'create_client': true, // All authenticated users can create clients
    'edit_client': true,
    'delete_client': currentUser?.is_staff || false,
    'create_policy': true,
    'edit_policy': true, 
    'delete_policy': currentUser?.is_staff || false,
    'view_reports': true,
    'view_analytics': currentUser?.is_staff || false,
    'export_data': currentUser?.is_staff || false,
  };
  
  return permissions[permission] || false;
};

/**
 * Hook for accessing user profile information
 * 
 * @returns {Object} User profile data and helpers
 */
export const useUserProfile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  
  const getInitials = () => {
    if (!currentUser) return '?';
    const firstName = currentUser.first_name || '';
    const lastName = currentUser.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 
           currentUser.username?.charAt(0).toUpperCase() || '?';
  };
  
  const getDisplayName = () => {
    if (!currentUser) return 'Пользователь';
    const firstName = currentUser.first_name || '';
    const lastName = currentUser.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || currentUser.username || 'Пользователь';
  };
  
  const getRole = () => {
    if (!currentUser) return 'Гость';
    return currentUser.is_staff ? 'Администратор' : 'Сотрудник';
  };
  
  const getDepartment = () => {
    // This could come from user profile in the future
    return 'Отдел корпоративного страхования';
  };
  
  return {
    user: currentUser,
    initials: getInitials(),
    displayName: getDisplayName(),
    role: getRole(),
    department: getDepartment(),
    isAdmin: currentUser?.is_staff || false,
    updateProfile: updateUserProfile
  };
};

/**
 * Hook for managing authentication state with loading
 * 
 * @returns {Object} Auth state with loading indicators
 */
export const useAuthState = () => {
  const { isAuthenticated, loading, login, logout } = useAuth();
  
  return {
    isAuthenticated,
    isLoading: loading,
    login,
    logout,
    isReady: !loading
  };
};

export default useAuth;