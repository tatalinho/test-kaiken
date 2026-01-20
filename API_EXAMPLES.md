# Ejemplos de Uso de la API

Este documento describe cómo usar las API routes del sistema.

## Endpoints Disponibles

### GET /api/tenders

Obtiene todas las licitaciones con sus márgenes calculados.

**Respuesta:**
```json
[
  {
    "id": "2024-01-15-001",
    "client": "Cliente Ejemplo",
    "creationDate": "2024-01-15T00:00:00.000Z",
    "deliveryDate": "2024-02-15T00:00:00.000Z",
    "deliveryAddress": "Dirección 123",
    "contactPhone": "+56 9 1234 5678",
    "contactEmail": "cliente@ejemplo.cl",
    "calculatedMargin": 150000,
    "ordersCount": 3
  }
]
```

### GET /api/tenders/[id]

Obtiene el detalle de una licitación específica con todos sus productos.

**Respuesta:**
```json
{
  "id": "2024-01-15-001",
  "client": "Cliente Ejemplo",
  "creationDate": "2024-01-15T00:00:00.000Z",
  "deliveryDate": "2024-02-15T00:00:00.000Z",
  "deliveryAddress": "Dirección 123",
  "contactPhone": "+56 9 1234 5678",
  "contactEmail": "cliente@ejemplo.cl",
  "calculatedMargin": 150000,
  "orders": [
    {
      "id": "2024-01-15-001-1",
      "product": {
        "sku": "PROD-001",
        "title": "Producto Ejemplo",
        "cost": 1000
      },
      "quantity": 10,
      "price": 1500,
      "observation": "Observación",
      "margin": 5000,
      "marginPercentage": 50
    }
  ]
}
```

### POST /api/tenders

Crea una nueva licitación.

**Body:**
```json
{
  "id": "2024-01-15-002",
  "client": "Nuevo Cliente",
  "creationDate": "2024-01-15T00:00:00.000Z",
  "deliveryDate": "2024-02-15T00:00:00.000Z",
  "deliveryAddress": "Nueva Dirección",
  "contactPhone": "+56 9 9876 5432",
  "contactEmail": "nuevo@cliente.cl",
  "orders": [
    {
      "productId": "PROD-001",
      "quantity": 5,
      "price": 1500,
      "observation": "Observación opcional"
    }
  ]
}
```

**Validaciones:**
- El ID debe ser único
- El cliente es requerido
- Debe haber al menos un producto
- El precio debe ser mayor que el costo del producto

### GET /api/products

Obtiene todos los productos disponibles.

**Respuesta:**
```json
[
  {
    "sku": "PROD-001",
    "title": "Producto Ejemplo",
    "description": "Descripción del producto",
    "cost": 1000
  }
]
```

### GET /api/stats

Obtiene estadísticas generales del sistema.

**Respuesta:**
```json
{
  "tenders": 10,
  "products": 25,
  "orders": 45,
  "totalMargin": 500000
}
```
