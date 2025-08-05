// src/components/common/ClientSearch.js

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const ClientSearch = ({ onClientSelect, onCreateClient, placeholder, className, allClients, onSearchResults }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [noResults, setNoResults] = useState(false);

    useEffect(() => {
        if (searchTerm.length < 1) {
            setShowDropdown(false);
            setSearchResults([]);
            setNoResults(false);
            return;
        }

        const handler = setTimeout(() => {
            const results = allClients.filter(client =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.inn.includes(searchTerm)
            );
            setSearchResults(results);
            setShowDropdown(true);
            setNoResults(results.length === 0);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, allClients]);

    const handleSelect = (client) => {
        setSearchTerm(client.name);
        setShowDropdown(false);
        onClientSelect(client);
    };

    const handleCreate = () => {
        setShowDropdown(false);
        onCreateClient(searchTerm);
    };
    
    const handleFullSearch = () => {
        const results = allClients.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.inn.includes(searchTerm)
        );
        onSearchResults(results, searchTerm);
    }

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => { if(searchTerm) setShowDropdown(true); }}
                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                    type="button" 
                    onClick={handleFullSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-blue-700 transition-colors"
                >
                    <Search size={20} />
                </button>
            </div>

            {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto overflow-x-hidden">
                    <div className="group p-2">
                        {searchResults.map(client => (
                            <div
                                key={client.id}
                                onClick={() => handleSelect(client)}
                                className="px-4 py-3 cursor-pointer rounded-md group-hover:opacity-50 hover:!opacity-100 hover:bg-blue-50 hover:shadow-md hover:scale-[1.02] transform transition-all duration-200"
                            >
                                <p className="font-medium">{client.name}</p>
                                <p className="text-sm text-gray-500">ИНН: {client.inn}</p>
                            </div>
                        ))}
                    </div>
                    {noResults && (
                        <div className="p-4 text-center text-gray-500">
                            <p>Клиент не найден.</p>
                            <button onClick={handleCreate} className="text-blue-600 hover:underline mt-1">
                                Создать нового клиента?
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClientSearch;