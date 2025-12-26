import { useEffect, useState } from 'react';
import {
  FileBarChart,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Building2,
  Users,
  Leaf,
  DollarSign,
  ChevronDown,
  FileText,
  Table as TableIcon
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  getEmissionsReport,
  getFinancialReport,
  exportReport,
  downloadCSV,
  ReportFilters
} from '../services/adminApi';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

type ReportType = 'emissions' | 'financial' | 'companies' | 'b2c';

interface ReportTab {
  id: ReportType;
  label: string;
  icon: React.ElementType;
}

const reportTabs: ReportTab[] = [
  { id: 'emissions', label: 'Emisiones', icon: Leaf },
  { id: 'financial', label: 'Financiero', icon: DollarSign },
  { id: 'companies', label: 'Empresas', icon: Building2 },
  { id: 'b2c', label: 'Usuarios B2C', icon: Users },
];

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('emissions');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
  // Filtros
  const [period, setPeriod] = useState('30d');
  const [groupBy, setGroupBy] = useState('time');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showCustomDates, setShowCustomDates] = useState(false);

  useEffect(() => {
    loadReport();
  }, [activeTab, period, groupBy]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const filters: ReportFilters = {
        period,
        groupBy,
        dateFrom: showCustomDates && dateFrom ? dateFrom : undefined,
        dateTo: showCustomDates && dateTo ? dateTo : undefined
      };

      let data;
      switch (activeTab) {
        case 'emissions':
          data = await getEmissionsReport(filters);
          break;
        case 'financial':
          data = await getFinancialReport(filters);
          break;
        default:
          data = await getEmissionsReport(filters);
      }
      setReportData(data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setExporting(true);
    try {
      const response = await exportReport({
        reportType: activeTab,
        format,
        period,
        dateFrom: showCustomDates && dateFrom ? dateFrom : undefined,
        dateTo: showCustomDates && dateTo ? dateTo : undefined
      });

      if (format === 'csv' && response.data instanceof Blob) {
        downloadCSV(response.data, `reporte_${activeTab}_${Date.now()}.csv`);
      } else {
        console.log('Export result:', response.data);
        alert('Exportación completada. Ver consola para detalles.');
      }
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500">Genera y exporta reportes del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => {}}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exportando...' : 'Exportar'}
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 hidden group-hover:block">
              <button
                onClick={() => handleExport('csv')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <TableIcon className="w-4 h-4" />
                Exportar CSV
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileText className="w-4 h-4" />
                Exportar Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileBarChart className="w-4 h-4" />
                Exportar PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 overflow-x-auto">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                if (e.target.value !== 'custom') {
                  setShowCustomDates(false);
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="365d">Último año</option>
              <option value="ytd">Año actual</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-500">a</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => {
                  setShowCustomDates(true);
                  loadReport();
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Aplicar
              </button>
            </div>
          )}

          {(activeTab === 'emissions' || activeTab === 'financial') && (
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="time">Por Tiempo</option>
                <option value="company">Por Empresa</option>
                <option value="project">Por Proyecto</option>
                {activeTab === 'emissions' && <option value="type">Por Tipo</option>}
                {activeTab === 'financial' && <option value="source">Por Fuente</option>}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-80 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* Totales */}
          {reportData?.totals && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeTab === 'emissions' && (
                <>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Emisiones Totales</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {formatNumber(reportData.totals.totalEmissionsKg)} kg
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {reportData.totals.totalEmissionsTon} toneladas
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Certificados Emitidos</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">
                      {reportData.totals.totalCertificates}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Ingresos Totales</p>
                    <p className="text-3xl font-bold text-amber-600 mt-1">
                      {formatCurrency(reportData.totals.totalRevenueCLP)}
                    </p>
                  </div>
                </>
              )}
              
              {activeTab === 'financial' && (
                <>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Ingresos Totales (CLP)</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">
                      {formatCurrency(reportData.totals.totalRevenueCLP)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Ingresos Totales (USD)</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">
                      ${formatNumber(reportData.totals.totalRevenueUSD)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Transacciones</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">
                      {reportData.totals.totalTransactions}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Ticket Promedio</p>
                    <p className="text-3xl font-bold text-amber-600 mt-1">
                      {formatCurrency(reportData.totals.averageTransactionCLP)}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Gráfico Principal */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {activeTab === 'emissions' ? 'Emisiones por Período' : 
               activeTab === 'financial' ? 'Ingresos por Período' : 'Datos por Período'}
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {groupBy === 'time' ? (
                  <LineChart data={reportData?.report || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px' }}
                      formatter={(value: number, name: string) => [
                        activeTab === 'financial' ? formatCurrency(value) : `${formatNumber(value)} kg`,
                        name
                      ]}
                    />
                    {activeTab === 'emissions' ? (
                      <Line
                        type="monotone"
                        dataKey="emissionsKg"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        name="Emisiones"
                      />
                    ) : (
                      <Line
                        type="monotone"
                        dataKey="revenueCLP"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                        name="Ingresos"
                      />
                    )}
                  </LineChart>
                ) : (
                  <BarChart data={reportData?.report || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey={groupBy === 'company' ? 'companyName' : 
                               groupBy === 'project' ? 'projectName' : 
                               groupBy === 'type' ? 'type' :
                               groupBy === 'source' ? 'source' : 'name'}
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px' }}
                      formatter={(value: number) => [
                        activeTab === 'financial' ? formatCurrency(value) : `${formatNumber(value)} kg`,
                        ''
                      ]}
                    />
                    {activeTab === 'emissions' ? (
                      <Bar 
                        dataKey="totalEmissionsKg" 
                        fill="#10b981" 
                        radius={[4, 4, 0, 0]}
                      />
                    ) : (
                      <Bar 
                        dataKey="revenueCLP" 
                        fill="#f59e0b" 
                        radius={[4, 4, 0, 0]}
                      />
                    )}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla de Datos */}
          {reportData?.report && Array.isArray(reportData.report) && reportData.report.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Datos Detallados</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {groupBy === 'time' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                          {activeTab === 'emissions' ? (
                            <>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Emisiones (kg)</th>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Certificados</th>
                            </>
                          ) : (
                            <>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ingresos (CLP)</th>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Transacciones</th>
                            </>
                          )}
                        </>
                      )}
                      {groupBy === 'company' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Empresa</th>
                          {activeTab === 'emissions' ? (
                            <>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Emisiones (kg)</th>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Certificados</th>
                            </>
                          ) : (
                            <>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ingresos (CLP)</th>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Transacciones</th>
                            </>
                          )}
                        </>
                      )}
                      {groupBy === 'project' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Proyecto</th>
                          {activeTab === 'emissions' ? (
                            <>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Emisiones (kg)</th>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Certificados</th>
                            </>
                          ) : (
                            <>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ingresos (CLP)</th>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Transacciones</th>
                            </>
                          )}
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData.report.slice(0, 20).map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {groupBy === 'time' && (
                          <>
                            <td className="px-6 py-4 text-gray-900">
                              {item.date ? new Date(item.date).toLocaleDateString('es-CL') : '-'}
                            </td>
                            {activeTab === 'emissions' ? (
                              <>
                                <td className="px-6 py-4 text-right text-gray-600">
                                  {formatNumber(item.emissionsKg || 0)}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-600">
                                  {item.count || 0}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-6 py-4 text-right text-gray-600">
                                  {formatCurrency(item.revenueCLP || 0)}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-600">
                                  {item.transactions || 0}
                                </td>
                              </>
                            )}
                          </>
                        )}
                        {groupBy === 'company' && (
                          <>
                            <td className="px-6 py-4 text-gray-900">{item.companyName}</td>
                            {activeTab === 'emissions' ? (
                              <>
                                <td className="px-6 py-4 text-right text-gray-600">
                                  {formatNumber(item.totalEmissionsKg || 0)}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-600">
                                  {item.certificatesCount || 0}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-6 py-4 text-right text-gray-600">
                                  {formatCurrency(item.revenueCLP || 0)}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-600">
                                  {item.transactions || 0}
                                </td>
                              </>
                            )}
                          </>
                        )}
                        {groupBy === 'project' && (
                          <>
                            <td className="px-6 py-4 text-gray-900">{item.projectName}</td>
                            {activeTab === 'emissions' ? (
                              <>
                                <td className="px-6 py-4 text-right text-gray-600">
                                  {formatNumber(item.totalEmissionsKg || 0)}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-600">
                                  {item.certificatesCount || 0}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-6 py-4 text-right text-gray-600">
                                  {formatCurrency(item.revenueCLP || 0)}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-600">
                                  {item.transactions || 0}
                                </td>
                              </>
                            )}
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
