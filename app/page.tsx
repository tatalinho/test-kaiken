'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Stats {
  tenders: number
  products: number
  orders: number
  totalMargin: number
}

interface WeeklyData {
  week: string
  weekNumber: number
  weekStart: Date
  volume: number
  revenue: number
  margin: number
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [clients, setClients] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCharts, setLoadingCharts] = useState(true)

  // Filtros
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [selectedClient, setSelectedClient] = useState<string>('')

  // Obtener años disponibles
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  const months = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ]

  useEffect(() => {
    // Cargar estadísticas
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading stats:', error)
        setLoading(false)
      })

    // Cargar clientes
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        setClients(data)
      })
      .catch((error) => {
        console.error('Error loading clients:', error)
      })
  }, [])

  useEffect(() => {
    // Cargar datos semanales con filtros
    setLoadingCharts(true)
    const params = new URLSearchParams()
    if (selectedYear) params.append('year', selectedYear)
    if (selectedMonth) params.append('month', selectedMonth)
    if (selectedClient) params.append('client', selectedClient)

    fetch(`/api/analytics?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setWeeklyData(data)
        setLoadingCharts(false)
      })
      .catch((error) => {
        console.error('Error loading analytics:', error)
        setLoadingCharts(false)
      })
  }, [selectedYear, selectedMonth, selectedClient])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CL').format(num)
  }

  const handleResetFilters = () => {
    setSelectedYear('')
    setSelectedMonth('')
    setSelectedClient('')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Sistema de Gestión de Licitaciones
          </h1>
          <p className="text-xl text-gray-600">
            Gestiona tus licitaciones adjudicadas y productos comprometidos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/tenders"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              📋 Ver Licitaciones
            </h2>
            <p className="text-gray-600">
              Consulta todas las licitaciones con sus márgenes totales y detalles
            </p>
          </Link>

          <Link
            href="/tenders/without-orders"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-l-4 border-yellow-500"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              ⚠️ Sin Órdenes
            </h2>
            <p className="text-gray-600">
              Licitaciones sin productos asociados que requieren atención
            </p>
          </Link>

          <Link
            href="/tenders/new"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              ➕ Nueva Licitación
            </h2>
            <p className="text-gray-600">
              Registra una nueva licitación adjudicada con sus productos
            </p>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            📊 Resumen del Sistema
          </h2>
          {loading ? (
            <div className="text-center py-8 text-gray-600">
              Cargando estadísticas...
            </div>
          ) : stats ? (
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.tenders}
                </div>
                <div className="text-gray-600 mt-2">Licitaciones</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">
                  {stats.products}
                </div>
                <div className="text-gray-600 mt-2">Productos</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {stats.orders}
                </div>
                <div className="text-gray-600 mt-2">Órdenes</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <div
                  className={`text-3xl font-bold ${
                    stats.totalMargin >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(stats.totalMargin)}
                </div>
                <div className="text-gray-600 mt-2">Margen Total</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              No se pudieron cargar las estadísticas
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              📈 Evolución Semanal
            </h2>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Limpiar Filtros
            </button>
          </div>

          {/* Filtros */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value)
                  if (e.target.value) {
                    setSelectedMonth('') // Resetear mes si cambia el año
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los años</option>
                {years.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mes
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={!selectedYear}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Todos los meses</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los clientes</option>
                {clients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingCharts ? (
            <div className="text-center py-12 text-gray-600">
              Cargando datos...
            </div>
          ) : weeklyData.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No hay datos disponibles para los filtros seleccionados
            </div>
          ) : (
            <div className="space-y-8">
              {/* Gráfico de Volumen Vendido */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Volumen Vendido (Cantidad de Productos)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number | undefined) => value !== undefined ? formatNumber(value) : ''}
                    />
                    <Legend />
                    <Bar dataKey="volume" fill="#3b82f6" name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Ingresos */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Ingresos Semanales
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Ingresos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Margen */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Margen Semanal
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="margin"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Margen"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Resumen de Totales */}
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">
                    Volumen Total
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(
                      weeklyData.reduce((acc, week) => acc + week.volume, 0)
                    )}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">
                    Ingresos Totales
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      weeklyData.reduce((acc, week) => acc + week.revenue, 0)
                    )}
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Margen Total</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(
                      weeklyData.reduce((acc, week) => acc + week.margin, 0)
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
