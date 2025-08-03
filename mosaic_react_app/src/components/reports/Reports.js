import React, { useState, useMemo } from 'react';
import { Download, FileText, Calendar, Filter, BarChart3, PieChart, TrendingUp, Users } from 'lucide-react';
import { REPORT_TYPES } from '../../utils/constants';

const Reports = ({ policies, clients, loading, authToken, API_URL }) => {
  const [selectedReport, setSelectedReport] = useState('financial');
  const [reportParams, setReportParams] = useState({});
  const [reportData, setReportData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setReportParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormComplete = () => {
    switch (selectedReport) {
      case 'financial':
        return reportParams.startDate && reportParams.endDate;
      case 'portfolio_analysis':
        return reportParams.groupBy && reportParams.format;
      case 'portfolio_reserves':
        return reportParams.period && reportParams.currency;
      case 'expiring_policies':
        return reportParams.warningPeriod;
      case 'client_summary':
        return reportParams.clientStatus;
      case 'premium_analysis':
        return reportParams.analysisType && reportParams.period;
      default:
        return false;
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    
    try {
      // Simulate API call for report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock report data based on actual policies and clients
      const mockReportData = generateMockReportData(selectedReport, reportParams);
      setReportData(mockReportData);
      setPreviewMode(true);
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateMockReportData = (reportType, params) => {
    const now = new Date();
    
    switch (reportType) {
      case 'financial':
        return {
          title: `Финансовый отчет за период ${params.startDate} - ${params.endDate}`,
          type: 'financial',
          generatedAt: now.toISOString(),
          summary: {
            'Всего полисов': policies.length,
            'Общая премия': `${policies.reduce((sum, p) => sum + (p.premium || 0), 0).toLocaleString()} UZS`,
            'Средняя премия': `${Math.round(policies.reduce((sum, p) => sum + (p.premium || 0), 0) / Math.max(policies.length, 1)).toLocaleString()} UZS`,
            'Активных полисов': policies.filter(p => p.status === 'active').length
          },
          data: policies.slice(0, 10),
          chartData: generateChartData('financial', policies)
        };
        
      case 'portfolio_analysis':
        return {
          title: `Анализ портфеля по ${params.groupBy === 'По отраслям' ? 'отраслям' : 'регионам'}`,
          type: 'portfolio',
          generatedAt: now.toISOString(),
          summary: {
            'Уникальных клиентов': clients.length,
            'Общая страховая сумма': `${policies.reduce((sum, p) => sum + (p.insuranceAmount || 0), 0).toLocaleString()} UZS`,
            'Средний размер полиса': `${Math.round(policies.reduce((sum, p) => sum + (p.insuranceAmount || 0), 0) / Math.max(policies.length, 1)).toLocaleString()} UZS`
          },
          data: generatePortfolioAnalysis(params.groupBy, clients, policies),
          chartData: generateChartData('portfolio', policies, clients)
        };
        
      case 'expiring_policies':
        const daysAhead = parseInt(params.warningPeriod);
        const expiringPolicies = policies.filter(p => {
          // Mock logic for expiring policies
          return Math.random() < 0.3; // 30% chance to be "expiring"
        });
        
        return {
          title: `Истекающие полисы в течение ${daysAhead} дней`,
          type: 'expiring',
          generatedAt: now.toISOString(),
          summary: {
            'Истекающих полисов': expiringPolicies.length,
            'Требует внимания': Math.floor(expiringPolicies.length * 0.7),
            'Общая премия под риском': `${expiringPolicies.reduce((sum, p) => sum + (p.premium || 0), 0).toLocaleString()} UZS`
          },
          data: expiringPolicies.slice(0, 15),
          warningDays: daysAhead
        };
        
      default:
        return {
          title: `Отчет: ${selectedReport}`,
          type: 'generic',
          generatedAt: now.toISOString(),
          summary: {
            'Всего записей': policies.length + clients.length,
            'Полисов': policies.length,
            'Клиентов': clients.length
          },
          data: [...policies.slice(0, 5), ...clients.slice(0, 5)]
        };
    }
  };

  const generatePortfolioAnalysis = (groupBy, clients, policies) => {
    if (groupBy === 'По отраслям') {
      const industryMap = {};
      clients.forEach(client => {
        const clientPolicies = policies.filter(p => p.client === client.id);
        const totalPremium = clientPolicies.reduce((sum, p) => sum + (p.premium || 0), 0);
        
        if (industryMap[client.industry]) {
          industryMap[client.industry].clients += 1;
          industryMap[client.industry].policies += clientPolicies.length;
          industryMap[client.industry].premium += totalPremium;
        } else {
          industryMap[client.industry] = {
            industry: client.industry,
            clients: 1,
            policies: clientPolicies.length,
            premium: totalPremium
          };
        }
      });
      return Object.values(industryMap);
    }
    
    return clients.slice(0, 10).map(client => ({
      name: client.name,
      region: client.region,
      policies: policies.filter(p => p.client === client.id).length,
      premium: policies.filter(p => p.client === client.id).reduce((sum, p) => sum + (p.premium || 0), 0)
    }));
  };

  const generateChartData = (type, policies, clients = []) => {
    if (type === 'financial') {
      const monthlyData = {};
      policies.forEach(policy => {
        const date = new Date(policy.creationDate);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey] += policy.premium || 0;
        } else {
          monthlyData[monthKey] = policy.premium || 0;
        }
      });
      
      return Object.entries(monthlyData).map(([month, premium]) => ({
        month: month.split('-')[1] + '/' + month.split('-')[0],
        premium: premium / 1000 // Convert to thousands
      }));
    }
    
    return [];
  };

  const renderReportForm = () => {
    switch (selectedReport) {
      case 'financial':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата с</label>
              <input
                type="date"
                name="startDate"
                value={reportParams.startDate || ''}
                onChange={handleParamChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата по</label>
              <input
                type="date"
                name="endDate"
                value={reportParams.endDate || ''}
                onChange={handleParamChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );
        
      case 'portfolio_analysis':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Группировка</label>
              <select
                name="groupBy"
                value={reportParams.groupBy || ''}
                onChange={handleParamChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Выбрать --</option>
                <option value="По отраслям">По отраслям</option>
                <option value="По регионам">По регионам</option>
                <option value="По статусу">По статусу клиента</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Формат</label>
              <select
                name="format"
                value={reportParams.format || ''}
                onChange={handleParamChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Выбрать --</option>
                <option value="Excel">Excel</option>
                <option value="PDF">PDF</option>
                <option value="CSV">CSV</option>
              </select>
            </div>
          </div>
        );
        
      case 'portfolio_reserves':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Период</label>
              <select
                name="period"
                value={reportParams.period || ''}
                onChange={handleParamChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Выбрать --</option>
                <option value="current_month">Текущий месяц</option>
                <option value="current_quarter">Текущий квартал</option>
                <option value="current_year">Текущий год</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Валюта</label>
              <select
                name="currency"
                value={reportParams.currency || ''}
                onChange={handleParamChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Выбрать --</option>
                <option value="UZS">UZS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        );
        
      case 'expiring_policies':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Период предупреждения</label>
            <select
              name="warningPeriod"
              value={reportParams.warningPeriod || ''}
              onChange={handleParamChange}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Выбрать --</option>
              <option value="30">30 дней</option>
              <option value="60">60 дней</option>
              <option value="90">90 дней</option>
            </select>
          </div>
        );
        
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Параметры для данного типа отчета не требуются</p>
          </div>
        );
    }
  };

  const exportReport = (format) => {
    if (!reportData) return;
    
    console.log(`Exporting report in ${format} format:`, reportData);
    // Implement actual export functionality here
    alert(`Отчет экспортирован в формате ${format}`);
  };

  if (previewMode && reportData) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Preview Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Предварительный просмотр отчета</h1>
            <p className="text-gray-600 mt-1">{reportData.title}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPreviewMode(false)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Назад к настройкам
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => exportReport('PDF')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                PDF
              </button>
              <button
                onClick={() => exportReport('Excel')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Report Header */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{reportData.title}</h2>
              <div className="text-sm text-gray-500">
                Сгенерирован: {new Date(reportData.generatedAt).toLocaleString('ru-RU')}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold mb-4">Сводка</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(reportData.summary).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">{key}</div>
                  <div className="text-xl font-bold text-gray-800">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Data */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Детальные данные</h3>
            {reportData.type === 'portfolio' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {reportParams.groupBy === 'По отраслям' ? 'Отрасль' : 'Название'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиентов</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Полисов</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Премия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.data.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 font-medium">{item.industry || item.name}</td>
                        <td className="px-4 py-3">{item.clients || 1}</td>
                        <td className="px-4 py-3">{item.policies}</td>
                        <td className="px-4 py-3">{item.premium?.toLocaleString()} UZS</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">№</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Премия</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                      {reportData.type === 'expiring' && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата истечения</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.data.map((item, index) => (
                      <tr key={item.id || index}>
                        <td className="px-4 py-3">{item.id ? String(item.id).padStart(3, '0') : index + 1}</td>
                        <td className="px-4 py-3 font-medium">{item.clientName || item.name || 'N/A'}</td>
                        <td className="px-4 py-3">{item.premium?.toLocaleString() || 'N/A'} UZS</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status || item.clientStatus || 'N/A'}
                          </span>
                        </td>
                        {reportData.type === 'expiring' && (
                          <td className="px-4 py-3 text-red-600 font-medium">
                            {Math.floor(Math.random() * reportData.warningDays)} дней
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Отчеты</h1>
          <p className="text-gray-600 mt-1">Генерация и экспорт отчетов по полисам и клиентам</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Данных для отчетов: {policies.length} полисов, {clients.length} клиентов
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{policies.length}</div>
              <div className="text-sm text-gray-600">Полисов в системе</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{clients.length}</div>
              <div className="text-sm text-gray-600">Клиентов в базе</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {policies.reduce((sum, p) => sum + (p.premium || 0), 0) >= 1000000 
                  ? `${Math.round(policies.reduce((sum, p) => sum + (p.premium || 0), 0) / 1000000)}M`
                  : `${Math.round(policies.reduce((sum, p) => sum + (p.premium || 0), 0) / 1000)}k`
                }
              </div>
              <div className="text-sm text-gray-600">Общая премия</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <PieChart className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {policies.filter(p => p.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Активных полисов</div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white p-8 rounded-xl shadow-sm border space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Настройка отчета</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Выберите тип отчета</label>
          <select
            value={selectedReport}
            onChange={(e) => {
              setSelectedReport(e.target.value);
              setReportData(null);
              setReportParams({});
            }}
            className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {REPORT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Dynamic Form Based on Report Type */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Параметры отчета</h3>
          {renderReportForm()}
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            onClick={handleGenerateReport}
            disabled={!isFormComplete() || generating}
            className="px-8 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Генерация отчета...
              </>
            ) : (
              <>
                <BarChart3 size={18} />
                Сгенерировать отчет
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;