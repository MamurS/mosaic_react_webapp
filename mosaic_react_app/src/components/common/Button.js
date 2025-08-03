import React, { forwardRef } from 'react';
import { InlineSpinner } from './LoadingSpinner';

/**
 * Button Component
 * Comprehensive reusable button with multiple variants and states
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant ('primary', 'secondary', 'success', 'danger', 'warning', 'ghost', 'link')
 * @param {string} props.size - Button size ('xs', 'sm', 'md', 'lg', 'xl')
 * @param {boolean} props.loading - Show loading state
 * @param {boolean} props.disabled - Disable button
 * @param {string} props.loadingText - Text to show when loading
 * @param {React.ReactNode} props.leftIcon - Icon on the left
 * @param {React.ReactNode} props.rightIcon - Icon on the right
 * @param {boolean} props.fullWidth - Make button full width
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 * @param {function} props.onClick - Click handler
 * @param {string} props.type - Button type ('button', 'submit', 'reset')
 */
const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  loadingText = 'Загрузка...',
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  className = '',
  children,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  // Base button classes
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-lg',
    'border',
    'transition-all',
    'duration-150',
    'ease-in-out',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'active:transform',
    'active:scale-95',
    'select-none'
  ];

  // Size classes
  const sizeClasses = {
    xs: ['px-2', 'py-1', 'text-xs', 'gap-1'],
    sm: ['px-3', 'py-1.5', 'text-sm', 'gap-1.5'],
    md: ['px-4', 'py-2', 'text-sm', 'gap-2'],
    lg: ['px-6', 'py-3', 'text-base', 'gap-2'],
    xl: ['px-8', 'py-4', 'text-lg', 'gap-3']
  };

  // Variant classes
  const variantClasses = {
    primary: [
      'bg-blue-600',
      'text-white',
      'border-blue-600',
      'hover:bg-blue-700',
      'hover:border-blue-700',
      'focus:ring-blue-500',
      'disabled:bg-blue-300',
      'disabled:border-blue-300',
      'shadow-sm',
      'hover:shadow-md'
    ],
    secondary: [
      'bg-gray-100',
      'text-gray-900',
      'border-gray-300',
      'hover:bg-gray-200',
      'hover:border-gray-400',
      'focus:ring-gray-500',
      'disabled:bg-gray-50',
      'disabled:text-gray-400',
      'shadow-sm',
      'hover:shadow-md'
    ],
    success: [
      'bg-green-600',
      'text-white',
      'border-green-600',
      'hover:bg-green-700',
      'hover:border-green-700',
      'focus:ring-green-500',
      'disabled:bg-green-300',
      'disabled:border-green-300',
      'shadow-sm',
      'hover:shadow-md'
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'border-red-600',
      'hover:bg-red-700',
      'hover:border-red-700',
      'focus:ring-red-500',
      'disabled:bg-red-300',
      'disabled:border-red-300',
      'shadow-sm',
      'hover:shadow-md'
    ],
    warning: [
      'bg-yellow-500',
      'text-white',
      'border-yellow-500',
      'hover:bg-yellow-600',
      'hover:border-yellow-600',
      'focus:ring-yellow-500',
      'disabled:bg-yellow-300',
      'disabled:border-yellow-300',
      'shadow-sm',
      'hover:shadow-md'
    ],
    ghost: [
      'bg-transparent',
      'text-gray-700',
      'border-transparent',
      'hover:bg-gray-100',
      'hover:text-gray-900',
      'focus:ring-gray-500',
      'disabled:text-gray-400',
      'disabled:hover:bg-transparent'
    ],
    link: [
      'bg-transparent',
      'text-blue-600',
      'border-transparent',
      'hover:text-blue-700',
      'hover:underline',
      'focus:ring-blue-500',
      'disabled:text-blue-300',
      'p-0',
      'h-auto',
      'font-normal'
    ]
  };

  // Outline variants
  const outlineVariants = {
    'outline-primary': [
      'bg-transparent',
      'text-blue-600',
      'border-blue-600',
      'hover:bg-blue-600',
      'hover:text-white',
      'focus:ring-blue-500',
      'disabled:text-blue-300',
      'disabled:border-blue-300'
    ],
    'outline-secondary': [
      'bg-transparent',
      'text-gray-700',
      'border-gray-300',
      'hover:bg-gray-700',
      'hover:text-white',
      'focus:ring-gray-500',
      'disabled:text-gray-400',
      'disabled:border-gray-200'
    ],
    'outline-success': [
      'bg-transparent',
      'text-green-600',
      'border-green-600',
      'hover:bg-green-600',
      'hover:text-white',
      'focus:ring-green-500',
      'disabled:text-green-300',
      'disabled:border-green-300'
    ],
    'outline-danger': [
      'bg-transparent',
      'text-red-600',
      'border-red-600',
      'hover:bg-red-600',
      'hover:text-white',
      'focus:ring-red-500',
      'disabled:text-red-300',
      'disabled:border-red-300'
    ]
  };

  // Combine variant classes (including outline variants)
  const allVariantClasses = { ...variantClasses, ...outlineVariants };

  // Build final classes
  const finalClasses = [
    ...baseClasses,
    ...sizeClasses[size],
    ...allVariantClasses[variant],
    fullWidth && 'w-full',
    (disabled || loading) && 'cursor-not-allowed',
    !disabled && !loading && variant !== 'link' && 'hover:-translate-y-0.5',
    className
  ].filter(Boolean).join(' ');

  // Handle click
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  // Render loading state
  const renderContent = () => {
    if (loading) {
      return (
        <>
          <InlineSpinner 
            size={size === 'xs' ? 'xs' : 'sm'} 
            color={variant.includes('outline') || variant === 'ghost' || variant === 'link' ? 'current' : 'white'} 
          />
          {loadingText && <span>{loadingText}</span>}
        </>
      );
    }

    return (
      <>
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </>
    );
  };

  return (
    <button
      ref={ref}
      type={type}
      className={finalClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
});

