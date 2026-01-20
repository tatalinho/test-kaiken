import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET: Obtener todas las licitaciones con márgenes calculados
export async function GET() {
  try {
    const tenders = await prisma.tender.findMany({
      where: {
        orders: {
          some: {}, // Solo licitaciones con órdenes
        },
      },
      include: {
        orders: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        creationDate: 'desc',
      },
    })

    // Calcular margen total para cada licitación
    const tendersWithMargin = tenders.map((tender) => {
      const totalMargin = tender.orders.reduce((acc, order) => {
        const margin = (order.price - order.product.cost) * order.quantity
        return acc + margin
      }, 0)

      return {
        ...tender,
        calculatedMargin: totalMargin,
        ordersCount: tender.orders.length,
      }
    })

    return NextResponse.json(tendersWithMargin)
  } catch (error) {
    console.error('Error fetching tenders:', error)
    return NextResponse.json(
      { error: 'Error al obtener licitaciones' },
      { status: 500 }
    )
  }
}

// POST: Crear una nueva licitación
const createTenderSchema = z.object({
  id: z.string().min(1, 'El ID es requerido'),
  client: z.string().min(1, 'El cliente es requerido'),
  creationDate: z.string().datetime(),
  deliveryDate: z.string().datetime().optional().nullable(),
  deliveryAddress: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  orders: z.array(
    z.object({
      productId: z.string().min(1, 'El SKU del producto es requerido'),
      quantity: z.number().int().positive('La cantidad debe ser positiva'),
      price: z.number().positive('El precio debe ser positivo'),
      observation: z.string().optional().nullable(),
    })
  ).min(1, 'Debe haber al menos un producto en la licitación'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createTenderSchema.parse(body)

    // Validar que todos los productos existan y que precio > costo
    for (const order of validatedData.orders) {
      const product = await prisma.product.findUnique({
        where: { sku: order.productId },
      })

      if (!product) {
        return NextResponse.json(
          { error: `Producto con SKU ${order.productId} no encontrado` },
          { status: 404 }
        )
      }

      if (order.price <= product.cost) {
        return NextResponse.json(
          {
            error: `El precio de venta (${order.price}) debe ser mayor que el costo (${product.cost}) para el producto ${product.title}`,
          },
          { status: 400 }
        )
      }
    }

    // Crear la licitación y sus órdenes
    const tender = await prisma.tender.create({
      data: {
        id: validatedData.id,
        client: validatedData.client,
        creationDate: new Date(validatedData.creationDate),
        deliveryDate: validatedData.deliveryDate
          ? new Date(validatedData.deliveryDate)
          : null,
        deliveryAddress: validatedData.deliveryAddress || null,
        contactPhone: validatedData.contactPhone || null,
        contactEmail: validatedData.contactEmail || null,
        orders: {
          create: validatedData.orders.map((order, index) => ({
            id: `${validatedData.id}-${index + 1}`,
            productId: order.productId,
            quantity: order.quantity,
            price: order.price,
            observation: order.observation || null,
          })),
        },
      },
      include: {
        orders: {
          include: {
            product: true,
          },
        },
      },
    })

    // Calcular margen total
    const totalMargin = tender.orders.reduce((acc, order) => {
      const margin = (order.price - order.product.cost) * order.quantity
      return acc + margin
    }, 0)

    return NextResponse.json({
      ...tender,
      calculatedMargin: totalMargin,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Ya existe una licitación con este ID' },
        { status: 409 }
      )
    }

    console.error('Error creating tender:', error)
    return NextResponse.json(
      { error: 'Error al crear licitación' },
      { status: 500 }
    )
  }
}
