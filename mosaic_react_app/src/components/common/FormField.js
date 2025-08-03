import React, { forwardRef, useState } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff, Info } from 'lucide-react';

/**
 * FormField Component
 * Comprehensive reusable form field with validation and multiple input types
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Input type ('text', 'email', 'password', 'number', 'tel', 'url', 'search')
 * @param {string} props.label - Field label
 * @param {boolean} props.required - Is field required
 * @param {string} props.error - Error message
 * @param {string} props.success - Success message
 * @param {string} props.help - Help text
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Field value
 * @param {function} props.onChange - Change handler
 * @param {function} props.onBlur - Blur handler
 * @param {boolean} props.disabled - Disable field
 * @param {string} props.size - Field size ('sm', 'md', 'lg')
 * @param {React.ReactNode} props.leftIcon - Icon on the left
 * @param {React.ReactNode} props.rightIcon - Icon on the right
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.inputClassName - Additional input CSS classes
 */
const FormField = forwardRef(({
  type = 'text',
  label,
  required = false,
  error,
  success,
  help,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  inputClassName = '',
  id,
  name,
  autoComplete,
  maxLength,
  minLength,
  min,
  max,
  step,
  pattern,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  
  const fieldId = id || name || `field-${Math.random().toString(36).substr(2, 9)}`;
  
  // Size classes
  const sizeClasses = {
    sm: {
      input: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      label: 'text-sm'
    },
    md: {
      input: 'px-3 py-2 text-sm',
      icon: 'w-5 h-5',
      label: 'text-sm'
    },
    lg: {
      input: 'px-4 py-3 text-base',
      icon: 'w-6 h-6',
      label: 'text-base'
    }
  };

  // State-based styling
  const getInputClasses = () => {
    const baseClasses = [
      'w-full',
      'border',
      'rounded-lg',
      'shadow-sm',
      'placeholder-gray-400',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-0',
      'transition-all',
      'duration-150',
      'ease-in-out',
      sizeClasses[size].input
    ];

    // Icon padding adjustments
    if (leftIcon) baseClasses.push('pl-10');
    if (rightIcon || type === 'password') baseClasses.push('pr-10');

    // State classes
    if (disabled) {
      baseClasses.push(
        'bg-gray-50',
        'text-gray-500',
        'cursor-not-allowed',
        'border-gray-200'
      );
    } else if (error) {
      baseClasses.push(
        'border-red-300',
        'focus:border-red-500',
        'focus:ring-red-500',
        'bg-red-50'
      );
    } else if (success) {
      baseClasses.push(
        'border-green-300',
        'focus:border-green-500',
        'focus:ring-green-500',
        'bg-green-50'
      );
    } else {
      baseClasses.push(
        'border-gray-300',
        'focus:border-blue-500',
        'focus:ring-blue-500',
        'bg-white',
        'hover:border-gray-400'
      );
    }

    return baseClasses.join(' ');
  };

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle focus events
  const handleFocus = (e) => {
    setFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  // Render input based on type
  const renderInput = () => {
    const inputType = type === 'password' && showPassword ? 'text' : type;
    
    return (
      <input
        ref={ref}
        id={fieldId}
        name={name}
        type={inputType}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={`${getInputClasses()} ${inputClassName}`}
        autoComplete={autoComplete}
        maxLength={maxLength}
        minLength={minLength}
        min={min}
        max={max}
        step={step}
        pattern={pattern}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          [
            error && `${fieldId}-error`,
            success && `${fieldId}-success`, 
            help && `${fieldId}-help`
          ].filter(Boolean).join(' ') || undefined
        }
        {...props}
      />
    );
  };

  // Render icons
  const renderLeftIcon = () => {
    if (!leftIcon) return null;
    
    return (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <div className={`text-gray-400 ${sizeClasses[size].icon}`}>
          {leftIcon}
        </div>
      </div>
    );
  };

  const renderRightIcon = () => {
    // Password toggle takes precedence
    if (type === 'password') {
      return (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            onClick={togglePasswordVisibility}
            disabled={disabled}
            className={`${sizeClasses[size].icon} text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 disabled:cursor-not-allowed`}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
      );
    }

    if (!rightIcon) return null;

    return (
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <div className={`text-gray-400 ${sizeClasses[size].icon}`}>
          {rightIcon}
        </div>
      </div>
    );
  };

  // Render validation icon
  const renderValidationIcon = () => {
    if (disabled || (!error && !success)) return null;
    
    return (
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        {error && (
          <AlertCircle className={`${sizeClasses[size].icon} text-red-500`} />
        )}
        {success && (
          <CheckCircle className={`${sizeClasses[size].icon} text-green-500`} />
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={fieldId}
          className={`block font-medium text-gray-700 ${sizeClasses[size].label} ${
            focused ? 'text-blue-600' : ''
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {renderLeftIcon()}
        {renderInput()}
        {type === 'password' ? renderRightIcon() : (rightIcon ? renderRightIcon() : renderValidationIcon())}
      </div>

      {/* Help Text */}
      {help && !error && !success && (
        <div
          id={`${fieldId}-help`}
          className="flex items-start gap-1 text-sm text-gray-500"
        >
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{help}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div
          id={`${fieldId}-success`}
          className="flex items-start gap-1 text-sm text-green-600"
        >
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          id={`${fieldId}-error`}
          className="flex items-start gap-1 text-sm text-red-600"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

/**
 * TextArea Field Component
 */
export const TextAreaField = forwardRef(({
  label,
  required = false,
  error,
  success,
  help,
  rows = 4,
  resize = 'vertical',
  className = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const fieldId = props.id || props.name || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  const getTextAreaClasses = () => {
    const baseClasses = [
      'w-full',
      'px-3',
      'py-2',
      'border',
      'rounded-lg',
      'shadow-sm',
      'placeholder-gray-400',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-0',
      'transition-all',
      'duration-150',
      'ease-in-out',
      'text-sm'
    ];

    // Resize classes
    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    };
    baseClasses.push(resizeClasses[resize]);

    // State classes
    if (props.disabled) {
      baseClasses.push(
        'bg-gray-50',
        'text-gray-500',
        'cursor-not-allowed',
        'border-gray-200'
      );
    } else if (error) {
      baseClasses.push(
        'border-red-300',
        'focus:border-red-500',
        'focus:ring-red-500',
        'bg-red-50'
      );
    } else if (success) {
      baseClasses.push(
        'border-green-300',
        'focus:border-green-500',
        'focus:ring-green-500',
        'bg-green-50'
      );
    } else {
      baseClasses.push(
        'border-gray-300',
        'focus:border-blue-500',
        'focus:ring-blue-500',
        'bg-white',
        'hover:border-gray-400'
      );
    }

    return baseClasses.join(' ');
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={fieldId}
          className={`block text-sm font-medium text-gray-700 ${
            focused ? 'text-blue-600' : ''
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* TextArea */}
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        className={getTextAreaClasses()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          [
            error && `${fieldId}-error`,
            success && `${fieldId}-success`,
            help && `${fieldId}-help`
          ].filter(Boolean).join(' ') || undefined
        }
        {...props}
      />

      {/* Help Text */}
      {help && !error && !success && (
        <div
          id={`${fieldId}-help`}
          className="flex items-start gap-1 text-sm text-gray-500"
        >
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{help}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div
          id={`${fieldId}-success`}
          className="flex items-start gap-1 text-sm text-green-600"
        >
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          id={`${fieldId}-error`}
          className="flex items-start gap-1 text-sm text-red-600"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

TextAreaField.displayName = 'TextAreaField';

/**
 * Select Field Component
 */
export const SelectField = forwardRef(({
  label,
  required = false,
  error,
  success,
  help,
  options = [],
  placeholder = 'Выберите...',
  className = '',
  size = 'md',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const fieldId = props.id || props.name || `select-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm', 
    lg: 'px-4 py-3 text-base'
  };

  const getSelectClasses = () => {
    const baseClasses = [
      'w-full',
      'border',
      'rounded-lg',
      'shadow-sm',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-0',
      'transition-all',
      'duration-150',
      'ease-in-out',
      'cursor-pointer',
      'bg-white',
      sizeClasses[size]
    ];

    // State classes
    if (props.disabled) {
      baseClasses.push(
        'bg-gray-50',
        'text-gray-500',
        'cursor-not-allowed',
        'border-gray-200'
      );
    } else if (error) {
      baseClasses.push(
        'border-red-300',
        'focus:border-red-500',
        'focus:ring-red-500'
      );
    } else if (success) {
      baseClasses.push(
        'border-green-300',
        'focus:border-green-500',
        'focus:ring-green-500'
      );
    } else {
      baseClasses.push(
        'border-gray-300',
        'focus:border-blue-500',
        'focus:ring-blue-500',
        'hover:border-gray-400'
      );
    }

    return baseClasses.join(' ');
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={fieldId}
          className={`block text-sm font-medium text-gray-700 ${
            focused ? 'text-blue-600' : ''
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select */}
      <select
        ref={ref}
        id={fieldId}
        className={getSelectClasses()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          [
            error && `${fieldId}-error`,
            success && `${fieldId}-success`,
            help && `${fieldId}-help`
          ].filter(Boolean).join(' ') || undefined
        }
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => {
          if (typeof option === 'string') {
            return (
              <option key={index} value={option}>
                {option}
              </option>
            );
          }
          return (
            <option key={option.value || index} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>

      {/* Help Text */}
      {help && !error && !success && (
        <div
          id={`${fieldId}-help`}
          className="flex items-start gap-1 text-sm text-gray-500"
        >
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{help}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div
          id={`${fieldId}-success`}
          className="flex items-start gap-1 text-sm text-green-600"
        >
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          id={`${fieldId}-error`}
          className="flex items-start gap-1 text-sm text-red-600"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

SelectField.displayName = 'SelectField';

export default FormField;