/**
 * Script de Diagnóstico de Despliegue
 * Identifica qué archivos existen en local vs producción
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 DIAGNÓSTICO DE DESPLIEGUE\n');

// 1. Verificar que healthSync.js NO existe en local
const healthSyncOld = path.join(__dirname, 'src', 'utils', 'healthSync.js');
const healthSyncNew = path.join(__dirname, 'src', 'utils', 'healthSync_v2.js');

console.log('📁 Verificando archivos locales:\n');

if (fs.existsSync(healthSyncOld)) {
    console.log('❌ PROBLEMA: healthSync.js TODAVÍA EXISTE en local');
    console.log(`   Ubicación: ${healthSyncOld}`);
    console.log('   Este archivo debería haberse eliminado/renombrado.\n');
} else {
    console.log('✅ healthSync.js NO existe en local (correcto)\n');
}

if (fs.existsSync(healthSyncNew)) {
    console.log('✅ healthSync_v2.js SÍ existe en local (correcto)\n');
} else {
    console.log('❌ PROBLEMA: healthSync_v2.js NO existe en local\n');
}

// 2. Verificar imports en archivos clave
console.log('📝 Verificando imports en archivos clave:\n');

const filesToCheck = [
    { file: 'src/main.js', shouldImport: 'healthSync_v2.js' },
    { file: 'src/pages/activity.js', shouldImport: 'healthSync_v2.js' },
    { file: 'src/pages/settings.js', shouldImport: 'healthSync_v2.js' },
    { file: 'src/components/HealthConnections.js', shouldImport: 'healthSync_v2.js' }
];

filesToCheck.forEach(({ file, shouldImport }) => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');

        if (content.includes('healthSync_v2.js')) {
            console.log(`✅ ${file}: Importa healthSync_v2.js (correcto)`);
        } else if (content.includes('healthSync.js')) {
            console.log(`❌ ${file}: TODAVÍA importa healthSync.js (PROBLEMA)`);
        } else {
            console.log(`⚠️  ${file}: No importa ningún healthSync`);
        }
    } else {
        console.log(`⚠️  ${file}: No existe`);
    }
});

console.log('\n📊 RESUMEN:\n');
console.log('Si ves ❌ arriba, esos son los archivos que necesitan corrección.');
console.log('Si todo está ✅, el problema está en Firebase CDN o caché del navegador.\n');
