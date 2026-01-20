import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Obtener licitaciones sin órdenes asociadas
export async function GET() {
  try {
    const tenders = await prisma.tender.findMany({
      where: {
        orders: {
          none: {}, // Solo licitaciones sin órdenes
        },
      },
      orderBy: {
        creationDate: 'desc',
      },
    })

    return NextResponse.json(tenders)
  } catch (error) {
    console.error('Error fetching tenders without orders:', error)
    return NextResponse.json(
      { error: 'Error al obtener licitaciones sin órdenes' },
      { status: 500 }
    )
  }
}
