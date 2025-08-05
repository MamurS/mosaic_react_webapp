import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, User, AlertCircle, Loader2 } from 'lucide-react';
import { API_URL } from '../../utils/constants';

const ClientSearch = ({ 
  selectedClient, 
  onClientSelect, 
  onCreateNew,
  placeholder = "Поиск клиента...",
  disabled = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log('ClientSearch state:', { 
      searchTerm, 
      isOpen, 
      searchResults: searchResults.length,
      isLoading 
    });
  }, [searchTerm, isOpen, searchResults, isLoading]);

  // Debounced search effect
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't search if no search term
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsOpen(false);
      setError(null);
      return;
    }

    // Set up debounced search
    const delay = searchTerm.length === 1 ? 500 : 300;
    
    timeoutRef.current = setTimeout(() => {
      console.log('Triggering search for:', searchTerm);
      searchClients(searchTerm);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchClients = async (term) => {
    if (!term.trim()) return;

    setIsLoading(true);
    setError(null);
    console.log('Starting search for:', term);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Нет токена авторизации');
      }

      const response = await fetch(`${API_URL}/clients/?search=${encodeURIComponent(term)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Search response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Требуется авторизация');
        }
        throw new Error(`Ошибка поиска: ${response.status}`);
      }

      const data = await response.json();
      console.log('Search results:', data);
      
      const results = data.results || data || [];
      setSearchResults(results);
      setIsOpen(true); // Always open dropdown when we have results or even empty results
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Ошибка поиска');
      setSearchResults([]);
      setIsOpen(true); // Show dropdown even with error to display error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear previous selection when typing
    if (selectedClient && onClientSelect) {
      onClientSelect(null);
    }
    
    // Open dropdown immediately when typing
    if (value.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    // Show dropdown if we have search term
    if (searchTerm.trim()) {
      setIsOpen(true);
    }
  };

  const handleClientSelect = (client) => {
    console.log('Client selected:', client);
    setSearchTerm(client.name);
    setIsOpen(false);
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  const handleCreateNew = () => {
    console.log('Create new client clicked');
    setIsOpen(false);
    if (onCreateNew) {
      onCreateNew();
    }
  };

  const displayValue = selectedClient ? selectedClient.name : searchTerm;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          ref={searchRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm 
            placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:border-blue-500 
            transition-all duration-200 bg-white
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'}
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Error message */}
      {error && !isLoading && (
        <div className="mt-1 flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 mt-1">
          {isLoading && (
            <div className="px-4 py-3 text-center text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Поиск...
            </div>
          )}

          {/* No results message */}
          {!isLoading && searchResults.length === 0 && searchTerm.trim() && !error && (
            <div className="px-4 py-3 text-center text-gray-500">
              Клиенты не найдены
            </div>
          )}

          {/* Search Results */}
          {!isLoading && searchResults.map((client) => (
            <div
              key={client.id}
              onClick={() => handleClientSelect(client)}
              className="client-search-item px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-md hover:z-10 relative"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {client.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    ИНН: {client.inn}
                    {client.policies && client.policies.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                        {client.policies.length} полис(ов)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Create New Client Button - Show always when dropdown is open */}
          {searchTerm.trim() && (
            <div
              onClick={handleCreateNew}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-t border-gray-200 bg-gray-50 transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-md"
            >
              <div className="flex items-center space-x-3 text-blue-600">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Plus className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium">Создать нового клиента</div>
                  <div className="text-sm text-blue-500">
                    "{searchTerm}"
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSearch;

