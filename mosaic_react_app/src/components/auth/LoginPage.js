import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login, loading } = useAuth(); // Use auth context instead of props
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Введите имя пользователя';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Пароль должен содержать минимум 3 символа';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await login({
        username: formData.username,
        password: formData.password
      });

      if (!result.success) {
        setErrors({
          submit: result.error || 'Ошибка входа в систему'
        });
      }
      // If successful, the auth context will handle the redirect
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        submit: 'Неверное имя пользователя или пароль'
      });
    }
  };

  const getFieldClassName = (fieldName) => {
    const baseClasses = "w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200";
    
    if (errors[fieldName]) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500`;
    }
    
    return `${baseClasses} border-gray-300`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
            <div className="text-white text-2xl font-bold">IM</div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать!
          </h2>
          <p className="text-gray-600">
            Войдите в систему управления страхованием
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 animate-fadeIn">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{errors.submit}</span>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Имя пользователя
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Введите имя пользователя"
                  className={getFieldClassName('username')}
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.username}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Введите пароль"
                  className={getFieldClassName('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Запомнить меня
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Вход в систему...</span>
                </>
              ) : (
                <span>Войти в систему</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Нужна помощь? Обратитесь к администратору
            </p>
          </div>
        </div>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 text-sm font-medium mb-2">Режим разработки</p>
            <p className="text-yellow-700 text-xs">
              Используйте учетные данные, созданные в Django admin
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;