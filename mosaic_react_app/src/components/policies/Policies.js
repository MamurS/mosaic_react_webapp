import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Edit,
  Trash2,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle
} from 'lucide-react';
import {
  STATUS_COLORS,
  formatCurrency,
  formatDate,
  POLICY_STATUS_OPTIONS
} from '../../utils/constants';

const Policies = ({
  policies = [],
  clients = [],
  onCreateNew,
  onEditPolicy,
  onDeletePolicy,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [sortBy, setSortBy] = useState('creationDate'); // Updated
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [policyDateFilter, setPolicyDateFilter] = useState({ month: '', year: '' });

  // Safe filtering and sorting
  const filteredAndSortedPolicies = useMemo(() => {
    if (!Array.isArray(policies)) return [];

    let filtered = policies.filter(policy => {
      if (!policy) return false;

      // Search filter - safely handle undefined values
      const searchMatch = !searchTerm?.trim() ||
        (policy.id && policy.id.toString().includes(searchTerm)) ||
        (policy.clientName && policy.clientName.toLowerCase().includes(searchTerm.toLowerCase())) || // Updated
        (policy.coverageType && policy.coverageType.toLowerCase().includes(searchTerm.toLowerCase())) || // Updated
        (policy.underwriter && policy.underwriter.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const statusMatch = !statusFilter || policy.status === statusFilter;

      // Client filter
      const clientMatch = !clientFilter || policy.client === parseInt(clientFilter);

      // Date filter - safely handle date
      let dateMatch = true;
      if (policyDateFilter.year || policyDateFilter.month) {
        if (policy.creationDate) { // Updated
          const policyDate = new Date(policy.creationDate); // Updated
          dateMatch = (!policyDateFilter.year || policyDate.getFullYear() === parseInt(policyDateFilter.year)) &&
                      (!policyDateFilter.month || policyDate.getMonth() === parseInt(policyDateFilter.month));
        } else {
          dateMatch = false;
        }
      }

      return searchMatch && statusMatch && clientMatch && dateMatch;
    });

    // Sorting - safely handle undefined values
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle undefined values
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      // Handle different data types
      if (sortBy === 'creationDate') { // Updated
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [policies, searchTerm, statusFilter, clientFilter, sortBy, sortOrder, policyDateFilter]);

  // Safe statistics calculation
  const statistics = useMemo(() => {
    if (!Array.isArray(policies)) {
      return {
        total: 0,
        active: 0,
        pending: 0,
        expired: 0,
        totalPremium: 0
      };
    }

    const stats = policies.reduce((acc, policy) => {
      if (!policy) return acc;

      acc.total += 1;

      if (policy.status === 'active') acc.active += 1;
      else if (policy.status === 'pending') acc.pending += 1;
      else if (policy.status === 'expired') acc.expired += 1;

      acc.totalPremium += policy.premium || 0;

      return acc;
    }, {
      total: 0,
      active: 0,
      pending: 0,
      expired: 0,
      totalPremium: 0
    });

    return stats;
  }, [policies]);

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

  const handleSelectPolicy = (policyId) => {
    setSelectedPolicies(prev =>
      prev.includes(policyId)
        ? prev.filter(id => id !== policyId)
        : [...prev, policyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPolicies.length === filteredAndSortedPolicies.length) {
      setSelectedPolicies([]);
    } else {
      setSelectedPolicies(filteredAndSortedPolicies.map(p => p?.id).filter(Boolean));
    }
  };

  const clearDateFilter = () => {
    setPolicyDateFilter({ month: '', year: '' });
  };

  // Safe helper functions
  const getClientName = (clientId) => {
    if (!clientId || !Array.isArray(clients)) return 'Неизвестный клиент';
    const client = clients.find(c => c?.id === clientId);
    return client?.name || 'Неизвестный клиент';
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

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || STATUS_COLORS.pending;
  };

  const getStatusLabel = (status) => {
    const option = POLICY_STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.label || status || 'Неизвестно';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Портфель</h1>
          <p className="text-gray-600 mt-1">
            Создание, редактирование и отслеживание страховых полисов
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Новый полис</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="stats-card-icon">
            <FileText className="h-6 w-6" />
          </div>
          <div className="stats-card-value">{statistics.total}</div>
          <div className="stats-card-label">Всего полисов</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-icon bg-green-100 text-green-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="stats-card-value">{statistics.active}</div>
          <div className="stats-card-label">Активных</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-icon bg-yellow-100 text-yellow-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="stats-card-value">{statistics.pending}</div>
          <div className="stats-card-label">Ожидающих</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-icon bg-purple-100 text-purple-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="stats-card-value">
            {safeFormatCurrency(statistics.totalPremium)}
          </div>
          <div className="stats-card-label">Общая премия</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="search-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Поиск по номеру, клиенту, типу покрытия..."
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
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="form-label">Статус</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="">Все статусы</option>
                  {POLICY_STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Filter */}
              <div>
                <label className="form-label">Клиент</label>
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="">Все клиенты</option>
                  {clients.map(client => (
                    <option key={client?.id} value={client?.id}>
                      {client?.name || 'Безымянный клиент'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="form-label">Период</label>
                <div className="flex space-x-2">
                  <select
                    value={policyDateFilter.month}
                    onChange={(e) => setPolicyDateFilter(prev => ({ ...prev, month: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Месяц</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>
                        {new Date(2024, i).toLocaleString('ru', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  <select
                    value={policyDateFilter.year}
                    onChange={(e) => setPolicyDateFilter(prev => ({ ...prev, year: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Год</option>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {(policyDateFilter.month || policyDateFilter.year) && (
                  <button
                    onClick={clearDateFilter}
                    className="text-blue-600 hover:text-blue-800 text-sm mt-1"
                  >
                    Очистить
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Policies Table */}
      <div className="card">
        <div className="card-body p-0">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={
                    filteredAndSortedPolicies.length > 0 &&
                    selectedPolicies.length === filteredAndSortedPolicies.length
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">
                  {selectedPolicies.length > 0
                    ? `Выбрано ${selectedPolicies.length} из ${filteredAndSortedPolicies.length}`
                    : `Всего ${filteredAndSortedPolicies.length} полисов`}
                </span>
              </div>

              {selectedPolicies.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button className="btn-outline text-sm">
                    Экспорт выбранных
                  </button>
                  <button className="btn-outline text-sm text-red-600 border-red-300 hover:bg-red-50">
                    Удалить выбранные
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
                  <th className="table-header-cell cursor-pointer" onClick={() => handleSort('id')}>
                    № Полиса
                  </th>
                  <th className="table-header-cell cursor-pointer" onClick={() => handleSort('client')}>
                    Клиент
                  </th>
                  <th className="table-header-cell cursor-pointer" onClick={() => handleSort('coverageType')}>
                    Тип покрытия
                  </th>
                  <th className="table-header-cell cursor-pointer" onClick={() => handleSort('premium')}>
                    Премия
                  </th>
                  <th className="table-header-cell cursor-pointer" onClick={() => handleSort('status')}>
                    Статус
                  </th>
                  <th className="table-header-cell cursor-pointer" onClick={() => handleSort('creationDate')}>
                    Дата создания
                  </th>
                  <th className="table-header-cell">Действия</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredAndSortedPolicies.map((policy) => (
                  <tr key={policy?.id} className="table-row">
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={selectedPolicies.includes(policy?.id)}
                        onChange={() => handleSelectPolicy(policy?.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-blue-600">
                        #{String(policy?.id || 0).padStart(6, '0')}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">
                        {getClientName(policy?.client)}
                      </div>
                    </td>
                    <td className="table-cell">
                      {policy?.coverageType || 'Не указан'}
                    </td>
                    <td className="table-cell">
                      <div className="font-medium">
                        {safeFormatCurrency(policy?.premium, policy?.premiumCurrency)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${getStatusColor(policy?.status)}`}>
                        {getStatusLabel(policy?.status)}
                      </span>
                    </td>
                    <td className="table-cell">
                      {safeFormatDate(policy?.creationDate)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEditPolicy && onEditPolicy(policy)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Редактировать"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeletePolicy && onDeletePolicy(policy?.id)}
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
          {filteredAndSortedPolicies.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Полисы не найдены
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter || clientFilter
                  ? 'Попробуйте изменить критерии поиска или фильтры'
                  : 'Создайте первый полис для начала работы'}
              </p>
              {!searchTerm && !statusFilter && !clientFilter && (
                <button
                  onClick={onCreateNew}
                  className="btn-primary"
                >
                  Создать первый полис
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Policies;