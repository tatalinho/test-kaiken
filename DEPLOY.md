# Guía de Despliegue

Esta guía te ayudará a desplegar la aplicación para que otras personas puedan verla.

## Opción 1: Vercel (Recomendado - Más Fácil) 🚀

Vercel es la plataforma creada por el equipo de Next.js y es la más simple para desplegar aplicaciones Next.js.

### Pasos:

1. **Crear cuenta en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Regístrate con GitHub, GitLab o email

2. **Subir el código a GitHub**
   ```bash
   # Si aún no has subido a GitHub, crea un repositorio en github.com
   # Luego ejecuta:
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

3. **Desplegar en Vercel**
   - Ve a [vercel.com/new](https://vercel.com/new)
   - Conecta tu repositorio de GitHub
   - Vercel detectará automáticamente que es Next.js
   - Haz clic en "Deploy"

4. **Configurar base de datos**
   - Después del despliegue, necesitas ejecutar las migraciones
   - Ve a la pestaña "Settings" > "Environment Variables" (no necesitas variables para SQLite local)
   - En la pestaña "Deployments", abre la consola y ejecuta:
     ```bash
     npx prisma db push
     npm run db:seed
     ```

**Nota**: SQLite no funciona bien en Vercel porque es un sistema de archivos efímero. Para producción, deberías usar PostgreSQL. Vercel ofrece integración con bases de datos.

### Alternativa con PostgreSQL en Vercel:

1. En el dashboard de Vercel, ve a "Storage" > "Create Database" > "Postgres"
2. Copia la connection string
3. Actualiza `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Agrega `DATABASE_URL` en las variables de entorno de Vercel
5. Ejecuta `npx prisma db push` y `npm run db:seed` desde la consola de Vercel

## Opción 2: Railway 🚂

Railway es otra excelente opción que soporta SQLite y es muy fácil de usar.

### Pasos:

1. **Crear cuenta en Railway**
   - Ve a [railway.app](https://railway.app)
   - Regístrate con GitHub

2. **Subir el código a GitHub** (igual que en Vercel)

3. **Desplegar en Railway**
   - Haz clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Elige tu repositorio
   - Railway detectará Next.js automáticamente

4. **Configurar base de datos**
   - Railway creará automáticamente un servicio
   - En "Variables", agrega si es necesario
   - En la terminal del servicio, ejecuta:
     ```bash
     npx prisma db push
     npm run db:seed
     ```

5. **Obtener URL pública**
   - Railway te dará una URL automáticamente
   - Puedes configurar un dominio personalizado si lo deseas

## Opción 3: Render 🎨

Render es otra opción popular y gratuita.

### Pasos:

1. **Crear cuenta en Render**
   - Ve a [render.com](https://render.com)
   - Regístrate con GitHub

2. **Subir el código a GitHub**

3. **Crear nuevo Web Service**
   - Haz clic en "New" > "Web Service"
   - Conecta tu repositorio
   - Configura:
     - **Build Command**: `npm install && npx prisma generate && npm run build`
     - **Start Command**: `npm start`
   - Haz clic en "Create Web Service"

4. **Configurar base de datos PostgreSQL** (Render no soporta SQLite bien)
   - Crea una base de datos PostgreSQL en Render
   - Actualiza el schema de Prisma como en Vercel
   - Agrega la variable `DATABASE_URL`

## Opción 4: Netlify 🌐

Netlify también soporta Next.js.

### Pasos:

1. **Crear cuenta en Netlify**
   - Ve a [netlify.com](https://netlify.com)
   - Regístrate con GitHub

2. **Subir el código a GitHub**

3. **Desplegar**
   - Haz clic en "Add new site" > "Import an existing project"
   - Conecta tu repositorio
   - Configura:
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`
   - Haz clic en "Deploy site"

**Nota**: Netlify también requiere PostgreSQL para bases de datos persistentes.

## Recomendación Final

Para este proyecto, recomiendo **Railway** porque:
- ✅ Soporta SQLite (aunque para producción es mejor PostgreSQL)
- ✅ Muy fácil de usar
- ✅ Genera URLs públicas automáticamente
- ✅ Tiene plan gratuito generoso

O **Vercel** si quieres la mejor experiencia con Next.js:
- ✅ Creado por el equipo de Next.js
- ✅ Despliegue automático desde GitHub
- ✅ Muy rápido
- ⚠️ Requiere PostgreSQL para bases de datos

## Después del Despliegue

Una vez desplegado, actualiza el README con:
- La URL de tu aplicación desplegada
- Instrucciones de cómo acceder
- Cualquier configuración especial necesaria

## Enviar al Desafío

Recuerda enviar el POST a:
```
https://kaiken.up.railway.app/webhook/applicant
```

Con:
```json
{
  "rut": "TU_RUT",
  "nombre": "TU_NOMBRE",
  "apellido": "TU_APELLIDO",
  "url": "https://tu-app.vercel.app",
  "repo": "https://github.com/tu-usuario/tu-repo",
  "comentario": "Tu comentario"
}
```
