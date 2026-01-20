'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Tender {
  id: string
  client: string
  creationDate: string
  deliveryDate: string | null
  deliveryAddress: string | null
  contactPhone: string | null
  contactEmail: string | null
}

export default function TendersWithoutOrdersPage() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tenders/without-orders')
      .then((res) => res.json())
      .then((data) => {
        setTenders(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading tenders without orders:', error)
        setLoading(false)
      })
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

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
        <div className="mb-8">
          <Link
            href="/tenders"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Volver a licitaciones
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Licitaciones Sin Órdenes
          </h1>
          <p className="text-gray-600">
            Total: {tenders.length} licitación{tenders.length !== 1 ? 'es' : ''} sin productos asociados
          </p>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Estas licitaciones no tienen productos/órdenes asociadas. Pueden requerir atención para completar su información.
            </p>
          </div>
        </div>

        {tenders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              No hay licitaciones sin órdenes
            </p>
            <p className="text-gray-500 text-sm">
              Todas las licitaciones tienen productos asociados
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tenders.map((tender) => (
              <div
                key={tender.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500"
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
                    {tender.deliveryAddress && (
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Dirección de entrega:</span>{' '}
                        {tender.deliveryAddress}
                      </p>
                    )}
                    {tender.contactPhone && (
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Teléfono:</span>{' '}
                        {tender.contactPhone}
                      </p>
                    )}
                    {tender.contactEmail && (
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Email:</span>{' '}
                        <a
                          href={`mailto:${tender.contactEmail}`}
                          className="text-blue-600 hover:underline"
                        >
                          {tender.contactEmail}
                        </a>
                      </p>
                    )}
                    <div className="mt-3">
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                        Sin productos asociados
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
