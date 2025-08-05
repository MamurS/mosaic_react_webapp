// src/components/common/ClientSearch.js

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, User, AlertCircle, Loader2 } from 'lucide-react';

const ClientSearch = ({ onClientSelect, onCreateNew, onSearchResults, placeholder = "Поиск клиента...", disabled = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsOpen(false);
      setError(null);
      return;
    }
    const delay = searchTerm.length === 1 ? 500 : 300;
    timeoutRef.current = setTimeout(() => {
      searchClients(searchTerm);
    }, delay);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm]);

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
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Нет токена авторизации');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/clients/?search=${encodeURIComponent(term)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error(`Ошибка поиска: ${response.status}`);
      const data = await response.json();
      const results = data.results || data || [];
      setSearchResults(results);
      setIsOpen(true);
    } catch (err) {
      setError(err.message || 'Ошибка поиска');
      setSearchResults([]);
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onClientSelect) onClientSelect(null);
    if (value.trim()) setIsOpen(true);
    else setIsOpen(false);
  };

  const handleSelect = (client) => {
    setSearchTerm(client.name);
    setIsOpen(false);
    if (onClientSelect) onClientSelect(client);
  };

  const handleCreate = () => {
    setIsOpen(false);
    if (onCreateNew) onCreateNew(searchTerm);
  };

  const handleFullSearch = () => {
    onSearchResults(searchResults, searchTerm);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => { if (searchTerm.trim()) setIsOpen(true); }}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-4 pr-12 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'} ${error ? 'border-red-300' : 'border-gray-300'}`}
        />
        <button 
            type="button" 
            onClick={handleFullSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-blue-700 transition-colors"
        >
            <Search size={20} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 mt-1">
          {isLoading && <div className="px-4 py-3 text-center text-gray-500"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>}
          {!isLoading && searchResults.length === 0 && searchTerm.trim() && !error && (
            <div className="px-4 py-3 text-center text-gray-500">Клиенты не найдены</div>
          )}
          {!isLoading && searchResults.length > 0 && (
            <div className="group p-2">
              {searchResults.map((client) => (
                <div
                  key={client.id}
                  onClick={() => handleSelect(client)}
                  className="px-4 py-3 cursor-pointer rounded-md group-hover:opacity-50 hover:!opacity-100 hover:bg-blue-50 hover:shadow-md hover:scale-[1.02] transform transition-all duration-200"
                >
                  <div className="font-medium text-gray-900">{client.name}</div>
                  <div className="text-sm text-gray-500">ИНН: {client.inn}</div>
                </div>
              ))}
            </div>
          )}
          {searchTerm.trim() && !isLoading && (
            <div onClick={handleCreate} className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3 text-blue-600">
                <div className="flex-shrink-0"><Plus className="h-5 w-5" /></div>
                <div className="flex-1 font-medium">Создать нового клиента "{searchTerm}"</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSearch;