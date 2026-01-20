import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Obtener datos agregados por semana con filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const client = searchParams.get('client')

    // Construir filtros para las licitaciones
    const where: any = {
      orders: {
        some: {}, // Solo licitaciones con órdenes
      },
    }

    if (year) {
      const yearNum = parseInt(year)
      where.creationDate = {
        gte: new Date(yearNum, 0, 1),
        lt: new Date(yearNum + 1, 0, 1),
      }
    }

    if (month && year) {
      const yearNum = parseInt(year)
      const monthNum = parseInt(month) - 1 // JavaScript months are 0-indexed
      where.creationDate = {
        gte: new Date(yearNum, monthNum, 1),
        lt: new Date(yearNum, monthNum + 1, 1),
      }
    }

    if (client) {
      where.client = {
        contains: client,
      }
    }

    const tenders = await prisma.tender.findMany({
      where,
      include: {
        orders: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        creationDate: 'asc',
      },
    })

    // Agrupar por semana
    const weeklyData = new Map<string, {
      week: string
      weekNumber: number
      weekStart: Date
      volume: number // Cantidad total de productos
      revenue: number // Ingresos totales (precio * cantidad)
      margin: number // Margen total
    }>()

    // Determinar el año base para calcular semanas
    const baseYear = year ? parseInt(year) : new Date().getFullYear()

    for (const tender of tenders) {
      const date = new Date(tender.creationDate)
      const weekStart = getWeekStart(date)
      const weekNumber = getWeekNumber(weekStart, baseYear)
      const weekKey = `W${weekNumber}`

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, {
          week: `W${weekNumber}`,
          weekNumber,
          weekStart,
          volume: 0,
          revenue: 0,
          margin: 0,
        })
      }

      const weekData = weeklyData.get(weekKey)!
      
      for (const order of tender.orders) {
        weekData.volume += order.quantity
        weekData.revenue += order.price * order.quantity
        weekData.margin += (order.price - order.product.cost) * order.quantity
      }
    }

    // Convertir a array y ordenar por número de semana
    const weeklyArray = Array.from(weeklyData.values()).sort(
      (a, b) => a.weekNumber - b.weekNumber
    )

    return NextResponse.json(weeklyArray)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos analíticos' },
      { status: 500 }
    )
  }
}

// Función para obtener el inicio de la semana (lunes)
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Ajustar para que lunes sea el primer día
  return new Date(d.setDate(diff))
}

// Calcular el número de semana del año (basado en el primer lunes del año)
function getWeekNumber(date: Date, year: number): number {
  const targetYear = date.getFullYear()
  
  // Si la fecha está en un año diferente, usar ese año
  const baseYear = targetYear !== year ? targetYear : year
  
  // Encontrar el primer lunes del año
  const jan1 = new Date(baseYear, 0, 1)
  const jan1Day = jan1.getDay()
  const daysToMonday = jan1Day === 0 ? 1 : (8 - jan1Day) % 7 || 7
  const firstMonday = new Date(baseYear, 0, 1 + daysToMonday)
  
  // Si la fecha es antes del primer lunes, pertenece a la semana 0 o última del año anterior
  if (date < firstMonday) {
    return 1 // O podríamos calcular la última semana del año anterior
  }
  
  // Calcular diferencia en días desde el primer lunes
  const diffTime = date.getTime() - firstMonday.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // Calcular número de semana (semana 1 empieza en el primer lunes)
  const weekNumber = Math.floor(diffDays / 7) + 1
  
  return weekNumber
}
