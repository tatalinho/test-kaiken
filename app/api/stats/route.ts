import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Obtener estadísticas generales
export async function GET() {
  try {
    const [tendersCount, productsCount, ordersCount] = await Promise.all([
      prisma.tender.count({
        where: {
          orders: {
            some: {}, // Solo licitaciones con órdenes
          },
        },
      }),
      prisma.product.count(),
      prisma.order.count(),
    ])

    // Calcular margen total de todas las licitaciones (solo con órdenes)
    const allTenders = await prisma.tender.findMany({
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
    })

    const totalMargin = allTenders.reduce((acc, tender) => {
      const tenderMargin = tender.orders.reduce((orderAcc, order) => {
        const margin = (order.price - order.product.cost) * order.quantity
        return orderAcc + margin
      }, 0)
      return acc + tenderMargin
    }, 0)

    return NextResponse.json({
      tenders: tendersCount,
      products: productsCount,
      orders: ordersCount,
      totalMargin: totalMargin,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
