// src/components/common/ClientSearchResultsModal.js

import React from 'react';
import { X } from 'lucide-react';

const ClientSearchResultsModal = ({ show, results, searchTerm, onClose, onClientSelect, onCreateClient }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Результаты поиска: "{searchTerm}"</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <div className="p-2 overflow-y-auto">
                    {results.length > 0 ? (
                        <div className="group">
                            {results.map(client => (
                                <div
                                    key={client.id}
                                    onClick={() => onClientSelect(client)}
                                    className="px-4 py-3 cursor-pointer rounded-md group-hover:opacity-50 hover:!opacity-100 hover:bg-blue-50 hover:shadow-md hover:scale-[1.02] transform transition-all duration-200"
                                >
                                    <p className="font-medium">{client.name}</p>
                                    <p className="text-sm text-gray-500">ИНН: {client.inn}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <p>Клиент не найден.</p>
                            <button onClick={() => onCreateClient(searchTerm)} className="text-blue-600 hover:underline mt-2">
                                Создать нового клиента "{searchTerm}"?
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientSearchResultsModal;