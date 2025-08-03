import React, { useState, useEffect } from 'react';
import { X, User, Mail, Building, LogOut, Shield, Edit2, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AccountSettingsModal = ({ show, onClose, onLogout, currentUser }) => {
  const { updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    email: currentUser?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Handle modal visibility with delay
  useEffect(() => {
    if (show) {
      console.log('Modal should show');
      setIsVisible(true);
    } else {
      console.log('Modal should hide');
      setIsVisible(false);
    }
  }, [show]);

  // Prevent modal from closing immediately
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        console.log('Modal stabilized');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show || !isVisible) return null;

  const getUserInitials = () => {
    if (!currentUser) return '?';
    const firstName = currentUser.first_name || '';
    const lastName = currentUser.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || currentUser.username?.charAt(0).toUpperCase() || '?';
  };

  const getDisplayName = () => {
    if (!currentUser) return 'Пользователь';
    const firstName = currentUser.first_name || '';
    const lastName = currentUser.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || currentUser.username || 'Пользователь';
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    onLogout();
    onClose();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      first_name: currentUser?.first_name || '',
      last_name: currentUser?.last_name || '',
      email: currentUser?.email || ''
    });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      first_name: currentUser?.first_name || '',
      last_name: currentUser?.last_name || '',
      email: currentUser?.email || ''
    });
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Введите корректный email адрес');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await updateUserProfile(formData);
      if (result.success) {
        setSuccess('Профиль успешно обновлен');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Ошибка при обновлении профиля');
      }
    } catch (err) {
      setError('Произошла ошибка при сохранении данных');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    console.log('Close clicked');
    onClose();
  };

  // Simple backdrop click handler
  const handleBackdropClick = (e) => {
    console.log('Backdrop clicked', e.target.className);
    if (e.target.classList.contains('modal-backdrop')) {
      handleClose();
    }
  };

  return (
    <div 
      className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onMouseDown={handleBackdropClick}
      style={{ zIndex: 9999 }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Настройки аккаунта
          </h2>
          <button 
            onMouseDown={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* User Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center text-white font-semibold text-3xl">
              {getUserInitials()}
            </div>
            <div className="flex-1">
              {!isEditing ? (
                <>
                  <p className="font-bold text-xl text-gray-800">{getDisplayName()}</p>
                  <p className="text-gray-500">
                    {currentUser?.is_staff ? 'Администратор' : 'Сотрудник'}
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Имя"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Фамилия"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <p className="text-gray-500 text-sm">
                    {currentUser?.is_staff ? 'Администратор' : 'Сотрудник'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-4 text-gray-700">
            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-gray-400 flex-shrink-0" />
              {!isEditing ? (
                <span>{currentUser?.email || 'Не указан'}</span>
              ) : (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              )}
            </div>

            {/* Username */}
            <div className="flex items-center gap-3">
              <User size={18} className="text-gray-400 flex-shrink-0" />
              <span>@{currentUser?.username}</span>
            </div>

            {/* Department */}
            <div className="flex items-center gap-3">
              <Building size={18} className="text-gray-400 flex-shrink-0" />
              <span>Отдел корпоративного страхования</span>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-gray-400 flex-shrink-0" />
              <span>{currentUser?.is_staff ? 'Полные права администратора' : 'Стандартные права пользователя'}</span>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t rounded-b-xl">
          {!isEditing ? (
            <div className="flex gap-3">
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                type="button"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 size={18} />
                Редактировать профиль
              </button>
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                type="button"
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Выйти
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                disabled={loading}
                type="button"
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                disabled={loading}
                type="button"
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Save size={18} />
                )}
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsModal;