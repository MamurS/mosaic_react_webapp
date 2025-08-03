import React, { useState } from 'react';
import { X, Edit, Download, Mail, Phone, Building, Calendar, DollarSign, Shield, FileText, User, Printer } from 'lucide-react';

const PolicyViewModal = ({ policy, onClose, onEdit, clients }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!policy) return null;

  // Find client information
  const client = clients.find(c => c.id === policy.client) || {};
  
  const formatCurrency = (amount, currency = 'UZS') => {
    if (!amount) return '—';
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'pending': return 'Ожидает';
      case 'expired': return 'Истек';
      default: return status;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const DetailItem = ({ icon: Icon, label, value, highlight = false }) => (
    <div className={`p-4 rounded-lg ${highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={16} className={highlight ? 'text-blue-600' : 'text-gray-500'} />}
        <span className={`text-sm font-medium ${highlight ? 'text-blue-700' : 'text-gray-600'}`}>
          {label}
        </span>
      </div>
      <div className={`font-semibold ${highlight ? 'text-blue-900' : 'text-gray-800'}`}>
        {value || '—'}
      </div>
    </div>
  );

  const tabs = [
    { id: 'details', label: 'Детали полиса', icon: FileText },
    { id: 'client', label: 'Информация о клиенте', icon: User },
    { id: 'financial', label: 'Финансы', icon: DollarSign },
    { id: 'documents', label: 'Документы', icon: Download }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden transform transition-all scale-95 opacity-0 animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 id="policy-modal-title" className="text-2xl font-bold text-gray-800">
                Полис №{String(policy.id).padStart(3, '0')}
              </h2>
              <p className="text-gray-600">
                {client.name || 'Неизвестный клиент'} • {formatDate(policy.creationDate)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(policy.status)}`}>
              {getStatusLabel(policy.status)}
            </span>
            
            <div className="flex gap-2">
              <button
                onClick={() => console.log('Print policy')}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Печать"
              >
                <Printer size={20} />
              </button>
              
              <button
                onClick={() => console.log('Download policy')}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Скачать"
              >
                <Download size={20} />
              </button>
              
              {onEdit && (
                <button
                  onClick={() => onEdit(policy)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Редактировать"
                >
                  <Edit size={20} />
                </button>
              )}
              
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <div className="flex px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-blue-700 border-blue-700'
                    : 'text-gray-600 border-transparent hover:text-blue-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Policy Details Tab */}
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DetailItem
                  icon={FileText}
                  label="Номер полиса"
                  value={`#${String(policy.id).padStart(3, '0')}`}
                  highlight
                />
                <DetailItem
                  icon={Calendar}
                  label="Дата создания"
                  value={formatDate(policy.creationDate)}
                />
                <DetailItem
                  icon={Shield}
                  label="Статус"
                  value={getStatusLabel(policy.status)}
                />
                <DetailItem
                  icon={User}
                  label="Андеррайтер"
                  value={policy.underwriter}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailItem
                  label="Страховая сумма"
                  value={formatCurrency(policy.insuranceAmount, policy.insuranceAmountCurrency)}
                />
                <DetailItem
                  label="Лимит по полису"
                  value={formatCurrency(policy.policyLimit, policy.policyLimitCurrency)}
                />
                <DetailItem
                  label="Лимит по клиенту"
                  value={formatCurrency(policy.clientLimit, policy.clientLimitCurrency)}
                />
                <DetailItem
                  label="Тип покрытия"
                  value={policy.coverageType}
                />
                <DetailItem
                  label="Срок страхования"
                  value={policy.insuranceTerm}
                />
                <DetailItem
                  label="Перестрахование"
                  value={policy.reinsurance === 'Yes' ? 'Да' : 'Нет'}
                />
              </div>

              {policy.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <FileText size={16} />
                    Примечания
                  </h4>
                  <p className="text-amber-700">{policy.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Client Information Tab */}
          {activeTab === 'client' && (
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building size={20} />
                  {client.name || 'Информация о клиенте недоступна'}
                </h3>
                
                {client.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">ИНН</label>
                      <p className="text-gray-800 font-semibold">{client.inn || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Юридическое название</label>
                      <p className="text-gray-800">{client.legalName || client.name || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Отрасль</label>
                      <p className="text-gray-800">{client.industry || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Страна</label>
                      <p className="text-gray-800">{client.country || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Регион</label>
                      <p className="text-gray-800">{client.region || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Город</label>
                      <p className="text-gray-800">{client.city || '—'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Информация о клиенте недоступна</p>
                )}
              </div>

              {client.id && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Phone size={16} />
                      Контактная информация
                    </h4>
                    <div className="space-y-3">
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          <span className="text-gray-700">{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          <span className="text-gray-700">{client.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <DollarSign size={16} />
                      Финансовые показатели
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600">Выручка</label>
                        <p className="font-semibold text-gray-800">
                          {formatCurrency(client.revenue, client.revenueCurrency)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600">Кредитный лимит</label>
                        <p className="font-semibold text-gray-800">
                          {formatCurrency(client.creditLimit, client.limitCurrency)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600">Статус клиента</label>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          client.clientStatus === 'active' ? 'bg-green-100 text-green-800' :
                          client.clientStatus === 'vip' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {client.clientStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Financial Details Tab */}
          {activeTab === 'financial' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DetailItem
                  icon={DollarSign}
                  label="Брутто-премия"
                  value={formatCurrency(policy.premium, policy.premiumCurrency)}
                  highlight
                />
                <DetailItem
                  icon={DollarSign}
                  label="Нетто-премия"
                  value={formatCurrency(policy.netPremium, policy.premiumCurrency)}
                  highlight
                />
                <DetailItem
                  label="Ставка"
                  value={`${policy.rate}%`}
                />
                <DetailItem
                  label="Валюта"
                  value={policy.premiumCurrency}
                />
              </div>

              {/* Premium Breakdown Chart would go here */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Разбивка премии</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Брутто-премия:</span>
                    <span className="font-semibold">{formatCurrency(policy.premium, policy.premiumCurrency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Нетто-премия:</span>
                    <span className="font-semibold">{formatCurrency(policy.netPremium, policy.premiumCurrency)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-gray-600">Комиссия:</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency((policy.premium || 0) - (policy.netPremium || 0), policy.premiumCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Эффективная ставка:</span>
                    <span className="font-semibold text-green-600">{policy.rate}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="p-6">
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Документы</h3>
                <p className="text-gray-500 mb-6">
                  Здесь будут отображаться документы, связанные с полисом
                </p>
                <div className="flex justify-center gap-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Download size={16} />
                    Загрузить документ
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                    <FileText size={16} />
                    Создать документ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Последнее обновление: {formatDate(policy.creationDate)}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
              {onEdit && (
                <button
                  onClick={() => onEdit(policy)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit size={16} />
                  Редактировать
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyViewModal;