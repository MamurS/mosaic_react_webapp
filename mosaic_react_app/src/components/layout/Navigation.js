import React from 'react';
import { Plus } from 'lucide-react';

const Navigation = ({ 
  activeTab, 
  onTabChange, 
  showNewPolicyForm, 
  showNewClientForm,
  onCreateNewClient,
  onCreateNewPolicy 
}) => {
  const getTabClassName = (tabId) => {
    const isActive = activeTab === tabId || 
                    (tabId === 'clients' && showNewClientForm) ||
                    (tabId === 'policies' && showNewPolicyForm);
    
    // Base classes - completely override ALL browser default button states
    const baseClasses = "py-4 px-1 transition-all duration-300 font-medium cursor-pointer relative bg-transparent border-none outline-none appearance-none select-none";
    
    // Add inline style to completely override browser defaults
    const baseStyle = {
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
      background: 'transparent',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      WebkitTapHighlightColor: 'transparent'
    };
    
    if (isActive) {
      // Active tab: bright text, blue underline using CSS pseudo-element
      return {
        className: `${baseClasses} text-blue-600 after:absolute after:bottom-0 after:left-1 after:right-1 after:h-0.5 after:bg-blue-600`,
        style: baseStyle
      };
    } else {
      // Inactive tabs: pale/muted text, grey underline on hover
      return {
        className: `${baseClasses} text-gray-400 hover:text-gray-600 hover:after:absolute hover:after:bottom-0 hover:after:left-1 hover:after:right-1 hover:after:h-0.5 hover:after:bg-gray-300 hover:after:transition-all hover:after:duration-300`,
        style: baseStyle
      };
    }
  };

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
  };

  const NAVIGATION_TABS = [
    { id: 'dashboard', label: 'Панель управления', hasAction: false },
    { id: 'clients', label: 'Клиенты', hasAction: true },
    { id: 'policies', label: 'Полисы', hasAction: true },
    { id: 'reports', label: 'Отчеты', hasAction: false },
    { id: 'analytics', label: 'Аналитика', hasAction: false },
  ];

  // Calculate active tab index for the blue underline indicator
  const activeTabIndex = NAVIGATION_TABS.findIndex(tab => 
    tab.id === activeTab || 
    (tab.id === 'clients' && showNewClientForm) ||
    (tab.id === 'policies' && showNewPolicyForm)
  );

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Navigation Tabs */}
          <nav className="flex space-x-8" aria-label="Tabs">
            {NAVIGATION_TABS.map((tab) => {
              const tabProps = getTabClassName(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={tabProps.className}
                  style={tabProps.style}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons - Only show when specifically needed */}
          <div className="flex space-x-3">
            {/* Only show client button in the navigation when actively creating */}
            {showNewClientForm && (
              <button
                onClick={onCreateNewClient}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Новый клиент</span>
              </button>
            )}
            
            {/* Only show policy button in the navigation when actively creating */}
            {showNewPolicyForm && (
              <button
                onClick={onCreateNewPolicy}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Новый полис</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;