import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line } from 'recharts';

const Dashboard = ({
  clients,
  policies,
  onClientSelect,
  onCreateClient,
  handleNavigateToPolicies,
  handleNavigateToMonthlyPremiums,
  authToken,
  API_URL
}) => {
  const [graphPeriod, setGraphPeriod] = useState('12m');

  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    const activePoliciesCount = policies.filter(p => p.status === 'active').length;
    const totalInsuranceAmount = policies.reduce((sum, p) => sum + (p.insuranceAmount || 0), 0);
    const activeClientsCount = clients.filter(c => c.clientStatus === 'active').length;
    
    // Calculate current month premium
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyPremium = policies.reduce((sum, p) => {
      const policyDate = new Date(p.creationDate);
      if (policyDate.getMonth() === currentMonth && policyDate.getFullYear() === currentYear) {
        return sum + (p.premium || 0);
      }
      return sum;
    }, 0);

    return {
      activePoliciesCount,
      totalInsuranceAmount,
      activeClientsCount,
      monthlyPremium
    };
  }, [policies, clients]);

  // Generate premium dynamics data for chart
  const premiumDynamicsData = useMemo(() => {
    const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
    const today = new Date();
    
    let filteredPolicies = policies;

    // Filter policies based on selected period
    if (graphPeriod !== 'all') {
      const monthsToInclude = graphPeriod === '12m' ? 12 : (graphPeriod === '6m' ? 6 : today.getMonth() + 1);
      const startDate = new Date(today);
      if (graphPeriod !== 'ytd') {
        startDate.setMonth(today.getMonth() - monthsToInclude + 1);
      } else {
        startDate.setMonth(0);
      }
      startDate.setDate(1);

      filteredPolicies = policies.filter(p => {
        const policyDate = new Date(p.creationDate);
        return policyDate >= startDate && policyDate <= today;
      });
    }

    // Group by month
    const dataMap = {};
    filteredPolicies.forEach(policy => {
      const policyDate = new Date(policy.creationDate);
      const key = `${policyDate.getFullYear()}-${monthNames[policyDate.getMonth()]}`;
      if (!dataMap[key]) {
        dataMap[key] = { gross: 0, net: 0 };
      }
      dataMap[key].gross += policy.premium || 0;
      dataMap[key].net += policy.netPremium || 0;
    });
    
    // Sort by date and format for chart
    const sortedKeys = Object.keys(dataMap).sort((a, b) => {
      const [yearA, monthA] = a.split('-');
      const [yearB, monthB] = b.split('-');
      return new Date(`${monthA} 1, ${yearA}`).getTime() - new Date(`${monthB} 1, ${yearB}`).getTime();
    });

    return sortedKeys.map(key => ({
      name: key.split('-')[1],
      "Брутто-премия": Math.round(dataMap[key].gross / 1000), // Convert to thousands
      "Нетто-премия": Math.round(dataMap[key].net / 1000),
    }));
  }, [policies, graphPeriod]);

  // Get recent policies
  const recentPolicies = useMemo(() => {
    const clientMap = new Map(clients.map(c => [c.id, c.name]));
    return [...policies]
      .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
      .slice(0, 3)
      .map(policy => ({
        ...policy,
        clientName: clientMap.get(policy.client) || 'Неизвестный клиент'
      }));
  }, [policies, clients]);

  const formatCurrency = (amount, currency = 'UZS') => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ${currency}`;
    } else if (amount >= 1000) {
      return `${Math.round(amount / 1000)}k ${currency}`;
    }
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const handleNewPolicyClick = () => {
    // This should be handled by parent component
    console.log('New policy button clicked - should open policy form');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => handleNavigateToPolicies('active')}
          className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all transform"
        >
          <div className="text-3xl font-bold text-gray-800">
            {dashboardStats.activePoliciesCount}
          </div>
          <div className="text-gray-600 text-sm mt-2">Активных полисов</div>
          <div className="text-green-600 text-xs mt-1">↗ Активные</div>
        </div>

        <div
          onClick={() => handleNavigateToPolicies('all')}
          className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all transform"
        >
          <div className="text-3xl font-bold text-gray-800">
            {formatCurrency(dashboardStats.totalInsuranceAmount)}
          </div>
          <div className="text-gray-600 text-sm mt-2">Общая страховая сумма</div>
          <div className="text-blue-600 text-xs mt-1">📊 Портфель</div>
        </div>

        <div
          onClick={handleNavigateToMonthlyPremiums}
          className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all transform"
        >
          <div className="text-3xl font-bold text-gray-800">
            {formatCurrency(dashboardStats.monthlyPremium)}
          </div>
          <div className="text-gray-600 text-sm mt-2">Премии за месяц</div>
          <div className="text-purple-600 text-xs mt-1">📅 Текущий период</div>
        </div>

        <div
          onClick={() => console.log('Navigate to clients')}
          className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all transform"
        >
          <div className="text-3xl font-bold text-gray-800">
            {dashboardStats.activeClientsCount}
          </div>
          <div className="text-gray-600 text-sm mt-2">Активных клиентов</div>
          <div className="text-orange-600 text-xs mt-1">👥 База клиентов</div>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Premium Dynamics Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Динамика премий</h3>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'all', label: 'Весь' },
                { key: '12m', label: '12 мес' },
                { key: '6m', label: '6 мес' },
                { key: 'ytd', label: 'СНГ' }
              ].map(period => (
                <button
                  key={period.key}
                  onClick={() => setGraphPeriod(period.key)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    graphPeriod === period.key
                      ? 'bg-white shadow text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {premiumDynamicsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart 
                data={premiumDynamicsData} 
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(value) => `${value}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value, name) => [`${(value * 1000).toLocaleString()} UZS`, name]}
                  cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="Брутто-премия" 
                  fill="#1e40af" 
                  radius={[4, 4, 0, 0]}
                  name="Брутто-премия"
                />
                <Line 
                  type="monotone" 
                  dataKey="Нетто-премия" 
                  stroke="#16a34a" 
                  strokeWidth={2}
                  name="Нетто-премия"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <div>Нет данных для отображения</div>
                <div className="text-sm mt-1">Создайте полисы для просмотра статистики</div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Policies */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Последние полисы</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentPolicies.length > 0 ? (
              recentPolicies.map(policy => (
                <div key={policy.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 truncate">
                        {policy.clientName}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDate(policy.creationDate)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        #{String(policy.id).padStart(3, '0')}
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-green-600 font-semibold">
                        {formatCurrency(policy.premium, policy.premiumCurrency)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                        policy.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {policy.status === 'active' ? 'Активен' : 'Ожидает'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <div className="font-medium">Нет полисов</div>
                <div className="text-sm mt-1">Создайте первый полис</div>
              </div>
            )}
          </div>
          
          {recentPolicies.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => handleNavigateToPolicies('all')}
                className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Посмотреть все полисы →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleNewPolicyClick}
            className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Создать полис
          </button>
          
          <button
            onClick={() => console.log('Add client')}
            className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Добавить клиента
          </button>
          
          <button
            onClick={() => console.log('Generate report')}
            className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            📊 Сгенерировать отчет
          </button>
          
          <button
            onClick={() => console.log('Export data')}
            className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            📤 Экспорт данных
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;