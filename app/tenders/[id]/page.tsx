'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Product {
  sku: string
  title: string
  cost: number
}

interface Order {
  id: string
  product: Product
  quantity: number
  price: number
  observation: string | null
  margin: number
  marginPercentage: number
}

interface Tender {
  id: string
  client: string
  creationDate: string
  deliveryDate: string | null
  deliveryAddress: string | null
  contactPhone: string | null
  contactEmail: string | null
  calculatedMargin: number
  orders: Order[]
}

export default function TenderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tender, setTender] = useState<Tender | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/tenders/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error('Error:', data.error)
          } else {
            setTender(data)
          }
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error loading tender:', error)
          setLoading(false)
        })
    }
  }, [params.id])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando licitación...</div>
      </div>
    )
  }

  if (!tender) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Licitación no encontrada
          </h1>
          <Link href="/tenders" className="text-blue-600 hover:underline">
            Volver a licitaciones
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/tenders"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Volver a licitaciones
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {tender.client}
              </h1>
              <p className="text-gray-600">
                <span className="font-medium">ID:</span> {tender.id}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Margen Total</div>
              <div
                className={`text-4xl font-bold ${
                  tender.calculatedMargin >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formatCurrency(tender.calculatedMargin)}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Información de la Licitación
              </h3>
              <div className="space-y-2 text-gray-600">
                <p>
                  <span className="font-medium">Fecha de adjudicación:</span>{' '}
                  {formatDate(tender.creationDate)}
                </p>
                {tender.deliveryDate && (
                  <p>
                    <span className="font-medium">Fecha de entrega:</span>{' '}
                    {formatDate(tender.deliveryDate)}
                  </p>
                )}
                {tender.deliveryAddress && (
                  <p>
                    <span className="font-medium">Dirección de entrega:</span>{' '}
                    {tender.deliveryAddress}
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Contacto</h3>
              <div className="space-y-2 text-gray-600">
                {tender.contactPhone && (
                  <p>
                    <span className="font-medium">Teléfono:</span>{' '}
                    {tender.contactPhone}
                  </p>
                )}
                {tender.contactEmail && (
                  <p>
                    <span className="font-medium">Email:</span>{' '}
                    <a
                      href={`mailto:${tender.contactEmail}`}
                      className="text-blue-600 hover:underline"
                    >
                      {tender.contactEmail}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Productos Comprometidos ({tender.orders.length})
          </h2>

          {tender.orders.length === 0 ? (
            <p className="text-gray-600">No hay productos asociados a esta licitación.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Costo Unit.
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Unit.
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Margen
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Margen %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observación
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tender.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.product.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {order.product.sku}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(order.product.cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(order.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <span
                          className={
                            order.margin >= 0 ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {formatCurrency(order.margin)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <span
                          className={
                            order.marginPercentage >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {order.marginPercentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.observation || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-right text-sm font-medium text-gray-900"
                    >
                      Total Margen:
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold">
                      <span
                        className={
                          tender.calculatedMargin >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {formatCurrency(tender.calculatedMargin)}
                      </span>
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
