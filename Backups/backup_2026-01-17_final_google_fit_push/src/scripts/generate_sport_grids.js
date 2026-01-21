import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SPORTS_DICTIONARY } from '../utils/sportsDictionaryMaster.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de columnas y filas
const PROVIDERS = [
    'Campo',
    'Google Fit',
    'Health Connect',
    'Fitbit',
    'Apple Health',
    'Huawei Health',
    'Samsung Health',
    'Wellnessfy'
];

const FIELDS = [
    'logId',
    'activityId',
    'activityName',
    'activityTypeId',
    'startTime',
    'duration',
    'calories',
    'distance',
    'steps',
    'averageHeartRate',
    'heartRateZones',
    'activeDuration',
    'elevationGain',
    'speed',
    'logType'
];

// Directorio de salida
const OUTPUT_DIR = path.join(__dirname, '../resources/sport_specs');

async function generateGrids() {
    // 1. Crear directorio si no existe
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`📁 Directorio creado: ${OUTPUT_DIR}`);
    }

    // 2. Iterar sobre cada deporte
    const sports = Object.keys(SPORTS_DICTIONARY);
    console.log(`🚀 Generando plantillas para ${sports.length} deportes...`);

    let count = 0;
    for (const sport of sports) {
        const filePath = path.join(OUTPUT_DIR, `${sport}.csv`);

        // Crear contenido CSV
        // Header
        let csvContent = PROVIDERS.join(',') + '\n';

        // Rows
        FIELDS.forEach(field => {
            // "field, , , , , , ,"
            const emptyCols = new Array(PROVIDERS.length - 1).fill('').join(',');
            csvContent += `${field},${emptyCols}\n`;
        });

        // Escribir archivo
        fs.writeFileSync(filePath, csvContent);
        count++;
    }

    console.log(`✅ ¡Listo! Se generaron ${count} archivos CSV en /src/resources/sport_specs/`);
}

generateGrids().catch(console.error);
