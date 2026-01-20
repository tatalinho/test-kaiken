# Sistema de Gestión de Licitaciones Internas

Sistema web para gestionar licitaciones adjudicadas, productos comprometidos y visualizar márgenes totales por licitación.

## 🚀 Características

- **Registro de Licitaciones**: Crea nuevas licitaciones adjudicadas con sus productos asociados
- **Visualización de Márgenes**: Calcula y muestra el margen total por licitación
- **Detalle de Productos**: Visualiza todos los productos comprometidos por licitación con sus márgenes individuales
- **Gráficos de Evolución**: Visualización semana a semana (W1, W2, W3...) de volumen vendido, ingresos y márgenes
- **Filtros Avanzados**: Filtra por año, mes y cliente para análisis específicos
- **Licitaciones Sin Órdenes**: Módulo dedicado para visualizar licitaciones que no tienen productos asociados
- **Validaciones de Negocio**: 
  - Valida que el precio de venta sea mayor que el costo
  - No permite licitaciones sin productos asociados
- **Carga de Datos de Muestra**: Script de seed para poblar la base de datos con datos de ejemplo

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: SQLite con Prisma ORM
- **Estilos**: Tailwind CSS
- **Validación**: Zod
- **Gráficos**: Recharts

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn

## 🔧 Instalación y Configuración Local

1. **Clonar el repositorio** (o navegar al directorio del proyecto)

```bash
cd "App Licitaciones"
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar la base de datos**

```bash
# Crear la base de datos y aplicar el esquema
npm run db:push
```

4. **Poblar la base de datos con datos de muestra** (opcional)

```bash
npm run db:seed
```

Este comando cargará datos desde los endpoints proporcionados:
- Licitaciones: `https://kaiken.up.railway.app/webhook/tender-sample`
- Productos: `https://kaiken.up.railway.app/webhook/product-sample`
- Órdenes: `https://kaiken.up.railway.app/webhook/order-sample`

5. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

6. **Abrir en el navegador**

