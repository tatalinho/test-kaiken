import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Obtener todos los productos
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        title: 'asc',
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}
