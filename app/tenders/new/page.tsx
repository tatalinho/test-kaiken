'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Product {
  sku: string
  title: string
  cost: number
}

interface OrderForm {
  productId: string
  quantity: number
  price: number
  observation: string
}

export default function NewTenderPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    id: '',
    client: '',
    creationDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    deliveryAddress: '',
    contactPhone: '',
    contactEmail: '',
  })

  const [orders, setOrders] = useState<OrderForm[]>([
    { productId: '', quantity: 1, price: 0, observation: '' },
  ])

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading products:', error)
        setLoading(false)
      })
  }, [])

  const handleAddOrder = () => {
    setOrders([...orders, { productId: '', quantity: 1, price: 0, observation: '' }])
  }

  const handleRemoveOrder = (index: number) => {
    if (orders.length > 1) {
      setOrders(orders.filter((_, i) => i !== index))
    }
  }

  const handleOrderChange = (
    index: number,
    field: keyof OrderForm,
    value: string | number
  ) => {
    const newOrders = [...orders]
    newOrders[index] = { ...newOrders[index], [field]: value }

    // Si cambia el producto, actualizar el precio sugerido basado en el costo
    if (field === 'productId' && typeof value === 'string') {
      const product = products.find((p) => p.sku === value)
      if (product) {
        // Sugerir un precio 20% mayor que el costo
        newOrders[index].price = product.cost * 1.2
      }
    }

    setOrders(newOrders)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    // Validaciones
    if (!formData.id.trim()) {
      setError('El ID de la licitación es requerido')
      setSubmitting(false)
      return
    }

    if (!formData.client.trim()) {
      setError('El cliente es requerido')
      setSubmitting(false)
      return
    }

    if (orders.some((o) => !o.productId)) {
      setError('Todos los productos deben estar seleccionados')
      setSubmitting(false)
      return
    }

    if (orders.some((o) => o.quantity <= 0)) {
      setError('Todas las cantidades deben ser mayores a 0')
      setSubmitting(false)
      return
    }

    if (orders.some((o) => o.price <= 0)) {
      setError('Todos los precios deben ser mayores a 0')
      setSubmitting(false)
      return
    }

    // Validar que precio > costo para cada producto
    for (const order of orders) {
      const product = products.find((p) => p.sku === order.productId)
      if (product && order.price <= product.cost) {
        setError(
          `El precio de venta debe ser mayor que el costo (${product.cost}) para el producto ${product.title}`
        )
        setSubmitting(false)
        return
      }
    }

    try {
      const response = await fetch('/api/tenders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          creationDate: new Date(formData.creationDate).toISOString(),
          deliveryDate: formData.deliveryDate
            ? new Date(formData.deliveryDate).toISOString()
            : null,
          orders: orders.map((o) => ({
            productId: o.productId,
            quantity: o.quantity,
            price: o.price,
            observation: o.observation || null,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al crear la licitación')
        setSubmitting(false)
        return
      }

      // Redirigir a la página de detalle
      router.push(`/tenders/${data.id}`)
    } catch (error) {
      console.error('Error creating tender:', error)
      setError('Error al crear la licitación')
      setSubmitting(false)
    }
  }

  const getProductCost = (sku: string) => {
    const product = products.find((p) => p.sku === sku)
    return product ? product.cost : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando productos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/tenders"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Volver a licitaciones
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Nueva Licitación
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID de la Licitación *
                </label>
                <input
                  type="text"
                  required
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 2024-01-15-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={formData.client}
                  onChange={(e) =>
                    setFormData({ ...formData, client: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Adjudicación *
                </label>
                <input
                  type="date"
                  required
                  value={formData.creationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, creationDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Entrega
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección de Entrega
                </label>
                <input
                  type="text"
                  value={formData.deliveryAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryAddress: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dirección completa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contacto@cliente.cl"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Productos *
                </h2>
                <button
                  type="button"
                  onClick={handleAddOrder}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  ➕ Agregar Producto
                </button>
              </div>

              {orders.map((order, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-lg mb-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Producto {index + 1}
                    </h3>
                    {orders.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOrder(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Producto *
                      </label>
                      <select
                        required
                        value={order.productId}
                        onChange={(e) =>
                          handleOrderChange(index, 'productId', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar producto</option>
                        {products.map((product) => (
                          <option key={product.sku} value={product.sku}>
                            {product.title} (SKU: {product.sku}) - Costo:{' '}
                            {new Intl.NumberFormat('es-CL', {
                              style: 'currency',
                              currency: 'CLP',
                            }).format(product.cost)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={order.quantity}
                        onChange={(e) =>
                          handleOrderChange(
                            index,
                            'quantity',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio Unitario de Venta *
                        {order.productId && (
                          <span className="text-xs text-gray-500 ml-2">
                            (Costo: {new Intl.NumberFormat('es-CL', {
                              style: 'currency',
                              currency: 'CLP',
                            }).format(getProductCost(order.productId))})
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={order.price}
                        onChange={(e) =>
                          handleOrderChange(
                            index,
                            'price',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {order.productId &&
                        order.price > 0 &&
                        order.price <= getProductCost(order.productId) && (
                          <p className="text-red-600 text-xs mt-1">
                            ⚠️ El precio debe ser mayor que el costo
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observación
                      </label>
                      <input
                        type="text"
                        value={order.observation}
                        onChange={(e) =>
                          handleOrderChange(index, 'observation', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Notas adicionales"
                      />
                    </div>
                  </div>

                  {order.productId && order.price > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Margen estimado:</span>{' '}
                        <span
                          className={
                            (order.price - getProductCost(order.productId)) *
                              order.quantity >=
                            0
                              ? 'text-green-600 font-semibold'
                              : 'text-red-600 font-semibold'
                          }
                        >
                          {new Intl.NumberFormat('es-CL', {
                            style: 'currency',
                            currency: 'CLP',
                          }).format(
                            (order.price - getProductCost(order.productId)) *
                              order.quantity
                          )}
                        </span>
                        {' '}({(
                          ((order.price - getProductCost(order.productId)) /
                            getProductCost(order.productId)) *
                          100
                        ).toFixed(2)}%)
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Link
                href="/tenders"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Guardando...' : 'Crear Licitación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
