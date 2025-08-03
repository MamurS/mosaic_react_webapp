import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Users,
  Building,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import ClientSearch from '../common/ClientSearch';
import { 
  STATUS_COLORS, 
  formatCurrency, 
  formatDate, 
  CLIENT_STATUS_OPTIONS 
} from '../../utils/constants';

const Clients = ({ 
  clients = [], 
  onCreateNew, 
  onEditClient, 
  onDeleteClient, 
  onRefresh 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedClients, setSelectedClients] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Safe filtering and sorting
  const filteredAndSortedClients = useMemo(() => {
    if (!Array.isArray(clients)) return [];

    let filtered = clients.filter(client => {
      if (!client) return false;

      // Search filter
      const searchMatch = !searchTerm?.trim() || 
        (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.inn && client.inn.includes(searchTerm)) ||
        (client.legalName && client.legalName.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter - FIXED: Use camelCase field name
      const statusMatch = !statusFilter || client.clientStatus === statusFilter;

      // Industry filter
      const industryMatch = !industryFilter || client.industry === industryFilter;

      return searchMatch && statusMatch && industryMatch;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';

      if (sortBy === 'date') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [clients, searchTerm, statusFilter, industryFilter, sortBy, sortOrder]);

  // Statistics - FIXED: Use camelCase field name
  const statistics = useMemo(() => {
    if (!Array.isArray(clients)) {
      return { total: 0, new: 0, active: 0, vip: 0, inactive: 0 };
    }

    return clients.reduce((acc, client) => {
      if (!client) return acc;
      
      acc.total += 1;
      if (client.clientStatus === 'new') acc.new += 1;
      else if (client.clientStatus === 'active') acc.active += 1;
      else if (client.clientStatus === 'vip') acc.vip += 1;
      else if (client.clientStatus === 'inactive') acc.inactive += 1;
      
      return acc;
    }, { total: 0, new: 0, active: 0, vip: 0, inactive: 0 });
  }, [clients]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value || '');
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleSelectClient = (clientId) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClients.length === filteredAndSortedClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredAndSortedClients.map(c => c?.id).filter(Boolean));
    }
  };

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || STATUS_COLORS.new;
  };

  const getStatusLabel = (status) => {
    const option = CLIENT_STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.label || status || 'Неизвестно';
  };

  const safeFormatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      return formatDate(dateString);
    } catch (error) {
      return 'Неверная дата';
    }
  };

  const safeFormatCurrency = (amount, currency = 'UZS') => {
    if (amount === undefined || amount === null) return '0';
    try {
      return formatCurrency(amount, currency);
    } catch (error) {
      return `${amount || 0} ${currency}`;
    }
  };

  const uniqueIndustries = [...new Set(clients.map(c => c?.industry).filter(Boolean))];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header - Only one title, no buttons here */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">База клиентов</h1>
        <p className="text-gray-600 mt-1">
          Всего клиентов: {statistics.total} | Отфильтровано: {filteredAndSortedClients.length}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search - Use regular input, not ClientSearch for the main search */}
            <div className="flex-1">
              <div className="search-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Поиск клиента по названию, ИНН..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
              </div>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Фильтры</span>
            </button>

            {/* Export */}
            <button className="btn-outline flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Экспорт</span>
            </button>

            {/* Only One Create Button - Top Right */}
            <button
              onClick={onCreateNew}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Новый клиент</span>
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="form-label">Статус</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="">Все статусы</option>
                  {CLIENT_STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Industry Filter */}
              <div>
                <label className="form-label">Отрасль</label>
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="">Все отрасли</option>
                  {uniqueIndustries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clients Table */}
      <div className="card">
        <div className="card-body p-0">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={
                    filteredAndSortedClients.length > 0 &&
                    selectedClients.length === filteredAndSortedClients.length
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">
                  {selectedClients.length > 0
                    ? `Выбрано ${selectedClients.length} из ${filteredAndSortedClients.length}`
                    : `Всего ${filteredAndSortedClients.length} клиентов`}
                </span>
              </div>

              {selectedClients.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button className="btn-outline text-sm">
                    Экспорт выбранных
                  </button>
                  <button className="btn-outline text-sm text-red-600 border-red-300 hover:bg-red-50">
                    Удалить выбранных
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="table-header-cell cursor-pointer" onClick={() => handleSort('name')}>
                    Название
                  </th>
                  <th className="table-header-cell cursor-pointer" onClick={() => handleSort('inn')}>
                    ИНН
                  </th>
                  <th className="table-header-cell cursor-pointer" onClick={() => handleSort('industry')}>
                    Отрасль
                  </th>
                  <th className="table-header-cell cursor-pointer" onClick={() => handleSort('clientStatus')}>
                    Статус
                  </th>
                  <th className="table-header-cell cursor-pointer" onClick={() => handleSort('date')}>
                    Дата регистрации
                  </th>
                  <th className="table-header-cell">Действия</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredAndSortedClients.map((client) => (
                  <tr key={client?.id} className="table-row">
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client?.id)}
                        onChange={() => handleSelectClient(client?.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {client?.name || 'Без названия'}
                          </div>
                          {client?.legalName && (
                            <div className="text-sm text-gray-500">
                              {client.legalName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="font-mono text-sm">
                        {client?.inn || 'Не указан'}
                      </div>
                    </td>
                    <td className="table-cell">
                      {client?.industry || 'Не указана'}
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${getStatusColor(client?.clientStatus)}`}>
                        {getStatusLabel(client?.clientStatus)}
                      </span>
                    </td>
                    <td className="table-cell">
                      {safeFormatDate(client?.date)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEditClient && onEditClient(client)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Редактировать"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteClient && onDeleteClient(client?.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredAndSortedClients.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {clients.length === 0 ? 'Нет клиентов' : 'Клиенты не найдены'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter || industryFilter
                  ? 'Попробуйте изменить критерии поиска или фильтры'
                  : 'Добавьте первого клиента для начала работы'}
              </p>
              {!searchTerm && !statusFilter && !industryFilter && clients.length === 0 && (
                <button
                  onClick={onCreateNew}
                  className="btn-primary"
                >
                  Создать первого клиента
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clients;