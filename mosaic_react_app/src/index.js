/**
 * Insurance Management System - Application Entry Point
 * Main entry file for the React application
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './index.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Application Error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Что-то пошло не так
            </h1>
            
            <p className="text-gray-600 mb-6">
              Приложение столкнулось с неожиданной ошибкой. Пожалуйста, обновите страницу или обратитесь к администратору.
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Обновить страницу
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Попробовать снова
              </button>
            </div>
            
            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Детали ошибки (только в режиме разработки)
                </summary>
                <div className="bg-gray-50 rounded-lg p-4 text-xs font-mono text-gray-800 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                  </div>
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Performance monitoring (optional)
const reportWebVitals = (metric) => {
  // Log performance metrics in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals:', metric);
  }
  
  // In production, you might want to send metrics to an analytics service
  // Example: sendToAnalytics(metric);
};

// Application initialization
const initializeApp = () => {
  // Get the root element
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found. Make sure you have a div with id="root" in your HTML.');
    return;
  }

  // Create React root
  const root = ReactDOM.createRoot(rootElement);

  // Render the application
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );

  // Register service worker for production builds (optional)
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }

  // Development-only features
  if (process.env.NODE_ENV === 'development') {
    // Hot module replacement support
    if (module.hot) {
      module.hot.accept('./App', () => {
        const NextApp = require('./App').default;
        root.render(
          <React.StrictMode>
            <ErrorBoundary>
              <NextApp />
            </ErrorBoundary>
          </React.StrictMode>
        );
      });
    }

    // Development console greeting
    console.log(
      '%c🏢 Insurance Management System',
      'color: #1e40af; font-size: 24px; font-weight: bold;'
    );
    console.log(
      '%cWelcome to the development environment!',
      'color: #16a34a; font-size: 14px;'
    );
    console.log('Built with React, Tailwind CSS, and Recharts');
    
    // Performance monitoring
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportWebVitals);
      getFID(reportWebVitals);
      getFCP(reportWebVitals);
      getLCP(reportWebVitals);
      getTTFB(reportWebVitals);
    }).catch(() => {
      // web-vitals not available, skip performance monitoring
    });
  }

  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // You can send this to an error reporting service
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // You can send this to an error reporting service
  });

  // Application metadata
  console.log(`
    🏢 Insurance Management System
    Version: ${process.env.REACT_APP_VERSION || '1.0.0'}
    Environment: ${process.env.NODE_ENV}
    Build Date: ${process.env.REACT_APP_BUILD_DATE || new Date().toISOString()}
  `);
};

// Initialize the application
initializeApp();

// Export for testing purposes
export { ErrorBoundary, reportWebVitals };