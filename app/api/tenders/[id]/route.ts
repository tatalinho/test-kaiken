import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Obtener detalle de una licitación específica
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tender = await prisma.tender.findUnique({
      where: { id: params.id },
      include: {
        orders: {
          include: {
            product: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!tender) {
      return NextResponse.json(
        { error: 'Licitación no encontrada' },
        { status: 404 }
      )
    }

    // Calcular margen total y detalles por producto
    const totalMargin = tender.orders.reduce((acc, order) => {
      const margin = (order.price - order.product.cost) * order.quantity
      return acc + margin
    }, 0)

    const ordersWithMargin = tender.orders.map((order) => {
      const margin = (order.price - order.product.cost) * order.quantity
      return {
        ...order,
        margin,
        marginPercentage: ((order.price - order.product.cost) / order.product.cost) * 100,
      }
    })

    return NextResponse.json({
      ...tender,
      calculatedMargin: totalMargin,
      orders: ordersWithMargin,
    })
  } catch (error) {
    console.error('Error fetching tender:', error)
    return NextResponse.json(
      { error: 'Error al obtener licitación' },
      { status: 500 }
    )
  }
}
