/**
 * Script de empaquetado para entrega académica SENATI
 * Genera el archivo 'botica-nova-salud.zip' excluyendo node_modules y archivos innecesarios.
 * Uso: node build-zip.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_ZIP = path.join(__dirname, 'botica-nova-salud.zip');
const STAGING_DIR = path.join(__dirname, '.staging_zip');

const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.staging_zip',
  'botica-nova-salud.zip',
  'dist',
  '.cache',
  '.DS_Store',
  'Thumbs.db',
  'npm-debug.log',
];

function shouldIgnore(name) {
  return IGNORE_PATTERNS.some((pattern) => name === pattern || name.startsWith('.staging'));
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      if (shouldIgnore(entry)) continue;
      const srcChild = path.join(src, entry);
      const destChild = path.join(dest, entry);
      copyRecursive(srcChild, destChild);
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function buildZip() {
  console.log('====================================================');
  console.log('  GENERADOR DE PAQUETE: BOTICA NOVA SALUD (SENATI)');
  console.log('====================================================');

  try {
    // 1. Limpieza previa
    cleanDir(STAGING_DIR);
    if (fs.existsSync(OUTPUT_ZIP)) {
      fs.unlinkSync(OUTPUT_ZIP);
    }

    console.log('[1/3] Preparando archivos del proyecto (excluyendo node_modules)...');
    fs.mkdirSync(STAGING_DIR, { recursive: true });

    const rootEntries = fs.readdirSync(__dirname);
    for (const entry of rootEntries) {
      if (shouldIgnore(entry)) continue;
      const srcPath = path.join(__dirname, entry);
      const destPath = path.join(STAGING_DIR, entry);
      copyRecursive(srcPath, destPath);
    }

    console.log('[2/3] Comprimiendo en botica-nova-salud.zip...');

    if (process.platform === 'win32') {
      // Uso de .NET ZipFile nativo en PowerShell (silencioso y sin errores de Write-Progress en consolas CI/CD)
      const psScript = `
        $ProgressPreference = 'SilentlyContinue';
        Add-Type -AssemblyName System.IO.Compression.FileSystem;
        [System.IO.Compression.ZipFile]::CreateFromDirectory('${STAGING_DIR.replace(/\\/g, '\\\\')}', '${OUTPUT_ZIP.replace(/\\/g, '\\\\')}');
      `.replace(/\r?\n/g, ' ');
      execSync(`powershell -NoProfile -Command "${psScript}"`, { stdio: 'inherit' });
    } else {
      // Entornos Unix/Linux/macOS
      execSync(`cd "${STAGING_DIR}" && zip -r "${OUTPUT_ZIP}" .`, { stdio: 'inherit' });
    }

    console.log('[3/3] Limpiando archivos temporales...');
    cleanDir(STAGING_DIR);

    const stats = fs.statSync(OUTPUT_ZIP);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log('====================================================');
    console.log(`¡Éxito! Archivo generado correctamente:`);
    console.log(` -> ${OUTPUT_ZIP} (${sizeKB} KB)`);
    console.log(' Listo para ser presentado y calificado en SENATI.');
    console.log('====================================================');
  } catch (error) {
    cleanDir(STAGING_DIR);
    console.error('Error al empaquetar el proyecto:', error);
    process.exit(1);
  }
}

buildZip();
