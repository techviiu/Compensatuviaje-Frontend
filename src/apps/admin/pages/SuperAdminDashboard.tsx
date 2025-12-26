import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Leaf, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getDashboard, getMetrics, DashboardData, MetricsData } from '../services/adminApi';

// Colores para gráficos
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: 'emerald' | 'blue' | 'amber' | 'red' | 'purple';
}

const KPICard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color }: KPICardProps) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={`mt-2 flex items-center gap-1 text-sm ${
              trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : trend === 'down' ? (
                <ArrowDownRight className="w-4 h-4" />
              ) : null}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default function SuperAdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashboardData, metricsData] = await Promise.all([
        getDashboard(),
        getMetrics(period)
      ]);
      setDashboard(dashboardData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Set default empty data so page doesn't stay blank
      setDashboard({
        overview: {
          totalCompanies: 0,
          activeCompanies: 0,
          pendingVerification: 0,
          totalB2CUsers: 0,
          activeB2CUsers30d: 0,
          totalEmissionsKg: 0,
          totalCompensatedKg: 0,
          compensationRate: 0,
          totalRevenueCLP: 0
        },
        companies: { total: 0, active: 0, pending: 0, registered: 0, suspended: 0, byStatus: {} },
        b2c: { total: 0, active30d: 0, newThisMonth: 0, withCompensations: 0, totalCalculations: 0 },
        emissions: { totalCalculated: 0, totalCompensated: 0, compensationRate: 0, totalRevenue: 0 },
        verification: { companies: 0, documents: 0, total: 0 },
        recentActivity: [],
        alerts: [{ type: 'warning', message: 'Error al cargar datos del dashboard', actionUrl: '', count: 1 }],
        workQueue: { pendingCompanies: 0, pendingDocuments: 0, total: 0 }
      });
      setMetrics({
        period: '30d',
        groupBy: 'time',
        emissions: { series: [], total: 0, average: 0, trend: '0%' },
        revenue: { series: [], totalCLP: 0, totalUSD: 0, trend: '0%' },
        newCompanies: { series: [], total: 0, trend: '0%' },
        newB2CUsers: { series: [], total: 0, trend: '0%' }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(num);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-xl"></div>
            <div className="h-80 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Datos para el pie chart de empresas por estado
  const companyStatusData = dashboard?.companies.byStatus
    ? Object.entries(dashboard.companies.byStatus).map(([status, count]) => ({
        name: status,
        value: count
      }))
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Resumen general del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="365d">Último año</option>
          </select>
        </div>
      </div>

      {/* Alerts */}
      {dashboard?.alerts && dashboard.alerts.length > 0 && (
        <div className="space-y-2">
          {dashboard.alerts.map((alert, index) => (
            <Link
              key={index}
              to={alert.actionUrl}
              className={`flex items-center gap-3 p-4 rounded-lg ${
                alert.type === 'error' ? 'bg-red-50 text-red-700' :
                alert.type === 'warning' ? 'bg-amber-50 text-amber-700' :
                'bg-blue-50 text-blue-700'
              }`}
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{alert.message}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          ))}
        </div>
      )}

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Empresas B2B"
          value={dashboard?.overview.totalCompanies || 0}
          subtitle={`${dashboard?.overview.activeCompanies || 0} activas`}
          icon={Building2}
          trend="up"
          trendValue={`${dashboard?.overview.pendingVerification || 0} pendientes`}
          color="blue"
        />
        <KPICard
          title="Usuarios B2C"
          value={formatNumber(dashboard?.overview.totalB2CUsers || 0)}
          subtitle={`${dashboard?.overview.activeB2CUsers30d || 0} activos (30d)`}
          icon={Users}
          trend="up"
          trendValue="+12% este mes"
          color="purple"
        />
        <KPICard
          title="CO₂ Compensado"
          value={`${formatNumber(dashboard?.overview.totalCompensatedKg || 0)} kg`}
          subtitle={`Tasa: ${dashboard?.overview.compensationRate || 0}%`}
          icon={Leaf}
          trend="up"
          trendValue="+8% vs período anterior"
          color="emerald"
        />
        <KPICard
          title="Ingresos"
          value={formatCurrency(dashboard?.overview.totalRevenueCLP || 0)}
          icon={DollarSign}
          trend="up"
          trendValue="+15% este mes"
          color="amber"
        />
      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Emisiones */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Emisiones Compensadas
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.emissions.series || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px' }}
                  formatter={(value: number) => [`${value} kg`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="compensated"
                  stroke="#10b981"
                  fill="#d1fae5"
                  name="Compensado"
                />
                <Area
                  type="monotone"
                  dataKey="calculated"
                  stroke="#3b82f6"
                  fill="#dbeafe"
                  name="Calculado"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Ingresos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ingresos por Compensaciones
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.revenue.series || []}>
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
                  tickFormatter={(value) => `$${formatNumber(value)}`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px' }}
                  formatter={(value: number) => [formatCurrency(value), 'Ingresos']}
                />
                <Line
                  type="monotone"
                  dataKey="valueCLP"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Segunda fila de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estado de Empresas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Empresas por Estado
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={companyStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {companyStatusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {companyStatusData.slice(0, 4).map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-600 capitalize">{item.name}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cola de Trabajo */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cola de Trabajo
          </h3>
          <div className="space-y-4">
            <Link
              to="/admin/empresas?status=pending"
              className="flex items-center justify-between p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-gray-700">Empresas Pendientes</span>
              </div>
              <span className="text-2xl font-bold text-amber-600">
                {dashboard?.workQueue.pendingCompanies || 0}
              </span>
            </Link>
            <Link
              to="/admin/verificaciones"
              className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Documentos por Revisar</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {dashboard?.workQueue.pendingDocuments || 0}
              </span>
            </Link>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
              dashboard.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-2">
                  <div className={`mt-0.5 p-1 rounded ${
                    activity.type.includes('registered') ? 'bg-emerald-100 text-emerald-600' :
                    activity.type.includes('verified') ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.type.includes('company') ? (
                      <Building2 className="w-4 h-4" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString('es-CL', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No hay actividad reciente
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas B2C */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Crecimiento de Usuarios B2C
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics?.newB2CUsers.series || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px' }}
                formatter={(value: number) => [value, 'Nuevos usuarios']}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#8b5cf6"
                fill="#ede9fe"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
