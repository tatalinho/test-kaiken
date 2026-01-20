'use client'

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

interface WeeklyData {
  week: string
  weekNumber: number
  weekStart: Date
  volume: number
  revenue: number
  margin: number
}

interface ChartsProps {
  weeklyData: WeeklyData[]
  formatCurrency?: (amount: number) => string
  formatNumber?: (num: number) => string
}

export function VolumeChart({ weeklyData, formatNumber }: ChartsProps) {
  const defaultFormatNumber = (num: number) => new Intl.NumberFormat('es-CL').format(num)
  const formatter = formatNumber || defaultFormatNumber
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={weeklyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip
          formatter={(value: number | undefined) => value !== undefined ? formatter(value) : ''}
        />
        <Legend />
        <Bar dataKey="volume" fill="#3b82f6" name="Cantidad" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RevenueChart({ weeklyData, formatCurrency }: ChartsProps) {
  const defaultFormatCurrency = (amount: number) => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
  const formatter = formatCurrency || defaultFormatCurrency
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={weeklyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip
          formatter={(value: number | undefined) => value !== undefined ? formatter(value) : ''}
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
  )
}

export function MarginChart({ weeklyData, formatCurrency }: ChartsProps) {
  const defaultFormatCurrency = (amount: number) => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
  const formatter = formatCurrency || defaultFormatCurrency
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={weeklyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip
          formatter={(value: number | undefined) => value !== undefined ? formatter(value) : ''}
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
  )
}
