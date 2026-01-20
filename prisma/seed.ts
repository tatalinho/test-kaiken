import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de base de datos...')

  // Limpiar datos existentes
  await prisma.order.deleteMany()
  await prisma.tender.deleteMany()
  await prisma.product.deleteMany()

  // Cargar datos de muestra desde los endpoints
  const [tendersData, productsData, ordersData] = await Promise.all([
    fetch('https://kaiken.up.railway.app/webhook/tender-sample').then(res => res.json()),
    fetch('https://kaiken.up.railway.app/webhook/product-sample').then(res => res.json()),
    fetch('https://kaiken.up.railway.app/webhook/order-sample').then(res => res.json()),
  ])

  console.log(`📦 Cargando ${tendersData.length} licitaciones...`)
  for (const tender of tendersData) {
    await prisma.tender.create({
      data: {
        id: tender.id,
        client: tender.client,
        creationDate: new Date(tender.creation_date),
        deliveryDate: tender.delivery_date ? new Date(tender.delivery_date) : null,
        deliveryAddress: tender.delivery_address || null,
        contactPhone: tender.contact_phone ? String(tender.contact_phone) : null,
        contactEmail: tender.contact_email || null,
        margin: tender.margin || null,
      },
    })
  }

  console.log(`📦 Cargando ${productsData.length} productos...`)
  for (const product of productsData) {
    await prisma.product.create({
      data: {
        sku: String(product.sku),
        title: product.title,
        description: product.description || null,
        cost: product.cost,
      },
    })
  }

  console.log(`📦 Cargando ${ordersData.length} órdenes...`)
  
  // Crear un mapa de tender IDs sin guiones a IDs con guiones
  const tenderIdMap = new Map<string, string>()
  for (const tender of tendersData) {
    const tenderIdWithoutDashes = tender.id.replace(/-/g, '')
    tenderIdMap.set(tenderIdWithoutDashes, tender.id)
  }
  
  let successCount = 0
  let errorCount = 0
  
  for (const order of ordersData) {
    // El tender_id en orders viene sin guiones, buscar el correspondiente con guiones
    const tenderIdWithDashes = tenderIdMap.get(order.tender_id)
    
    if (!tenderIdWithDashes) {
      console.warn(`⚠️ No se encontró tender para order ${order.id} con tender_id ${order.tender_id}`)
      errorCount++
      continue
    }
    
    try {
      await prisma.order.create({
        data: {
          id: order.id,
          tenderId: tenderIdWithDashes,
          productId: String(order.product_id),
          quantity: order.quantity,
          price: order.price,
          observation: order.observation || null,
        },
      })
      successCount++
    } catch (error) {
      console.warn(`⚠️ Error creando order ${order.id}:`, error)
      errorCount++
    }
  }
  
  console.log(`✅ ${successCount} órdenes creadas, ${errorCount} errores`)

  console.log('✅ Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