Button.displayName = 'Button';

// Specialized button components

/**
 * Primary Button - Most common button variant
 */
export const PrimaryButton = forwardRef((props, ref) => (
  <Button ref={ref} variant="primary" {...props} />
));

/**
 * Secondary Button - Secondary actions
 */
export const SecondaryButton = forwardRef((props, ref) => (
  <Button ref={ref} variant="secondary" {...props} />
));

/**
 * Success Button - Success/confirmation actions
 */
export const SuccessButton = forwardRef((props, ref) => (
  <Button ref={ref} variant="success" {...props} />
));

/**
 * Danger Button - Destructive actions
 */
export const DangerButton = forwardRef((props, ref) => (
  <Button ref={ref} variant="danger" {...props} />
));

/**
 * Ghost Button - Subtle actions
 */
export const GhostButton = forwardRef((props, ref) => (
  <Button ref={ref} variant="ghost" {...props} />
));

/**
 * Link Button - Link-styled button
 */
export const LinkButton = forwardRef((props, ref) => (
  <Button ref={ref} variant="link" {...props} />
));

/**
 * Icon Button - Button with only icon
 */
export const IconButton = forwardRef(({ 
  icon, 
  size = 'md', 
  variant = 'ghost',
  'aria-label': ariaLabel,
  ...props 
}, ref) => {
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const paddingClasses = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4'
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={`${paddingClasses[size]} rounded-full`}
      aria-label={ariaLabel}
      {...props}
    >
      {React.cloneElement(icon, { className: iconSizes[size] })}
    </Button>
  );
});

/**
 * Floating Action Button - Material Design FAB
 */
export const FloatingActionButton = forwardRef(({ 
  icon, 
  size = 'lg',
  className = '',
  ...props 
}, ref) => (
  <Button
    ref={ref}
    variant="primary"
    size={size}
    className={`
      rounded-full shadow-lg hover:shadow-xl 
      fixed bottom-6 right-6 z-40
      transform hover:scale-105 active:scale-95
      ${className}
    `}
    {...props}
  >
    {icon}
  </Button>
));

/**
 * Button Group - Group of related buttons
 */
export const ButtonGroup = ({ 
  children, 
  className = '',
  orientation = 'horizontal',
  size = 'md',
  variant = 'secondary'
}) => {
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col'
  };

  return (
    <div className={`inline-flex ${orientationClasses[orientation]} ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;
          
          let roundedClasses = '';
          if (orientation === 'horizontal') {
            if (isFirst) roundedClasses = 'rounded-r-none';
            else if (isLast) roundedClasses = 'rounded-l-none';
            else roundedClasses = 'rounded-none';
          } else {
            if (isFirst) roundedClasses = 'rounded-b-none';
            else if (isLast) roundedClasses = 'rounded-t-none';
            else roundedClasses = 'rounded-none';
          }

          return React.cloneElement(child, {
            size: child.props.size || size,
            variant: child.props.variant || variant,
            className: `${child.props.className || ''} ${roundedClasses} ${!isFirst ? '-ml-px' : ''}`.trim()
          });
        }
        return child;
      })}
    </div>
  );
};

/**
 * Copy Button - Button with copy to clipboard functionality
 */
export const CopyButton = ({ 
  text, 
  onCopy,
  children = 'Копировать',
  successText = 'Скопировано!',
  ...props 
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (onCopy) onCopy(text);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant={copied ? 'success' : 'secondary'}
      {...props}
    >
      {copied ? successText : children}
    </Button>
  );
};

/**
 * Download Button - Button for file downloads
 */
export const DownloadButton = ({ 
  href,
  filename,
  children = 'Скачать',
  ...props 
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = href;
    if (filename) link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={handleDownload}
      leftIcon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
      {...props}
    >
      {children}
    </Button>
  );
};

export default Button;