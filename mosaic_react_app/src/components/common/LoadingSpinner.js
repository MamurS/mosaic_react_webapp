import React from 'react';

/**
 * LoadingSpinner Component
 * Reusable loading spinner with multiple variants and sizes
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size variant ('xs', 'sm', 'md', 'lg', 'xl')
 * @param {string} props.color - Color variant ('blue', 'green', 'red', 'gray', 'white')
 * @param {string} props.variant - Spinner variant ('default', 'dots', 'bars', 'pulse')
 * @param {string} props.text - Optional loading text
 * @param {boolean} props.overlay - Show as overlay spinner
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.fullScreen - Show as full screen spinner
 */
const LoadingSpinner = ({
  size = 'md',
  color = 'blue',
  variant = 'default',
  text = '',
  overlay = false,
  className = '',
  fullScreen = false
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  // Color classes
  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    gray: 'border-gray-500',
    white: 'border-white',
    current: 'border-current'
  };

  // Text size classes
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  // Default spinner
  const DefaultSpinner = () => (
    <div
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        border-2 border-solid border-t-transparent 
        rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Загрузка"
    />
  );

  // Dots spinner
  const DotsSpinner = () => (
    <div className={`flex space-x-1 ${className}`} role="status" aria-label="Загрузка">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`
            ${sizeClasses[size]} 
            ${colorClasses[color].replace('border-', 'bg-')} 
            rounded-full animate-bounce
          `}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );

  // Bars spinner
  const BarsSpinner = () => (
    <div className={`flex space-x-1 ${className}`} role="status" aria-label="Загрузка">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`
            w-1 ${sizeClasses[size].split(' ')[1]} 
            ${colorClasses[color].replace('border-', 'bg-')} 
            animate-pulse
          `}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1.2s'
          }}
        />
      ))}
    </div>
  );

  // Pulse spinner
  const PulseSpinner = () => (
    <div
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color].replace('border-', 'bg-')} 
        rounded-full animate-ping
        ${className}
      `}
      role="status"
      aria-label="Загрузка"
    />
  );

  // Select spinner variant
  const getSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner />;
      case 'bars':
        return <BarsSpinner />;
      case 'pulse':
        return <PulseSpinner />;
      default:
        return <DefaultSpinner />;
    }
  };

  // Spinner content
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-3">
      {getSpinner()}
      {text && (
        <div className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
          {text}
        </div>
      )}
    </div>
  );

  // Full screen spinner
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
        <div className="text-center">
          {spinnerContent}
        </div>
      </div>
    );
  }

  // Overlay spinner
  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
        <div className="text-center">
          {spinnerContent}
        </div>
      </div>
    );
  }

  // Regular spinner
  return spinnerContent;
};

/**
 * Inline Loading Spinner
 * Small spinner for inline use (e.g., inside buttons)
 */
export const InlineSpinner = ({ 
  size = 'sm', 
  color = 'current', 
  className = '' 
}) => (
  <LoadingSpinner 
    size={size} 
    color={color} 
    className={className}
  />
);

/**
 * Page Loading Spinner
 * Full page loading spinner with optional message
 */
export const PageSpinner = ({ 
  text = 'Загрузка...', 
  size = 'lg',
  color = 'blue' 
}) => (
  <LoadingSpinner 
    size={size}
    color={color}
    text={text}
    fullScreen={true}
  />
);

/**
 * Card Loading Spinner
 * Spinner for card/section overlays
 */
export const CardSpinner = ({ 
  text = '', 
  size = 'md',
  color = 'blue' 
}) => (
  <LoadingSpinner 
    size={size}
    color={color}
    text={text}
    overlay={true}
  />
);

/**
 * Button Loading Spinner
 * Specialized spinner for buttons
 */
export const ButtonSpinner = ({ 
  size = 'sm', 
  color = 'white',
  text = 'Загрузка...'
}) => (
  <div className="flex items-center space-x-2">
    <LoadingSpinner size={size} color={color} />
    <span>{text}</span>
  </div>
);

/**
 * Data Loading Spinner
 * Spinner for data tables and lists
 */
export const DataSpinner = ({ 
  text = 'Загрузка данных...',
  variant = 'dots',
  size = 'md',
  color = 'blue'
}) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <LoadingSpinner 
      size={size}
      color={color}
      variant={variant}
    />
    <div className="text-gray-500 text-sm">{text}</div>
  </div>
);

/**
 * Search Loading Spinner
 * Spinner for search operations
 */
export const SearchSpinner = ({ 
  size = 'sm',
  color = 'blue'
}) => (
  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
    <LoadingSpinner size={size} color={color} />
  </div>
);

/**
 * Upload Loading Spinner
 * Spinner for file uploads
 */
export const UploadSpinner = ({ 
  progress = null,
  text = 'Загрузка файла...',
  size = 'lg'
}) => (
  <div className="flex flex-col items-center justify-center space-y-4 p-8">
    <LoadingSpinner 
      size={size}
      color="blue"
      variant="pulse"
    />
    <div className="text-center">
      <div className="text-gray-700 font-medium">{text}</div>
      {progress !== null && (
        <div className="mt-2">
          <div className="text-sm text-gray-500 mb-1">{progress}% завершено</div>
          <div className="w-48 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  </div>
);

/**
 * Skeleton Loading Component
 * Alternative to spinner for content placeholders
 */
export const SkeletonLoader = ({ 
  lines = 3, 
  avatar = false,
  className = '' 
}) => (
  <div className={`animate-pulse ${className}`}>
    <div className="flex space-x-4">
      {avatar && (
        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
      )}
      <div className="flex-1 space-y-2 py-1">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i}
            className="h-4 bg-gray-200 rounded"
            style={{ 
              width: i === lines - 1 ? '75%' : '100%' 
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default LoadingSpinner;