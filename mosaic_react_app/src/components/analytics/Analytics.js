import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Users, DollarSign, Calendar, Target } from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ComposedChart } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

const Analytics = ({ clients, policies, loading }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('12m');
  const [selectedMetric, setSelectedMetric] = useState('premium');

  // Calculate comprehensive analytics
  const analyticsData = useMemo(() => {
    if (policies.length === 0 || clients.length === 0) {
      return {
        totalPremium: 0,
        avgPremium: 0,
        avgRate: 0,
        renewalRate: 0,
        avgProcessingTime: 0,
        growthRate: 0,
        industryData: [],
        regionData: [],
        underwriterData: [],
        monthlyTrends: [],
        clientStatusData: [],
        policyStatusData: []
      };
    }

    const totalPremium = policies.reduce((sum, p) => sum + (p.premium || 0), 0);
    const totalRate = policies.reduce((sum, p) => sum + (p.rate || 0), 0);
    const activeOrPendingPolicies = policies.filter(p => p.status === 'active' || p.status === 'pending').length;

    // Industry analysis
    const industryMap = {};
    clients.forEach(client => {
      const clientPolicies = policies.filter(p => p.client === client.id);
      const industryPremium = clientPolicies.reduce((sum, p) => sum + (p.premium || 0), 0);
      
      if (industryMap[client.industry]) {
        industryMap[client.industry].value += industryPremium;
        industryMap[client.industry].policies += clientPolicies.length;
        industryMap[client.industry].clients += 1;
      } else {
        industryMap[client.industry] = {
          name: client.industry,
          value: industryPremium,
          policies: clientPolicies.length,
          clients: 1
        };
      }
    });

    // Region analysis
    const regionMap = {};
    clients.forEach(client => {
      const clientPolicies = policies.filter(p => p.client === client.id);
      const regionPremium = clientPolicies.reduce((sum, p) => sum + (p.premium || 0), 0);
      
      if (regionMap[client.region]) {
        regionMap[client.region] += regionPremium;
      } else {
        regionMap[client.region] = regionPremium;
      }
    });

    // Underwriter performance
    const underwriterMap = {};
    policies.forEach(policy => {
      if (!underwriterMap[policy.underwriter]) {
        underwriterMap[policy.underwriter] = { 
          name: policy.underwriter,
          policies: 0, 
          totalPremium: 0, 
          avgRate: 0,
          rateSum: 0
        };
      }
      underwriterMap[policy.underwriter].policies += 1;
      underwriterMap[policy.underwriter].totalPremium += policy.premium || 0;
      underwriterMap[policy.underwriter].rateSum += policy.rate || 0;
    });

    // Calculate average rates for underwriters
    Object.values(underwriterMap).forEach(uw => {
      uw.avgRate = uw.policies > 0 ? (uw.rateSum / uw.policies).toFixed(2) : 0;
      uw.avgPremium = uw.policies > 0 ? Math.round(uw.totalPremium / uw.policies) : 0;
    });

    // Monthly trends
    const monthlyMap = {};
    const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
    
    policies.forEach(policy => {
      const date = new Date(policy.creationDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = monthNames[date.getMonth()];
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthLabel,
          premium: 0,
          policies: 0,
          clients: new Set()
        };
      }
      
      monthlyMap[monthKey].premium += policy.premium || 0;
      monthlyMap[monthKey].policies += 1;
      monthlyMap[monthKey].clients.add(policy.client);
    });

    // Convert Sets to counts and sort by date
    const monthlyTrends = Object.keys(monthlyMap)
      .sort()
      .slice(-12) // Last 12 months
      .map(key => ({
        ...monthlyMap[key],
        clients: monthlyMap[key].clients.size,
        premium: Math.round(monthlyMap[key].premium / 1000) // Convert to thousands
      }));

    // Client status distribution
    const clientStatusMap = {};
    clients.forEach(client => {
      const status = client.clientStatus || 'unknown';
      clientStatusMap[status] = (clientStatusMap[status] || 0) + 1;
    });

    // Policy status distribution
    const policyStatusMap = {};
    policies.forEach(policy => {
      const status = policy.status || 'unknown';
      policyStatusMap[status] = (policyStatusMap[status] || 0) + 1;
    });

    // Growth rate calculation (mock)
    const currentMonthPremium = monthlyTrends[monthlyTrends.length - 1]?.premium || 0;
    const previousMonthPremium = monthlyTrends[monthlyTrends.length - 2]?.premium || 0;
    const growthRate = previousMonthPremium > 0 
      ? ((currentMonthPremium - previousMonthPremium) / previousMonthPremium * 100).toFixed(1)
      : 0;

    return {
      totalPremium,
      avgPremium: policies.length > 0 ? totalPremium / policies.length : 0,
      avgRate: policies.length > 0 ? totalRate / policies.length : 0,
      renewalRate: policies.length > 0 ? (activeOrPendingPolicies / policies.length) * 100 : 0,
      avgProcessingTime: 18, // Mock data
      growthRate: parseFloat(growthRate),
      industryData: Object.values(industryMap).sort((a, b) => b.value - a.value),
      regionData: Object.entries(regionMap).map(([name, premium]) => ({ 
        name, 
        premium: Math.round(premium / 1000) 
      })).sort((a, b) => b.premium - a.premium),
      underwriterData: Object.values(underwriterMap).sort((a, b) => b.totalPremium - a.totalPremium),
      monthlyTrends,
      clientStatusData: Object.entries(clientStatusMap).map(([name, value]) => ({ name, value })),
      policyStatusData: Object.entries(policyStatusMap).map(([name, value]) => ({ name, value }))
    };
  }, [policies, clients, selectedPeriod]);

  const formatCurrency = (amount, short = true) => {
    if (!amount) return '0';
    if (short) {
      if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `${Math.round(amount / 1000)}k`;
    }
    return amount.toLocaleString();
  };

  const StatCard = ({ icon: Icon, title, value, change, trend, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600", 
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
      red: "bg-red-100 text-red-600"
    };

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
              {trend === 'up' && <TrendingUp size={16} />}
              {trend === 'down' && <TrendingDown size={16} />}
              <span className="text-sm font-medium">{change}%</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Аналитика</h1>
          <p className="text-gray-600 mt-1">Детальный анализ портфеля и производительности</p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">Весь период</option>
            <option value="12m">Последние 12 месяцев</option>
            <option value="6m">Последние 6 месяцев</option>
            <option value="ytd">С начала года</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Средняя премия"
          value={`${formatCurrency(analyticsData.avgPremium)} UZS`}
          change={analyticsData.growthRate}
          trend={analyticsData.growthRate > 0 ? 'up' : analyticsData.growthRate < 0 ? 'down' : 'neutral'}
          color="green"
        />
        
        <StatCard
          icon={Target}
          title="Средняя ставка"
          value={`${analyticsData.avgRate.toFixed(2)}%`}
          color="blue"
        />
        
        <StatCard
          icon={TrendingUp}
          title="Коэффициент обновления"
          value={`${analyticsData.renewalRate.toFixed(0)}%`}
          color="purple"
        />
        
        <StatCard
          icon={Calendar}
          title="Средний срок оформления"
          value={`${analyticsData.avgProcessingTime} дней`}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Industry Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            Распределение по отраслям
          </h3>
          {analyticsData.industryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie 
                  data={analyticsData.industryData} 
                  cx="50%" 
                  cy="50%" 
                  labelLine={false}
                  outerRadius={100} 
                  fill="#8884d8" 
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.industryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${formatCurrency(value * 1000)} UZS`, 'Премия']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Нет данных для отображения</p>
              </div>
            </div>
          )}
        </div>

        {/* Regional Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Топ регионы по премиям
          </h3>
          {analyticsData.regionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.regionData.slice(0, 8)} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}k`} />
                <Tooltip formatter={(value) => [`${value * 1000} UZS`, 'Премия']} />
                <Bar dataKey="premium" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Нет данных для отображения</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Месячная динамика
        </h3>
        {analyticsData.monthlyTrends.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={analyticsData.monthlyTrends} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Премия') return [`${value * 1000} UZS`, name];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="premium" fill="#8b5cf6" name="Премия (тыс)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="policies" stroke="#f59e0b" strokeWidth={3} name="Полисов" />
              <Line yAxisId="right" type="monotone" dataKey="clients" stroke="#06b6d4" strokeWidth={3} name="Клиентов" />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Нет данных для отображения трендов</p>
            </div>
          </div>
        )}
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Underwriter Performance */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Эффективность андеррайтеров
            </h3>
          </div>
          {analyticsData.underwriterData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Андеррайтер</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Полисов</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Общая премия</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Средняя ставка</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analyticsData.underwriterData.slice(0, 8).map((uw, index) => (
                    <tr key={uw.name || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{uw.name || 'Не указан'}</td>
                      <td className="px-6 py-4 text-gray-700">{uw.policies}</td>
                      <td className="px-6 py-4 text-gray-700">{formatCurrency(uw.totalPremium)} UZS</td>
                      <td className="px-6 py-4 text-gray-700">{uw.avgRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Нет данных об андеррайтерах</p>
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Распределение статусов
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Policy Status */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Статусы полисов</h4>
              <div className="space-y-2">
                {analyticsData.policyStatusData.map((item, index) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-sm text-gray-700 capitalize">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Status */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Статусы клиентов</h4>
              <div className="space-y-2">
                {analyticsData.clientStatusData.map((item, index) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: CHART_COLORS[(index + 3) % CHART_COLORS.length] }}
                      />
                      <span className="text-sm text-gray-700 capitalize">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Ключевые выводы
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-blue-800">
          <div className="bg-white/60 p-3 rounded-lg">
            <div className="font-medium">Общая премия портфеля</div>
            <div className="text-lg font-bold text-blue-900">{formatCurrency(analyticsData.totalPremium)} UZS</div>
          </div>
          <div className="bg-white/60 p-3 rounded-lg">
            <div className="font-medium">Лидирующая отрасль</div>
            <div className="text-lg font-bold text-blue-900">
              {analyticsData.industryData[0]?.name || 'Нет данных'}
            </div>
          </div>
          <div className="bg-white/60 p-3 rounded-lg">
            <div className="font-medium">Рост за месяц</div>
            <div className={`text-lg font-bold ${analyticsData.growthRate >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {analyticsData.growthRate > 0 ? '+' : ''}{analyticsData.growthRate}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;