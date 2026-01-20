import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Obtener lista de clientes únicos
export async function GET() {
  try {
    const clients = await prisma.tender.findMany({
      where: {
        orders: {
          some: {}, // Solo licitaciones con órdenes
        },
      },
      select: {
        client: true,
      },
      distinct: ['client'],
      orderBy: {
        client: 'asc',
      },
    })

    const clientNames = clients.map((t) => t.client)

    return NextResponse.json(clientNames)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    )
  }
}