Navega a [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
App Licitaciones/
├── app/
│   ├── api/
│   │   ├── tenders/          # API routes para licitaciones
│   │   ├── products/          # API routes para productos
│   │   └── stats/             # API route para estadísticas
│   ├── tenders/
│   │   ├── [id]/              # Página de detalle de licitación
│   │   ├── new/               # Página para crear nueva licitación
│   │   └── page.tsx           # Lista de licitaciones
│   ├── layout.tsx             # Layout principal
│   ├── page.tsx               # Página de inicio
│   └── globals.css            # Estilos globales
├── lib/
│   └── prisma.ts              # Cliente de Prisma
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   └── seed.ts                # Script de seed
└── package.json
```

## 🗄️ Modelo de Datos

Entender las columnas de cada "archivo", por ejemplo detalle importante que el id del tender tiene "-", que se tienen que quitar para poder linkearlo a tenderId, de las orders.

### Tender (Licitación)
- `id`: Identificador único de la licitación
- `client`: Nombre del cliente
- `creationDate`: Fecha de adjudicación
- `deliveryDate`: Fecha de entrega (opcional)
- `deliveryAddress`: Dirección de entrega (opcional)
- `contactPhone`: Teléfono de contacto (opcional)
- `contactEmail`: Email de contacto (opcional)

### Product (Producto)
- `sku`: Código único del producto
- `title`: Nombre del producto
- `description`: Descripción (opcional)
- `cost`: Costo unitario

### Order (Orden/Detalle)
- `id`: Identificador único
- `tenderId`: Referencia a la licitación
- `productId`: Referencia al producto (SKU)
- `quantity`: Cantidad de productos
- `price`: Precio unitario de venta
- `observation`: Observaciones (opcional)

## 📊 Cálculo de Márgenes

El sistema calcula los márgenes de la siguiente manera:

- **Margen por producto**: `(precio_venta - costo) * cantidad`
- **Margen total de licitación**: Suma de todos los márgenes de productos asociados
- **Porcentaje de margen**: `((precio_venta - costo) / costo) * 100`

## 🚢 Despliegue

Para desplegar la aplicación y que otras personas puedan verla, sigue estos pasos:

### Paso 1: Subir el código a GitHub

1. Crea un repositorio en [GitHub](https://github.com/new)
2. Ejecuta estos comandos en tu terminal:

```bash
git add .
git commit -m "Initial commit - Sistema de Gestión de Licitaciones"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### Paso 2: Elegir plataforma de despliegue

#### Opción 1: Railway (Recomendado para este proyecto) 🚂

1. Ve a [railway.app](https://railway.app) y regístrate con GitHub
2. Haz clic en "New Project" > "Deploy from GitHub repo"
3. Selecciona tu repositorio
4. Railway detectará Next.js automáticamente
5. Una vez desplegado, abre la terminal del servicio y ejecuta:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
6. Railway te dará una URL pública automáticamente (ej: `tu-app.up.railway.app`)

**Ventajas**: Fácil, soporta SQLite, plan gratuito generoso

#### Opción 2: Vercel (Mejor para Next.js) 🚀

1. Ve a [vercel.com](https://vercel.com) y regístrate con GitHub
2. Haz clic en "Add New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará Next.js automáticamente
5. Haz clic en "Deploy"

**Nota**: Para producción en Vercel, es mejor usar PostgreSQL:
- En Vercel Dashboard > Storage > Create Database > Postgres
- Actualiza `prisma/schema.prisma` para usar `provider = "postgresql"`
- Agrega `DATABASE_URL` en las variables de entorno
- Ejecuta `npx prisma db push` y `npm run db:seed`

**Ventajas**: Creado por el equipo de Next.js, muy rápido, despliegue automático

#### Opción 3: Render 🎨

1. Ve a [render.com](https://render.com) y regístrate con GitHub
2. Haz clic en "New" > "Web Service"
3. Conecta tu repositorio
4. Configura:
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
5. Haz clic en "Create Web Service"

**Ventajas**: Plan gratuito, fácil de usar

### Paso 3: Configurar base de datos en producción

Después del despliegue, necesitas inicializar la base de datos:

1. Abre la terminal/consola de tu plataforma
2. Ejecuta:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

### Paso 4: Obtener URL pública

Una vez desplegado, tu aplicación estará disponible en una URL pública como:
- Railway: `tu-app.up.railway.app`
- Vercel: `tu-app.vercel.app`
- Render: `tu-app.onrender.com`

### Paso 5: Enviar al desafío

Envía un POST a `https://kaiken.up.railway.app/webhook/applicant` con:

```json
{
  "rut": "TU_RUT_SIN_PUNTOS_NI_GUION",
  "nombre": "Tu Nombre",
  "apellido": "Tu Apellido",
  "url": "https://tu-app.railway.app",
  "repo": "https://github.com/tu-usuario/tu-repo",
  "comentario": "Sistema de gestión de licitaciones con Next.js, Prisma y SQLite"
}
```

**Nota**: El RUT debe ser sin puntos ni guión (ej: `123456789`)

Para más detalles, consulta el archivo `DEPLOY.md` en el repositorio.

## 🧪 Reglas de Negocio Implementadas

1. **Validación de Precio**: El precio de venta debe ser mayor que el costo del producto
2. **Productos Requeridos**: No se puede crear una licitación sin al menos un producto asociado
3. **Cálculo Automático**: Los márgenes se calculan automáticamente al crear o consultar licitaciones

## 🔍 Análisis Inicial y Proceso de Desarrollo

### Análisis de Datos

Antes de comenzar a desarrollar, realicé un análisis exhaustivo de las tres fuentes de datos proporcionadas para entender la estructura y las relaciones:

1. **Tender Sample Data** (`/webhook/tender-sample`):
   - Identifiqué que el campo `id` contiene guiones (formato: `YYYY-MM-DD-XXX`)
   - El campo `creation_date` representa la fecha de adjudicación (cuando se ganó la licitación)
   - El campo `delivery_date` es la fecha de despacho al cliente
   - Noté que algunos campos como `contact_phone` vienen como números en lugar de strings

2. **Product Sample Data** (`/webhook/product-sample`):
   - El `sku` es el identificador único y viene como número, pero debe ser string para consistencia
   - El campo `cost` es el costo unitario necesario para calcular márgenes
   - Identifiqué que algunos productos pueden no tener descripción

3. **Order Sample Data** (`/webhook/order-sample`):
   - **Descubrimiento clave**: El `tender_id` en orders viene SIN guiones, mientras que el `id` en tenders tiene guiones
   - Esto requería una transformación en el seed para mapear correctamente: `tender_id` sin guiones → `id` con guiones
   - El `product_id` corresponde al `sku` de productos
   - El campo `price` es el precio unitario de venta, necesario para calcular márgenes

### Proceso de Desarrollo

El desarrollo se realizó de forma iterativa, construyendo la solución paso a paso:

#### Fase 1: Estructura Base
- Configuré Next.js 14 con TypeScript y Tailwind CSS
- Diseñé el esquema de Prisma basándome en el análisis de datos
- Implementé las relaciones entre Tender, Product y Order
- Creé el script de seed que maneja las transformaciones necesarias (guiones en IDs, tipos de datos)

#### Fase 2: Funcionalidades Core
- Implementé las API routes para CRUD de licitaciones
- Agregué validaciones de negocio (precio > costo, licitaciones con productos)
- Creé las páginas principales: lista de licitaciones, detalle, y formulario de creación
- Implementé el cálculo automático de márgenes

#### Fase 3: Mejoras y Visualizaciones
- Agregué gráficos de evolución semanal (volumen, ingresos, márgenes)
- Implementé filtros por año, mes y cliente
- Creé el módulo de licitaciones sin órdenes para visibilidad
- Ajusté los gráficos para mostrar semanas numeradas (W1, W2, W3...) en lugar de fechas completas

#### Desafíos Encontrados y Soluciones

1. **Problema de tipos de datos en el seed**: Los datos venían con tipos inconsistentes (números donde esperaba strings). Solución: Agregué conversiones explícitas en el seed (`String()` para SKU y contactPhone).

2. **Mapeo de tender_id**: El formato diferente entre orders y tenders requería un mapeo. Solución: Creé un Map que relaciona IDs sin guiones con IDs con guiones.

3. **Cálculo de semanas**: Para mostrar W1, W2, etc., necesitaba calcular correctamente el número de semana del año. Solución: Implementé una función que encuentra el primer lunes del año y calcula las semanas desde ahí.

4. **Filtrado de licitaciones sin órdenes**: Necesitaba mostrar solo licitaciones con productos, pero también tener visibilidad de las que no tienen. Solución: Creé endpoints separados y una página dedicada para licitaciones sin órdenes.

## 🎨 Decisiones de Diseño

- **Next.js App Router**: Uso de la última versión de Next.js con App Router para mejor rendimiento y developer experience
- **SQLite**: Base de datos liviana y fácil de configurar para desarrollo y demos. Para producción, se recomienda migrar a PostgreSQL
- **Prisma ORM**: Facilita el manejo de la base de datos y las relaciones entre entidades, además de proporcionar type-safety
- **TypeScript**: Tipado estático para mayor seguridad y mejor experiencia de desarrollo
- **Tailwind CSS**: Estilos modernos y responsive sin necesidad de CSS personalizado
- **Validación con Zod**: Validación robusta tanto en cliente como en servidor
- **Recharts**: Librería elegida para gráficos por su simplicidad y buena integración con React

## 📝 Notas Adicionales

- La base de datos SQLite se crea en `prisma/dev.db`
- Los datos de muestra se cargan desde los endpoints proporcionados en el desafío
- El sistema maneja correctamente la relación entre `tender_id` (sin guiones en orders) y `id` (con guiones en tenders)

## 🔄 Comandos Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm start`: Inicia el servidor de producción
- `npm run db:push`: Aplica el esquema de base de datos
- `npm run db:seed`: Pobla la base de datos con datos de muestra

## 📧 Contacto

Para más información sobre el proyecto, consulta el código fuente o los comentarios en el código.
