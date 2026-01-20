'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Tender {
  id: string
  client: string
  creationDate: string
  deliveryDate: string | null
  calculatedMargin: number
  ordersCount: number
}

export default function TendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [clients, setClients] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<string>('')

  useEffect(() => {
    // Cargar clientes
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        setClients(data)
      })
      .catch((error) => {
        console.error('Error loading clients:', error)
      })

    // Cargar licitaciones
    fetch('/api/tenders')
      .then((res) => res.json())
      .then((data) => {
        setTenders(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading tenders:', error)
        setLoading(false)
      })
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Filtrar licitaciones por cliente
  const filteredTenders = selectedClient
    ? tenders.filter((tender) => tender.client === selectedClient)
    : tenders

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando licitaciones...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Licitaciones
            </h1>
            <p className="text-gray-600">
              Total: {filteredTenders.length} licitación{filteredTenders.length !== 1 ? 'es' : ''}
              {selectedClient && ` (filtrado por cliente)`}
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/tenders/without-orders"
              className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              ⚠️ Sin Órdenes
            </Link>
            <Link
              href="/tenders/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ Nueva Licitación
            </Link>
          </div>
        </div>

        {/* Filtro por cliente */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Cliente
          </label>
          <div className="flex gap-4 items-center">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los clientes</option>
              {clients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
            {selectedClient && (
              <button
                onClick={() => setSelectedClient('')}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {filteredTenders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              {selectedClient
                ? 'No hay licitaciones para el cliente seleccionado'
                : 'No hay licitaciones registradas'}
            </p>
            {!selectedClient && (
              <Link
                href="/tenders/new"
                className="text-blue-600 hover:underline"
              >
                Crear la primera licitación
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTenders.map((tender) => (
              <Link
                key={tender.id}
                href={`/tenders/${tender.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      {tender.client}
                    </h2>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">ID:</span> {tender.id}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Fecha de adjudicación:</span>{' '}
                      {formatDate(tender.creationDate)}
                    </p>
                    {tender.deliveryDate && (
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Fecha de entrega:</span>{' '}
                        {formatDate(tender.deliveryDate)}
                      </p>
                    )}
                    <p className="text-gray-600">
                      <span className="font-medium">Productos:</span>{' '}
                      {tender.ordersCount}
                    </p>
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-sm text-gray-500 mb-1">Margen Total</div>
                    <div
                      className={`text-3xl font-bold ${
                        tender.calculatedMargin >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(tender.calculatedMargin)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
