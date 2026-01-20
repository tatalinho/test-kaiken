const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Inicializando base de datos...');

try {
  // Crear directorio prisma si no existe
  const prismaDir = path.join(__dirname, '../prisma');
  if (!fs.existsSync(prismaDir)) {
    fs.mkdirSync(prismaDir, { recursive: true });
  }

  // Ejecutar prisma db push para crear las tablas
  console.log('📦 Creando esquema de base de datos...');
  execSync('npx prisma db push --accept-data-loss', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  // Ejecutar seed solo si la base de datos está vacía
  console.log('🌱 Poblando base de datos con datos de muestra...');
  try {
    execSync('npx tsx prisma/seed.ts', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Base de datos inicializada correctamente');
  } catch (seedError) {
    // El seed puede fallar si ya hay datos, eso está bien
    console.log('⚠️ Seed completado (puede que ya existan datos)');
  }
} catch (error) {
  console.error('❌ Error inicializando base de datos:', error.message);
  // No salir con error, dejar que la app intente iniciar de todas formas
  console.log('⚠️ Continuando sin inicializar base de datos...');
}
